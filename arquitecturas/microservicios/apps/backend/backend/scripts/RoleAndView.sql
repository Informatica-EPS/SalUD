-- =========================
-- ROLES
-- =========================

-- Rol administrador (control total)
CREATE ROLE admin_clinica LOGIN PASSWORD 'password_admin';
GRANT CONNECT ON DATABASE mi_base_de_datos TO admin_clinica;
GRANT ALL PRIVILEGES ON DATABASE mi_base_de_datos TO admin_clinica;
GRANT ALL PRIVILEGES ON SCHEMA public TO admin_clinica;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin_clinica;

-- Rol aplicación (para la app clínica)
CREATE ROLE app_user LOGIN PASSWORD 'password_app';
GRANT CONNECT ON DATABASE mi_base_de_datos TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON pacientes TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON citas TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON detalles_cita TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ordenes TO app_user;
GRANT SELECT ON doctores, especialidades, horarios TO app_user;

-- Rol QAS (Quality Assurance, pruebas)
CREATE ROLE qas_user LOGIN PASSWORD 'password_qas';
GRANT CONNECT ON DATABASE mi_base_de_datos TO qas_user;
GRANT USAGE ON SCHEMA public TO qas_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO qas_user;

-- Rol logs/auditoría (roles y usuarios)
CREATE ROLE logs_user LOGIN PASSWORD 'password_logs';
GRANT CONNECT ON DATABASE mi_base_de_datos TO logs_user;
GRANT USAGE ON SCHEMA public TO logs_user;
GRANT SELECT ON rol TO logs_user;
GRANT SELECT ON roles_usuario TO logs_user;
GRANT SELECT ON usuarios TO logs_user;

-- =========================
-- VISTAS MATERIALIZADAS
-- =========================

-- Vista de citas con detalle de paciente y doctor
CREATE MATERIALIZED VIEW citas_resumen AS
SELECT c.id,
       c.tipo_cita,
       c.estado,
       p.id AS id_paciente,
       u.primer_nombre || ' ' || u.primer_apellido AS nombre_paciente,
       d.id AS id_doctor,
       du.primer_nombre || ' ' || du.primer_apellido AS nombre_doctor,
       e.nombre AS especialidad,
       h.fecha, h.hora_inicio, h.hora_fin
FROM citas c
JOIN pacientes p ON c.id_paciente = p.id
JOIN usuarios u ON p.id_usuario = u.id
JOIN doctores d ON c.id_doctor = d.id
JOIN usuarios du ON d.id_usuario = du.id
JOIN especialidades e ON d.especialidad = e.id
JOIN horarios h ON c.id_horario = h.id;

GRANT SELECT ON citas_resumen TO app_user;
GRANT SELECT ON citas_resumen TO qas_user;

-- Vista de agenda de doctores
CREATE MATERIALIZED VIEW agenda_doctores AS
SELECT d.id AS id_doctor,
       du.primer_nombre || ' ' || du.primer_apellido AS nombre_doctor,
       e.nombre AS especialidad,
       h.fecha, h.hora_inicio, h.hora_fin, h.estado
FROM doctores d
JOIN usuarios du ON d.id_usuario = du.id
JOIN especialidades e ON d.especialidad = e.id
JOIN horarios h ON d.id = h.id_doctor;

GRANT SELECT ON agenda_doctores TO app_user;
GRANT SELECT ON agenda_doctores TO qas_user;

-- Vista de órdenes médicas con detalle de cita y paciente
CREATE MATERIALIZED VIEW ordenes_resumen AS
SELECT o.id,
       o.descripcion,
       o.estado,
       o.fecha_vencimiento,
       o.cantidad_medicamento,
       c.tipo_cita,
       p.id AS id_paciente,
       u.primer_nombre || ' ' || u.primer_apellido AS nombre_paciente,
       d.id AS id_doctor,
       du.primer_nombre || ' ' || du.primer_apellido AS nombre_doctor,
       e.nombre AS especialidad
FROM ordenes o
JOIN citas c ON o.id_cita = c.id
JOIN pacientes p ON c.id_paciente = p.id
JOIN usuarios u ON p.id_usuario = u.id
JOIN doctores d ON c.id_doctor = d.id
JOIN usuarios du ON d.id_usuario = du.id
JOIN especialidades e ON o.especialidad = e.id;

GRANT SELECT ON ordenes_resumen TO app_user;
GRANT SELECT ON ordenes_resumen TO qas_user;

-- Vista de roles asignados a usuarios
CREATE MATERIALIZED VIEW roles_resumen AS
SELECT u.id,
       u.primer_nombre || ' ' || u.primer_apellido AS nombre_usuario,
       r.nombre AS rol
FROM usuarios u
JOIN roles_usuario ru ON u.id = ru.id_usuario
JOIN rol r ON ru.id_rol = r.id;

GRANT SELECT ON roles_resumen TO logs_user;
GRANT SELECT ON roles_resumen TO qas_user;

-- =========================
-- REFRESH POLICIES
-- =========================
REFRESH MATERIALIZED VIEW citas_resumen;
REFRESH MATERIALIZED VIEW agenda_doctores;
REFRESH MATERIALIZED VIEW ordenes_resumen;
REFRESH MATERIALIZED VIEW roles_resumen;
