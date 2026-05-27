-- Script de inicializacion de la base de datos EPS
-- Estructura unicamente (sin datos)

DO $$
BEGIN
    CREATE DOMAIN dom_tipo_documento AS VARCHAR(30)
    CHECK (VALUE IN ('CC', 'CE', 'PAS', 'PE', 'TI', 'RC'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE DOMAIN dom_sexo AS VARCHAR(15)
    CHECK (VALUE IN ('M', 'F','masculino', 'femenino', 'intersexual', 'no_responde'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    primer_nombre VARCHAR(100) NOT NULL,
    segundo_nombre VARCHAR(100),
    primer_apellido VARCHAR(100) NOT NULL,
    segundo_apellido VARCHAR(100) ,
    fecha_nacimiento DATE NOT NULL,
    lugar_nacimiento VARCHAR(150),
    direccion VARCHAR(200),
    documento VARCHAR(64) NOT NULL UNIQUE,
    tipo_documento dom_tipo_documento NOT NULL,
    usuario VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(64) NOT NULL,
    creado_por VARCHAR(100),
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    ultima_actualizacion TIMESTAMPTZ,
    actualizado_por VARCHAR(100),
    CONSTRAINT usuarios_tipo_documento_documento_uq UNIQUE (tipo_documento, documento)
);

CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(200),
    creado_por VARCHAR(100),
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    ultima_actualizacion TIMESTAMPTZ,
    actualizado_por VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS especialidades (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(200)
);

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
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ,
    creado_por VARCHAR(100),
    actualizado_por VARCHAR(100),
    CONSTRAINT ordenes_id_cita_fkey
        FOREIGN KEY (id_cita) REFERENCES citas(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT ordenes_especialidad_fkey
        FOREIGN KEY (especialidad) REFERENCES especialidades(id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

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

-- ==========================================
-- SISTEMA DE AUDITORIA
-- ==========================================

-- 1. USUARIOS
CREATE TABLE IF NOT EXISTS auditoria_usuarios (
    id_usuario BIGINT,
    primer_nombre VARCHAR(100),
    segundo_nombre VARCHAR(100),
    primer_apellido VARCHAR(100),
    segundo_apellido VARCHAR(100),
    fecha_nacimiento DATE,
    lugar_nacimiento VARCHAR(150),
    direccion VARCHAR(200),
    documento VARCHAR(64),
    tipo_documento dom_tipo_documento,
    usuario VARCHAR(80),
    email VARCHAR(150),
    password VARCHAR(64),
    momento TIMESTAMPTZ DEFAULT NOW(),
    usuario_bd VARCHAR(100) DEFAULT CURRENT_USER,
    movimiento VARCHAR(20),
    PRIMARY KEY (id_usuario, momento)
);

CREATE OR REPLACE FUNCTION fn_auditoria_usuarios() RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO auditoria_usuarios (id_usuario, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, fecha_nacimiento, lugar_nacimiento, direccion, documento, tipo_documento, usuario, email, password, movimiento)
        VALUES (OLD.id, OLD.primer_nombre, OLD.segundo_nombre, OLD.primer_apellido, OLD.segundo_apellido, OLD.fecha_nacimiento, OLD.lugar_nacimiento, OLD.direccion, OLD.documento, OLD.tipo_documento, OLD.usuario, OLD.email, OLD.password, 'DELETE');
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO auditoria_usuarios (id_usuario, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, fecha_nacimiento, lugar_nacimiento, direccion, documento, tipo_documento, usuario, email, password, movimiento)
        VALUES (OLD.id, OLD.primer_nombre, OLD.segundo_nombre, OLD.primer_apellido, OLD.segundo_apellido, OLD.fecha_nacimiento, OLD.lugar_nacimiento, OLD.direccion, OLD.documento, OLD.tipo_documento, OLD.usuario, OLD.email, OLD.password, 'UPDATE');
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_auditoria_usuarios_update AFTER UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION fn_auditoria_usuarios();
CREATE TRIGGER tr_auditoria_usuarios_delete AFTER DELETE ON usuarios FOR EACH ROW EXECUTE FUNCTION fn_auditoria_usuarios();

-- 2. ROLES
CREATE TABLE IF NOT EXISTS auditoria_roles (
    id_rol BIGINT,
    nombre VARCHAR(100),
    descripcion VARCHAR(200),
    momento TIMESTAMPTZ DEFAULT NOW(),
    usuario_bd VARCHAR(100) DEFAULT CURRENT_USER,
    movimiento VARCHAR(20),
    PRIMARY KEY (id_rol, momento)
);

CREATE OR REPLACE FUNCTION fn_auditoria_roles() RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO auditoria_roles (id_rol, nombre, descripcion, movimiento)
        VALUES (OLD.id, OLD.nombre, OLD.descripcion, 'DELETE');
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO auditoria_roles (id_rol, nombre, descripcion, movimiento)
        VALUES (OLD.id, OLD.nombre, OLD.descripcion, 'UPDATE');
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_auditoria_roles_update AFTER UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION fn_auditoria_roles();
CREATE TRIGGER tr_auditoria_roles_delete AFTER DELETE ON roles FOR EACH ROW EXECUTE FUNCTION fn_auditoria_roles();

-- 3. ESPECIALIDADES
CREATE TABLE IF NOT EXISTS auditoria_especialidades (
    id_especialidad BIGINT,
    nombre VARCHAR(50),
    descripcion VARCHAR(200),
    momento TIMESTAMPTZ DEFAULT NOW(),
    usuario_bd VARCHAR(100) DEFAULT CURRENT_USER,
    movimiento VARCHAR(20),
    PRIMARY KEY (id_especialidad, momento)
);

CREATE OR REPLACE FUNCTION fn_auditoria_especialidades() RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO auditoria_especialidades (id_especialidad, nombre, descripcion, movimiento)
        VALUES (OLD.id, OLD.nombre, OLD.descripcion, 'DELETE');
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO auditoria_especialidades (id_especialidad, nombre, descripcion, movimiento)
        VALUES (OLD.id, OLD.nombre, OLD.descripcion, 'UPDATE');
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_auditoria_especialidades_update AFTER UPDATE ON especialidades FOR EACH ROW EXECUTE FUNCTION fn_auditoria_especialidades();
CREATE TRIGGER tr_auditoria_especialidades_delete AFTER DELETE ON especialidades FOR EACH ROW EXECUTE FUNCTION fn_auditoria_especialidades();

-- 4. MEDICOS
CREATE TABLE IF NOT EXISTS auditoria_medicos (
    id_medico BIGINT,
    registro_medico VARCHAR,
    especialidad BIGINT,
    id_usuario BIGINT,
    momento TIMESTAMPTZ DEFAULT NOW(),
    usuario_bd VARCHAR(100) DEFAULT CURRENT_USER,
    movimiento VARCHAR(20),
    PRIMARY KEY (id_medico, momento)
);

CREATE OR REPLACE FUNCTION fn_auditoria_medicos() RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO auditoria_medicos (id_medico, registro_medico, especialidad, id_usuario, movimiento)
        VALUES (OLD.id, OLD.registro_medico, OLD.especialidad, OLD.id_usuario, 'DELETE');
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO auditoria_medicos (id_medico, registro_medico, especialidad, id_usuario, movimiento)
        VALUES (OLD.id, OLD.registro_medico, OLD.especialidad, OLD.id_usuario, 'UPDATE');
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_auditoria_medicos_update AFTER UPDATE ON medicos FOR EACH ROW EXECUTE FUNCTION fn_auditoria_medicos();
CREATE TRIGGER tr_auditoria_medicos_delete AFTER DELETE ON medicos FOR EACH ROW EXECUTE FUNCTION fn_auditoria_medicos();

-- 5. PACIENTES
CREATE TABLE IF NOT EXISTS auditoria_pacientes (
    id_paciente BIGINT,
    ocupacion VARCHAR(50),
    discapacidad VARCHAR(50),
    religion VARCHAR(50),
    etnia VARCHAR(50),
    identidad_genero VARCHAR(50),
    sexo dom_sexo,
    id_usuario BIGINT,
    momento TIMESTAMPTZ DEFAULT NOW(),
    usuario_bd VARCHAR(100) DEFAULT CURRENT_USER,
    movimiento VARCHAR(20),
    PRIMARY KEY (id_paciente, momento)
);

CREATE OR REPLACE FUNCTION fn_auditoria_pacientes() RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO auditoria_pacientes (id_paciente, ocupacion, discapacidad, religion, etnia, identidad_genero, sexo, id_usuario, movimiento)
        VALUES (OLD.id, OLD.ocupacion, OLD.discapacidad, OLD.religion, OLD.etnia, OLD.identidad_genero, OLD.sexo, OLD.id_usuario, 'DELETE');
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO auditoria_pacientes (id_paciente, ocupacion, discapacidad, religion, etnia, identidad_genero, sexo, id_usuario, movimiento)
        VALUES (OLD.id, OLD.ocupacion, OLD.discapacidad, OLD.religion, OLD.etnia, OLD.identidad_genero, OLD.sexo, OLD.id_usuario, 'UPDATE');
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_auditoria_pacientes_update AFTER UPDATE ON pacientes FOR EACH ROW EXECUTE FUNCTION fn_auditoria_pacientes();
CREATE TRIGGER tr_auditoria_pacientes_delete AFTER DELETE ON pacientes FOR EACH ROW EXECUTE FUNCTION fn_auditoria_pacientes();

-- 6. FRANJA HORARIA
CREATE TABLE IF NOT EXISTS auditoria_franja_horaria (
    id_franja BIGINT,
    fecha DATE,
    hora_inicio TIME,
    hora_fin TIME,
    estado VARCHAR(20),
    id_medico BIGINT,
    momento TIMESTAMPTZ DEFAULT NOW(),
    usuario_bd VARCHAR(100) DEFAULT CURRENT_USER,
    movimiento VARCHAR(20),
    PRIMARY KEY (id_franja, momento)
);

CREATE OR REPLACE FUNCTION fn_auditoria_franja_horaria() RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO auditoria_franja_horaria (id_franja, fecha, hora_inicio, hora_fin, estado, id_medico, movimiento)
        VALUES (OLD.id, OLD.fecha, OLD.hora_inicio, OLD.hora_fin, OLD.estado, OLD.id_medico, 'DELETE');
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO auditoria_franja_horaria (id_franja, fecha, hora_inicio, hora_fin, estado, id_medico, movimiento)
        VALUES (OLD.id, OLD.fecha, OLD.hora_inicio, OLD.hora_fin, OLD.estado, OLD.id_medico, 'UPDATE');
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_auditoria_franja_horaria_update AFTER UPDATE ON franja_horaria FOR EACH ROW EXECUTE FUNCTION fn_auditoria_franja_horaria();
CREATE TRIGGER tr_auditoria_franja_horaria_delete AFTER DELETE ON franja_horaria FOR EACH ROW EXECUTE FUNCTION fn_auditoria_franja_horaria();

-- 7. CITAS
CREATE TABLE IF NOT EXISTS auditoria_citas (
    id_cita BIGINT,
    tipo_cita VARCHAR(20),
    estado VARCHAR(20),
    id_paciente BIGINT,
    id_medico BIGINT,
    id_franja_horaria BIGINT,
    momento TIMESTAMPTZ DEFAULT NOW(),
    usuario_bd VARCHAR(100) DEFAULT CURRENT_USER,
    movimiento VARCHAR(20),
    PRIMARY KEY (id_cita, momento)
);

CREATE OR REPLACE FUNCTION fn_auditoria_citas() RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO auditoria_citas (id_cita, tipo_cita, estado, id_paciente, id_medico, id_franja_horaria, movimiento)
        VALUES (OLD.id, OLD.tipo_cita, OLD.estado, OLD.id_paciente, OLD.id_medico, OLD.id_franja_horaria, 'DELETE');
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO auditoria_citas (id_cita, tipo_cita, estado, id_paciente, id_medico, id_franja_horaria, movimiento)
        VALUES (OLD.id, OLD.tipo_cita, OLD.estado, OLD.id_paciente, OLD.id_medico, OLD.id_franja_horaria, 'UPDATE');
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_auditoria_citas_update AFTER UPDATE ON citas FOR EACH ROW EXECUTE FUNCTION fn_auditoria_citas();
CREATE TRIGGER tr_auditoria_citas_delete AFTER DELETE ON citas FOR EACH ROW EXECUTE FUNCTION fn_auditoria_citas();

-- 8. DETALLE CITA
CREATE TABLE IF NOT EXISTS auditoria_detalle_cita (
    id_cita BIGINT,
    motivo TEXT,
    antecedentes TEXT,
    anamnesis TEXT,
    revision_sistemas TEXT,
    examen_fisico TEXT,
    diagnostico TEXT,
    plan_manejo TEXT,
    evolucion TEXT,
    momento TIMESTAMPTZ DEFAULT NOW(),
    usuario_bd VARCHAR(100) DEFAULT CURRENT_USER,
    movimiento VARCHAR(20),
    PRIMARY KEY (id_cita, momento)
);

CREATE OR REPLACE FUNCTION fn_auditoria_detalle_cita() RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO auditoria_detalle_cita (id_cita, motivo, antecedentes, anamnesis, revision_sistemas, examen_fisico, diagnostico, plan_manejo, evolucion, movimiento)
        VALUES (OLD.id_cita, OLD.motivo, OLD.antecedentes, OLD.anamnesis, OLD.revision_sistemas, OLD.examen_fisico, OLD.diagnostico, OLD.plan_manejo, OLD.evolucion, 'DELETE');
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO auditoria_detalle_cita (id_cita, motivo, antecedentes, anamnesis, revision_sistemas, examen_fisico, diagnostico, plan_manejo, evolucion, movimiento)
        VALUES (OLD.id_cita, OLD.motivo, OLD.antecedentes, OLD.anamnesis, OLD.revision_sistemas, OLD.examen_fisico, OLD.diagnostico, OLD.plan_manejo, OLD.evolucion, 'UPDATE');
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_auditoria_detalle_cita_update AFTER UPDATE ON detalle_cita FOR EACH ROW EXECUTE FUNCTION fn_auditoria_detalle_cita();
CREATE TRIGGER tr_auditoria_detalle_cita_delete AFTER DELETE ON detalle_cita FOR EACH ROW EXECUTE FUNCTION fn_auditoria_detalle_cita();

-- 9. ORDENES
CREATE TABLE IF NOT EXISTS auditoria_ordenes (
    id_orden BIGINT,
    tipo VARCHAR(20),
    id_medicamento BIGINT,
    id_cita BIGINT,
    fecha_vencimiento TIMESTAMPTZ,
    estado VARCHAR(50),
    entidad_destino VARCHAR(100),
    especialidad BIGINT,
    descripcion VARCHAR(200),
    momento TIMESTAMPTZ DEFAULT NOW(),
    usuario_bd VARCHAR(100) DEFAULT CURRENT_USER,
    movimiento VARCHAR(20),
    PRIMARY KEY (id_orden, momento)
);

CREATE OR REPLACE FUNCTION fn_auditoria_ordenes() RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO auditoria_ordenes (id_orden, tipo, id_medicamento, id_cita, fecha_vencimiento, estado, entidad_destino, especialidad, descripcion, movimiento)
        VALUES (OLD.id, OLD.tipo, OLD.id_medicamento, OLD.id_cita, OLD.fecha_vencimiento, OLD.estado, OLD.entidad_destino, OLD.especialidad, OLD.descripcion, 'DELETE');
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO auditoria_ordenes (id_orden, tipo, id_medicamento, id_cita, fecha_vencimiento, estado, entidad_destino, especialidad, descripcion, movimiento)
        VALUES (OLD.id, OLD.tipo, OLD.id_medicamento, OLD.id_cita, OLD.fecha_vencimiento, OLD.estado, OLD.entidad_destino, OLD.especialidad, OLD.descripcion, 'UPDATE');
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_auditoria_ordenes_update AFTER UPDATE ON ordenes FOR EACH ROW EXECUTE FUNCTION fn_auditoria_ordenes();
CREATE TRIGGER tr_auditoria_ordenes_delete AFTER DELETE ON ordenes FOR EACH ROW EXECUTE FUNCTION fn_auditoria_ordenes();

-- 10. ROLES USUARIO
CREATE TABLE IF NOT EXISTS auditoria_roles_usuario (
    id_rol BIGINT,
    id_usuario BIGINT,
    momento TIMESTAMPTZ DEFAULT NOW(),
    usuario_bd VARCHAR(100) DEFAULT CURRENT_USER,
    movimiento VARCHAR(20),
    PRIMARY KEY (id_rol, id_usuario, momento)
);

CREATE OR REPLACE FUNCTION fn_auditoria_roles_usuario() RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO auditoria_roles_usuario (id_rol, id_usuario, movimiento)
        VALUES (OLD.id_rol, OLD.id_usuario, 'DELETE');
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO auditoria_roles_usuario (id_rol, id_usuario, movimiento)
        VALUES (OLD.id_rol, OLD.id_usuario, 'UPDATE');
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_auditoria_roles_usuario_update AFTER UPDATE ON roles_usuario FOR EACH ROW EXECUTE FUNCTION fn_auditoria_roles_usuario();
CREATE TRIGGER tr_auditoria_roles_usuario_delete AFTER DELETE ON roles_usuario FOR EACH ROW EXECUTE FUNCTION fn_auditoria_roles_usuario();
