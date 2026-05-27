-- =============================================================
-- seed.sql – Limpia y repobla la base de datos SalUD
-- Contraseña de todos los usuarios: salud123
-- Usando: encode(digest('salud123', 'sha256'), 'hex')
-- =============================================================

-- ---------------------------------------------------------------
-- 1. Eliminar tablas en orden inverso de dependencias
-- ---------------------------------------------------------------
DROP TABLE IF EXISTS roles_usuario   CASCADE;
DROP TABLE IF EXISTS detalles_cita   CASCADE;
DROP TABLE IF EXISTS ordenes         CASCADE;
DROP TABLE IF EXISTS citas           CASCADE;
DROP TABLE IF EXISTS horarios        CASCADE;
DROP TABLE IF EXISTS pacientes       CASCADE;
DROP TABLE IF EXISTS doctores        CASCADE;
DROP TABLE IF EXISTS especialidades  CASCADE;
DROP TABLE IF EXISTS rol             CASCADE;
DROP TABLE IF EXISTS usuarios        CASCADE;
DROP TABLE IF EXISTS "SequelizeMeta" CASCADE;

-- ---------------------------------------------------------------
-- 2. Crear tablas
-- ---------------------------------------------------------------

CREATE TABLE usuarios (
    id                  BIGSERIAL PRIMARY KEY,
    primer_nombre       VARCHAR(100),
    segundo_nombre      VARCHAR(100),
    primer_apellido     VARCHAR(100),
    segundo_apellido    VARCHAR(100),
    fecha_nacimiento    DATE,
    lugar_nacimiento    VARCHAR(150),
    direccion           VARCHAR(200),
    documento           VARCHAR(64)  UNIQUE,
    tipo_documento      VARCHAR(30),
    usuario             VARCHAR(80)  UNIQUE,
    email               VARCHAR(150) UNIQUE,
    password            VARCHAR(64),
    creado_por          VARCHAR(100),
    fecha_creacion      TIMESTAMPTZ DEFAULT NOW(),
    ultima_actualizacion TIMESTAMPTZ,
    actualizado_por     VARCHAR(100)
);

CREATE TABLE rol (
    id                  BIGSERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    descripcion         VARCHAR(200),
    creado_por          VARCHAR(100),
    fecha_creacion      TIMESTAMPTZ,
    ultima_actualizacion TIMESTAMPTZ,
    actualizado_por     VARCHAR(100)
);

CREATE TABLE especialidades (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(50)  NOT NULL,
    descripcion VARCHAR(200)
);

