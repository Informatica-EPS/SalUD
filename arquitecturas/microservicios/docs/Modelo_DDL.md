## Modelo DDL (PostgreSQL)

Este documento define el DDL objetivo del diagrama relacional de microservicios (`EPS` y `Microservicio Medicamentos`) con las restricciones de integridad acordadas.

## Restricciones clave (resumen)

- `UNIQUE`: evita duplicados en identificadores funcionales (usuario, email, documento, combinaciones clave).
- `DOMINIOS`: centralizan validaciones de valores controlados (`tipo_documento`, `tipo_movimiento`, `sexo`).
- `CHECK`: refuerzan reglas de negocio en cantidades, inventario y rangos horarios.

## Dominios

```sql
CREATE DOMAIN dom_tipo_documento AS VARCHAR(30)
CHECK (VALUE IN ('CC', 'CE', 'PAS', 'PE', 'TI', 'RC'));

CREATE DOMAIN dom_tipo_movimiento AS VARCHAR(20)
CHECK (VALUE IN ('entrada', 'salida', 'despacho'));

CREATE DOMAIN dom_sexo AS VARCHAR(15)
CHECK (VALUE IN ('M', 'F','masculino', 'femenino', 'intersexual', 'no_responde'));
```

## Checks

```sql
-- Inventario no puede quedar negativo
CHECK (total >= 0)

-- Movimientos siempre en cantidades positivas
CHECK (cantidad > 0)

-- Rango horario valido
CHECK (hora_inicio < hora_fin)
```

## DDL - EPS

