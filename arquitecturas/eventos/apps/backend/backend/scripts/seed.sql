-- =============================================================
-- seed.sql  –  Limpia y repopula la base de datos SalUD
-- Contraseña de todos los usuarios: salud123
-- SHA-256("salud123") = 444d2690e7413101d5efc5296fc171bb6b6b486e58b52d63531dbf39b83b399b
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
    id          VARCHAR PRIMARY KEY,
    nombre      VARCHAR(50)  NOT NULL,
    descripcion VARCHAR(200)
);

CREATE TABLE doctores (
    id              SERIAL PRIMARY KEY,
    licencia_medica VARCHAR NOT NULL,
    especialidad    VARCHAR REFERENCES especialidades(id) ON DELETE CASCADE ON UPDATE CASCADE,
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
    fecha_vencimiento TIMESTAMPTZ,
    estado           VARCHAR(50),
    entidad_destino  VARCHAR(100),
    especialidad     VARCHAR(100) REFERENCES especialidades(id) ON DELETE CASCADE ON UPDATE CASCADE,
    descripcion      VARCHAR(200),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
    ('medico',   'Rol para médicos del sistema',   'seed', NOW()),
    ('paciente', 'Rol para pacientes del sistema', 'seed', NOW());

INSERT INTO especialidades (id, nombre, descripcion)
VALUES
    ('1', 'Cardiología',  'Especialidad del corazón y sistema cardiovascular'),
    ('2', 'Inmunología',  'Especialidad del sistema inmunológico');

-- ---------------------------------------------------------------
-- 4. Usuarios (5 en total: 3 médicos + 2 pacientes)
-- ---------------------------------------------------------------

INSERT INTO usuarios (primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
                      fecha_nacimiento, lugar_nacimiento, direccion,
                      documento, tipo_documento, usuario, email, password,
                      creado_por, fecha_creacion)
VALUES
    -- Médico 1 – Cardiología
    ('Carlos',  'Alberto', 'Ramírez', 'Gómez',
     '1980-03-15', 'Bogotá', 'Cra 7 # 45-12',
     '10000001', 'CC', 'dr.ramirez', 'dr.ramirez@salud.com',
     '444d2690e7413101d5efc5296fc171bb6b6b486e58b52d63531dbf39b83b399b',
     'seed', NOW()),

    -- Médico 2 – Inmunología
    ('Laura',   'Sofía',   'Torres',  'Medina',
     '1985-07-22', 'Medellín', 'Av 80 # 10-30',
     '10000002', 'CC', 'dr.torres', 'dr.torres@salud.com',
     '444d2690e7413101d5efc5296fc171bb6b6b486e58b52d63531dbf39b83b399b',
     'seed', NOW()),

    -- Médico 3 – Sin especialidad
    ('Andrés',  NULL,      'Morales', 'Ríos',
     '1990-11-05', 'Cali', 'Cll 15 # 8-90',
     '10000003', 'CC', 'dr.morales', 'dr.morales@salud.com',
     '444d2690e7413101d5efc5296fc171bb6b6b486e58b52d63531dbf39b83b399b',
     'seed', NOW()),

    -- Paciente 1
    ('María',   'Camila',  'López',   'Herrera',
     '1995-01-18', 'Bogotá', 'Cll 100 # 15-20',
     '20000001', 'CC', 'pac.lopez', 'pac.lopez@salud.com',
     '444d2690e7413101d5efc5296fc171bb6b6b486e58b52d63531dbf39b83b399b',
     'seed', NOW()),

    -- Paciente 2
    ('Juan',    'Pablo',   'Castro',  'Vargas',
     '2000-06-30', 'Barranquilla', 'Cra 50 # 75-40',
     '20000002', 'CC', 'pac.castro', 'pac.castro@salud.com',
     '444d2690e7413101d5efc5296fc171bb6b6b486e58b52d63531dbf39b83b399b',
     'seed', NOW());

-- ---------------------------------------------------------------
-- 5. Doctores
-- ---------------------------------------------------------------

INSERT INTO doctores (licencia_medica, especialidad, id_usuario, creado_por, created_at, updated_at)
VALUES
    ('LM-10001', '1', (SELECT id FROM usuarios WHERE usuario = 'dr.ramirez'),  1, NOW(), NOW()),
    ('LM-10002', '2', (SELECT id FROM usuarios WHERE usuario = 'dr.torres'),   1, NOW(), NOW()),
    ('LM-10003', NULL,(SELECT id FROM usuarios WHERE usuario = 'dr.morales'),  1, NOW(), NOW());

-- ---------------------------------------------------------------
-- 6. Pacientes
-- ---------------------------------------------------------------

INSERT INTO pacientes (ocupacion, sexo, id_usuario, creado_por, created_at, updated_at)
VALUES
    ('Ingeniera', 'F', (SELECT id FROM usuarios WHERE usuario = 'pac.lopez'),  1, NOW(), NOW()),
    ('Estudiante','M', (SELECT id FROM usuarios WHERE usuario = 'pac.castro'), 1, NOW(), NOW());

-- ---------------------------------------------------------------
-- 7. Asignar roles
-- ---------------------------------------------------------------

INSERT INTO roles_usuario (id_rol, id_usuario)
SELECT r.id, u.id FROM rol r, usuarios u
WHERE r.nombre = 'medico'
  AND u.usuario IN ('dr.ramirez', 'dr.torres', 'dr.morales');

INSERT INTO roles_usuario (id_rol, id_usuario)
SELECT r.id, u.id FROM rol r, usuarios u
WHERE r.nombre = 'paciente'
  AND u.usuario IN ('pac.lopez', 'pac.castro');