CREATE TABLE doctores (
    id              SERIAL PRIMARY KEY,
    licencia_medica VARCHAR NOT NULL,
    especialidad    INTEGER REFERENCES especialidades(id) ON DELETE CASCADE ON UPDATE CASCADE,
    id_usuario      BIGINT  UNIQUE REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE,
    creado_por      INTEGER,
    actualizado_por INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pacientes (
    id              SERIAL PRIMARY KEY,
    ocupacion       VARCHAR,
    discapacidad    VARCHAR,
    religion        VARCHAR,
    etnia           VARCHAR,
    identidad_genero VARCHAR,
    sexo            VARCHAR,
    id_usuario      BIGINT REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE,
    creado_por      INTEGER,
    actualizado_por INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE horarios (
    id              SERIAL PRIMARY KEY,
    fecha           DATE,
    hora_inicio     TIME,
    hora_fin        TIME,
    estado          VARCHAR,
    id_doctor       INTEGER REFERENCES doctores(id) ON DELETE SET NULL ON UPDATE CASCADE,
    creado_por      INTEGER,
    actualizado_por INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE citas (
    id              SERIAL PRIMARY KEY,
    tipo_cita       VARCHAR,
    estado          VARCHAR,
    id_paciente     INTEGER REFERENCES pacientes(id) ON DELETE SET NULL ON UPDATE CASCADE,
    id_doctor       INTEGER REFERENCES doctores(id)  ON DELETE SET NULL ON UPDATE CASCADE,
    id_horario      INTEGER REFERENCES horarios(id)  ON DELETE SET NULL ON UPDATE CASCADE,
    creado_por      INTEGER,
    actualizado_por INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE detalles_cita (
    id               SERIAL PRIMARY KEY,
    motivo           TEXT,
    antecedentes     TEXT,
    anamnesis        TEXT,
    revision_sistemas TEXT,
    examen_fisico    TEXT,
    diagnostico      TEXT,
    plan_manejo      TEXT,
    evolucion        TEXT,
    id_cita          INTEGER REFERENCES citas(id) ON DELETE SET NULL ON UPDATE CASCADE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ordenes (
    id               SERIAL PRIMARY KEY,
    id_cita          INTEGER REFERENCES citas(id) ON DELETE SET NULL ON UPDATE CASCADE,
    id_medicamento   INTEGER,
    fecha_vencimiento TIMESTAMPTZ,
    estado           VARCHAR(50),
    entidad_destino  VARCHAR(100),
    especialidad     INTEGER REFERENCES especialidades(id) ON DELETE CASCADE ON UPDATE CASCADE,
    descripcion      VARCHAR(200),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cantidad_medicamento   INTEGER DEFAULT 0
);

CREATE TABLE roles_usuario (
    id_rol    BIGINT NOT NULL REFERENCES rol(id)      ON DELETE CASCADE ON UPDATE CASCADE,
    id_usuario BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (id_rol, id_usuario)
);

CREATE UNIQUE INDEX IF NOT EXISTS usuarios_documento_unique ON usuarios (documento);
CREATE UNIQUE INDEX IF NOT EXISTS usuarios_usuario_unique   ON usuarios (usuario);
CREATE UNIQUE INDEX IF NOT EXISTS usuarios_email_unique     ON usuarios (email);
CREATE UNIQUE INDEX IF NOT EXISTS doctores_id_usuario_unique ON doctores (id_usuario);

-- ---------------------------------------------------------------
-- 3. Datos de referencia: roles y especialidades
-- ---------------------------------------------------------------

INSERT INTO rol (nombre, descripcion, creado_por, fecha_creacion)
VALUES
    ('Medico',   'Rol para médicos del sistema',   'seed', NOW()),
    ('Paciente', 'Rol para pacientes del sistema', 'seed', NOW()),
    ('AdminMedicamentos', 'Rol para administradores de medicamentos', 'seed', NOW()),
	('Admin', 'Rol para administradores del sistema', 'seed', NOW());

INSERT INTO especialidades (id, nombre, descripcion)
VALUES
    (1, 'N/A',  'N/A'),
    (2, 'Cardiología',  'Especialidad del corazón y sistema cardiovascular'),
    (3, 'Inmunología',  'Especialidad del sistema inmunológico');

-- ---------------------------------------------------------------
-- 4. Usuarios (5 en total: 3 médicos + 2 pacientes)
-- ---------------------------------------------------------------

-- =============================================================
-- Activar extensión para usar SHA256
-- =============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------
-- 1. Insertar roles (DDL: table 'roles')
-- ---------------------------------------------------------------
INSERT INTO roles (nombre, descripcion, creado_por)
VALUES
    ('Medico', 'Rol para médicos del sistema', 'seed'),
    ('Paciente', 'Rol para pacientes del sistema', 'seed'),
    ('AdminMedicamentos', 'Rol para administradores de medicamentos', 'seed'),
    ('Admin', 'Rol para administradores del sistema', 'seed');

-- ---------------------------------------------------------------
-- 2. Insertar especialidades (DDL: table 'especialidades')
-- ---------------------------------------------------------------
INSERT INTO especialidades (nombre, descripcion)
VALUES
    ('N/A', 'N/A'),
    ('Cardiología', 'Especialidad del corazón y sistema cardiovascular'),
    ('Inmunología', 'Especialidad del sistema inmunológico');

-- ---------------------------------------------------------------
-- 3. Insertar usuarios (DDL: table 'usuarios')
-- ---------------------------------------------------------------
INSERT INTO usuarios (
    primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
    fecha_nacimiento, lugar_nacimiento, direccion,
    documento, tipo_documento, usuario, email, password, creado_por
)
VALUES
    ('Carlos', 'Alberto', 'Ramírez', 'Gómez', '1980-03-15', 'Bogotá', 'Cra 7 # 45-12',
     encode(digest('10000001', 'sha256'), 'hex'), 'CC', 'dr.ramirez', 'dr.ramirez@salud.com', encode(digest('salud123', 'sha256'), 'hex'), 'seed'),
    ('Laura', 'Sofía', 'Torres', 'Medina', '1985-07-22', 'Medellín', 'Av 80 # 10-30',
     encode(digest('10000002', 'sha256'), 'hex'), 'CC', 'dr.torres', 'dr.torres@salud.com', encode(digest('salud123', 'sha256'), 'hex'), 'seed'),
    ('Andrés', NULL, 'Morales', 'Ríos', '1990-11-05', 'Cali', 'Cll 15 # 8-90',
     encode(digest('10000003', 'sha256'), 'hex'), 'CC', 'dr.morales', 'dr.morales@salud.com', encode(digest('salud123', 'sha256'), 'hex'), 'seed'),
    ('María', 'Camila', 'López', 'Herrera', '1995-01-18', 'Bogotá', 'Cll 100 # 15-20',
     encode(digest('20000001', 'sha256'), 'hex'), 'CC', 'pac.lopez', 'pac.lopez@salud.com', encode(digest('salud123', 'sha256'), 'hex'), 'seed'),
    ('Juan', 'Pablo', 'Castro', 'Vargas', '2000-06-30', 'Barranquilla', 'Cra 50 # 75-40',
     encode(digest('20000002', 'sha256'), 'hex'), 'CC', 'pac.castro', 'pac.castro@salud.com', encode(digest('salud123', 'sha256'), 'hex'), 'seed'),
    ('Paula', NULL, 'Garcia', 'Perdomo', '2001-06-30', 'Bogotá', 'Cra 50 # 75-40',
     encode(digest('30000001', 'sha256'), 'hex'), 'CC', 'pau.garcia', 'pagp@salud.com', encode(digest('salud123', 'sha256'), 'hex'), 'seed'),
    ('Ana', 'María', 'Alonso', 'Maldonado', '2001-06-30', 'Bogotá', 'Cra 50 # 75-40',
     encode(digest('40000001', 'sha256'), 'hex'), 'CC', 'ana.mal', 'anamal@salud.com', encode(digest('salud123', 'sha256'), 'hex'), 'seed')
ON CONFLICT (usuario) DO NOTHING;

-- ---------------------------------------------------------------
-- 4. Insertar médicos y pacientes (DDL: tables 'medicos', 'pacientes')
-- ---------------------------------------------------------------
-- IDs de usuarios (1 a 3 para médicos, 4 a 5 para pacientes)
INSERT INTO medicos (registro_medico, especialidad, id_usuario, creado_por)
VALUES
    ('LM-10001', 2, 1, 'seed'),
    ('LM-10002', 3, 2, 'seed'),
    ('LM-10003', null, 3, 'seed')
ON CONFLICT (id_usuario) DO NOTHING;

INSERT INTO pacientes (ocupacion, identidad_genero, sexo, id_usuario, creado_por)
VALUES
    ('Ingeniera', 'Femenino', 'F', 4, 'seed'),
    ('Estudiante', 'Masculino', 'M', 5, 'seed')
ON CONFLICT (id_usuario) DO NOTHING;

-- ---------------------------------------------------------------
-- 5. Insertar horarios (DDL: table 'franja_horaria')
-- Insertar horarios cada día de por medio hasta el 6 de junio de 2026
-- ---------------------------------------------------------------
INSERT INTO franja_horaria (fecha, hora_inicio, hora_fin, estado, creado_por, id_medico)
SELECT
    dia::date,
    hora_ini,
    hora_ini + interval '30 minutes',
    'disponible',
    'seed',
    doctor_id
FROM generate_series('2026-05-27'::date, '2026-06-06'::date, '2 days'::interval) as dia,
     (VALUES ('08:00:00'::time, 1), ('09:00:00'::time, 2), ('10:00:00'::time, 3)) as slots(hora_ini, doctor_id)
ON CONFLICT ON CONSTRAINT franja_horaria_medico_fecha_hora_uq DO NOTHING;

-- ---------------------------------------------------------------
-- 6. Insertar citas y detalles (DDL: tables 'citas', 'detalle_cita')
-- ---------------------------------------------------------------
INSERT INTO citas (tipo_cita, estado, creado_por, id_paciente, id_medico, id_franja_horaria)
VALUES
    ('consulta', 'programado', 'seed', 1, 1, 1),
    ('control', 'programado', 'seed', 2, 2, 2);

INSERT INTO detalle_cita (id_cita, motivo, antecedentes, anamnesis, revision_sistemas, examen_fisico, diagnostico, plan_manejo, evolucion)
VALUES
    (1, 'Dolor de cabeza', 'Sin antecedentes', 'Paciente refiere dolor leve', 'Sin hallazgos', 'Normal', 'Cefalea tensional', 'Analgésico y reposo', 'Estable'),
    (2, 'Control general', 'Rinitis alergica', 'Sin sintomas agudos', 'Sin hallazgos', 'Normal', 'Sin cambios', 'Continuar manejo', 'Estable')
ON CONFLICT (id_cita) DO NOTHING;

-- ---------------------------------------------------------------
-- 7. Insertar órdenes (DDL: table 'ordenes')
-- ---------------------------------------------------------------
INSERT INTO ordenes (tipo, id_medicamento, id_cita, fecha_vencimiento, estado, entidad_destino, especialidad, descripcion, creado_por)
VALUES
    ('medicamento', 2, 1, NOW() + INTERVAL '30 days', 'autorizada', 'Farmacia EPS', 2, 'Acetaminofen 500mg cada 8h', 'seed'),
    ('medicamento', 3, 2, NOW() + INTERVAL '45 days', 'autorizada', 'Farmacia EPS', 2, 'Ibuprofeno 400mg cada 12h', 'seed');

-- ---------------------------------------------------------------
-- 8. Insertar roles de usuario (DDL: table 'roles_usuario')
-- ---------------------------------------------------------------
INSERT INTO roles_usuario (id_rol, id_usuario)
SELECT r.id, u.id FROM roles r, usuarios u
WHERE r.nombre = 'Medico' AND u.usuario IN ('dr.ramirez', 'dr.torres', 'dr.morales')
ON CONFLICT (id_rol, id_usuario) DO NOTHING;

INSERT INTO roles_usuario (id_rol, id_usuario)
SELECT r.id, u.id FROM roles r, usuarios u
WHERE r.nombre = 'Paciente' AND u.usuario IN ('pac.lopez', 'pac.castro')
ON CONFLICT (id_rol, id_usuario) DO NOTHING;

INSERT INTO roles_usuario (id_rol, id_usuario)
SELECT r.id, u.id FROM roles r, usuarios u
WHERE r.nombre = 'AdminMedicamentos' AND u.usuario = 'pau.garcia'
ON CONFLICT (id_rol, id_usuario) DO NOTHING;

INSERT INTO roles_usuario (id_rol, id_usuario)
SELECT r.id, u.id FROM roles r, usuarios u
WHERE r.nombre = 'Admin' AND u.usuario = 'ana.mal'
ON CONFLICT (id_rol, id_usuario) DO NOTHING;