```sql
-- =========================
-- Tabla: usuarios
-- =========================
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    primer_nombre VARCHAR(100) NOT NULL,
    segundo_nombre VARCHAR(100) NOT NULL,
    primer_apellido VARCHAR(100) NOT NULL,
    segundo_apellido VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    lugar_nacimiento VARCHAR(150),
    direccion VARCHAR(200),
    documento VARCHAR(64) NOT NULL,
    tipo_documento dom_tipo_documento NOT NULL,
    usuario VARCHAR(80) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password VARCHAR(64) NOT NULL,
    creado_por VARCHAR(100),
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    ultima_actualizacion TIMESTAMPTZ,
    actualizado_por VARCHAR(100),
    CONSTRAINT usuarios_documento_uq UNIQUE (documento),
    CONSTRAINT usuarios_usuario_uq UNIQUE (usuario),
    CONSTRAINT usuarios_email_uq UNIQUE (email),
    CONSTRAINT usuarios_tipo_documento_documento_uq UNIQUE (tipo_documento, documento)
);

-- =========================
-- Tabla: roles
-- =========================
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(200),
    creado_por VARCHAR(100),
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    ultima_actualizacion TIMESTAMPTZ,
    actualizado_por VARCHAR(100)
);

-- =========================
-- Tabla: especialidades
-- =========================
CREATE TABLE IF NOT EXISTS especialidades (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(200)
);

-- =========================
-- Tabla: medicos
-- =========================
CREATE TABLE IF NOT EXISTS medicos (
    id BIGSERIAL PRIMARY KEY,
    registro_medico VARCHAR NOT NULL,
    especialidad BIGINT,
    creado_por VARCHAR(100),
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    ultima_actualizacion TIMESTAMPTZ,
    actualizado_por VARCHAR(100),
    id_usuario BIGINT UNIQUE,
    CONSTRAINT medicos_especialidad_fkey
        FOREIGN KEY (especialidad) REFERENCES especialidades(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT medicos_id_usuario_fkey
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- =========================
-- Tabla: pacientes
-- =========================
CREATE TABLE IF NOT EXISTS pacientes (
    id BIGSERIAL PRIMARY KEY,
    ocupacion VARCHAR(50),
    discapacidad VARCHAR(50),
    religion VARCHAR(50),
    etnia VARCHAR(50),
    identidad_genero VARCHAR(50) NOT NULL,
    sexo dom_sexo NOT NULL,
    creado_por VARCHAR(100),
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    ultima_actualizacion TIMESTAMPTZ,
    actualizado_por VARCHAR(100),
    id_usuario BIGINT UNIQUE,
    CONSTRAINT pacientes_id_usuario_fkey
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- =========================
-- Tabla: franja_horaria
-- =========================
CREATE TABLE IF NOT EXISTS franja_horaria (
    id BIGSERIAL PRIMARY KEY,
    fecha DATE,
    hora_inicio TIME,
    hora_fin TIME,
    estado VARCHAR(20),
    creado_por VARCHAR(100),
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    ultima_actualizacion TIMESTAMPTZ,
    actualizado_por VARCHAR(100),
    id_medico BIGINT NOT NULL,
    CONSTRAINT franja_horaria_rango_hora_ck CHECK (hora_inicio < hora_fin),
    CONSTRAINT franja_horaria_medico_fecha_hora_uq UNIQUE (id_medico, fecha, hora_inicio, hora_fin),
    CONSTRAINT franja_horaria_id_medico_fkey
        FOREIGN KEY (id_medico) REFERENCES medicos(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================
-- Tabla: citas
-- =========================
CREATE TABLE IF NOT EXISTS citas (
    id BIGSERIAL PRIMARY KEY,
    tipo_cita VARCHAR(20) NOT NULL,
    estado VARCHAR(20) NOT NULL,
    creado_por VARCHAR(100),
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    ultima_actualizacion TIMESTAMPTZ,
    actualizado_por VARCHAR(100),
    id_paciente BIGINT NOT NULL,
    id_medico BIGINT NOT NULL,
    id_franja_horaria BIGINT NOT NULL,
    CONSTRAINT citas_id_paciente_fkey
        FOREIGN KEY (id_paciente) REFERENCES pacientes(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT citas_id_medico_fkey
        FOREIGN KEY (id_medico) REFERENCES medicos(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT citas_id_franja_horaria_fkey
        FOREIGN KEY (id_franja_horaria) REFERENCES franja_horaria(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================
-- Tabla: detalle_cita
-- =========================
CREATE TABLE IF NOT EXISTS detalle_cita (
    id_cita BIGINT PRIMARY KEY,
    motivo TEXT,
    antecedentes TEXT,
    anamnesis TEXT,
    revision_sistemas TEXT,
    examen_fisico TEXT,
    diagnostico TEXT,
    plan_manejo TEXT,
    evolucion TEXT,
    CONSTRAINT detalle_cita_id_cita_fkey
        FOREIGN KEY (id_cita) REFERENCES citas(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================
-- Tabla: ordenes
-- =========================
CREATE TABLE IF NOT EXISTS ordenes (
    id BIGSERIAL PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL,
    id_medicamento BIGINT,
    id_cita BIGINT NOT NULL,
    fecha_vencimiento TIMESTAMPTZ NOT NULL,
    estado VARCHAR(50),
    entidad_destino VARCHAR(100),
    especialidad BIGINT,
    descripcion VARCHAR(200),
    cantidad_medicamento INT,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ,
    CONSTRAINT ordenes_id_cita_fkey
        FOREIGN KEY (id_cita) REFERENCES citas(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT ordenes_especialidad_fkey
        FOREIGN KEY (especialidad) REFERENCES especialidades(id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- =========================
-- Tabla: roles_usuario
-- =========================
CREATE TABLE IF NOT EXISTS roles_usuario (
    id_rol BIGINT NOT NULL,
    id_usuario BIGINT NOT NULL,
    PRIMARY KEY (id_rol, id_usuario),
    CONSTRAINT roles_usuario_id_rol_fkey
        FOREIGN KEY (id_rol) REFERENCES roles(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT roles_usuario_id_usuario_fkey
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);
```

## DDL - Microservicio Medicamentos

```sql
-- =========================
-- Tabla: medicamentos
-- =========================
CREATE TABLE IF NOT EXISTS medicamentos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL,
    presentacion VARCHAR(20) NOT NULL,
    concentracion VARCHAR(20) NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    creado_por VARCHAR(100),
    ultima_actualizacion TIMESTAMPTZ,
    actualizado_por VARCHAR(100)
);

-- =========================
-- Tabla: inventario
-- =========================
CREATE TABLE IF NOT EXISTS inventario (
    id_medicamento BIGINT PRIMARY KEY,
    total INT NOT NULL DEFAULT 0,
    CONSTRAINT inventario_total_nonnegative_ck CHECK (total >= 0),
    CONSTRAINT fk_inventario_medicamento
        FOREIGN KEY (id_medicamento) REFERENCES medicamentos(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================
-- Tabla: movimientos
-- =========================
CREATE TABLE IF NOT EXISTS movimientos (
    id BIGSERIAL PRIMARY KEY,
    id_medicamento BIGINT,
    tipo_movimiento dom_tipo_movimiento NOT NULL,
    cantidad INT NOT NULL DEFAULT 0,
    id_orden BIGINT,
    creado_por VARCHAR(100),
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT movimientos_cantidad_positive_ck CHECK (cantidad > 0),
    CONSTRAINT fk_movimientos_medicamento
    FOREIGN KEY (id_medicamento) REFERENCES medicamentos(id)
    ON DELETE CASCADE ON UPDATE CASCADE
    );
```

## Sistema de Auditoría

Se ha implementado un sistema de auditoría basado en triggers para todas las tablas principales. Este sistema registra el estado anterior (`OLD`) de los registros ante operaciones de `UPDATE` o `DELETE`.

### Estrategia de Auditoría

1.  **Tablas de Auditoría**: Nombradas como `auditoria_<nombre_tabla>`.
2.  **Llave Primaria**: Llave compuesta por el `ID` de la entidad original y el `momento` del cambio.
3.  **Columnas Adicionales**:
    *   `momento`: Timestamp de la operación (por defecto `NOW()`).
    *   `usuario_bd`: Usuario de la base de datos que ejecutó la acción (`CURRENT_USER`).
    *   `movimiento`: Tipo de operación realizada (`UPDATE` o `DELETE`).
4.  **Triggers**: Se disparan `AFTER UPDATE` y `AFTER DELETE` para cada fila (`FOR EACH ROW`).

### Ejemplo de Estructura de Auditoría (EPS - Usuarios)

```sql
    CREATE TABLE IF NOT EXISTS auditoria_usuarios (
    id_usuario BIGINT,
    -- ... columnas de la tabla original ...
    momento TIMESTAMPTZ DEFAULT NOW(),
    usuario_bd VARCHAR(100) DEFAULT CURRENT_USER,
    movimiento VARCHAR(20),
    PRIMARY KEY (id_usuario, momento)
    );
```

### Ejemplo de Estructura de Auditoría (Medicamentos)

```sql
    CREATE TABLE IF NOT EXISTS auditoria_medicamentos (
    id_medicamento BIGINT,
    nombre VARCHAR(20),
    presentacion VARCHAR(20),
    concentracion VARCHAR(20),
    momento TIMESTAMPTZ DEFAULT NOW(),
    usuario_bd VARCHAR(100) DEFAULT CURRENT_USER,
    movimiento VARCHAR(20),
    PRIMARY KEY (id_medicamento, momento)
    );
```

### Triggers Implementados

| Servicio | Tabla Auditada | Triggers |
| :--- | :--- | :--- |
| **Medicaments** | `medicamentos` | `tr_auditoria_medicamentos_update`, `tr_auditoria_medicamentos_delete` |
| **EPS (Backend)** | `usuarios` | `tr_auditoria_usuarios_update`, `tr_auditoria_usuarios_delete` |
| **EPS (Backend)** | `roles` | `tr_auditoria_roles_update`, `tr_auditoria_roles_delete` |
| **EPS (Backend)** | `especialidades` | `tr_auditoria_especialidades_update`, `tr_auditoria_especialidades_delete` |
| **EPS (Backend)** | `medicos` | `tr_auditoria_medicos_update`, `tr_auditoria_medicos_delete` |
| **EPS (Backend)** | `pacientes` | `tr_auditoria_pacientes_update`, `tr_auditoria_pacientes_delete` |
| **EPS (Backend)** | `franja_horaria` | `tr_auditoria_franja_horaria_update`, `tr_auditoria_franja_horaria_delete` |
| **EPS (Backend)** | `citas` | `tr_auditoria_citas_update`, `tr_auditoria_citas_delete` |
| **EPS (Backend)** | `detalle_cita` | `tr_auditoria_detalle_cita_update`, `tr_auditoria_detalle_cita_delete` |
| **EPS (Backend)** | `ordenes` | `tr_auditoria_ordenes_update`, `tr_auditoria_ordenes_delete` |
| **EPS (Backend)** | `roles_usuario` | `tr_auditoria_roles_usuario_update`, `tr_auditoria_roles_usuario_delete` |


