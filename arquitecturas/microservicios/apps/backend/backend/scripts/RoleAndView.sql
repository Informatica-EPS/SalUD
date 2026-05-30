-- =========================
-- ROLES
-- =========================

CREATE ROLE admin_clinica LOGIN PASSWORD 'Adm1nCl1n!c@2026';
GRANT CONNECT ON DATABASE mi_base_de_datos TO admin_clinica;
GRANT ALL PRIVILEGES ON DATABASE mi_base_de_datos TO admin_clinica;
GRANT ALL PRIVILEGES ON SCHEMA public TO admin_clinica;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin_clinica;

CREATE ROLE app_user LOGIN PASSWORD 'AppUs3r#Clin1c2026';
GRANT CONNECT ON DATABASE mi_base_de_datos TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON pacientes TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON citas TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON detalle_cita TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ordenes TO app_user;
GRANT SELECT ON medicos, especialidades, franja_horaria TO app_user;

CREATE ROLE qas_user LOGIN PASSWORD 'Q@sT3stCl1n1c2026';
GRANT CONNECT ON DATABASE mi_base_de_datos TO qas_user;
GRANT USAGE ON SCHEMA public TO qas_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO qas_user;

CREATE ROLE logs_user LOGIN PASSWORD 'L0gsCl1n1c#2026';
GRANT CONNECT ON DATABASE mi_base_de_datos TO logs_user;
GRANT USAGE ON SCHEMA public TO logs_user;
GRANT SELECT ON roles TO logs_user;
GRANT SELECT ON roles_usuario TO logs_user;
GRANT SELECT ON usuarios TO logs_user;

-- =========================
-- VISTAS MATERIALIZADAS
-- =========================

CREATE MATERIALIZED VIEW citas_resumen AS
SELECT c.id,
       c.tipo_cita,
       c.estado,
       p.id AS id_paciente,
       u.primer_nombre || ' ' || u.primer_apellido AS nombre_paciente,
       m.id AS id_medico,
       um.primer_nombre || ' ' || um.primer_apellido AS nombre_medico,
       e.nombre AS especialidad,
       f.fecha, f.hora_inicio, f.hora_fin
FROM citas c
JOIN pacientes p ON c.id_paciente = p.id
JOIN usuarios u ON p.id_usuario = u.id
JOIN medicos m ON c.id_medico = m.id
JOIN usuarios um ON m.id_usuario = um.id
JOIN especialidades e ON m.especialidad = e.id
JOIN franja_horaria f ON c.id_franja_horaria = f.id;

GRANT SELECT ON citas_resumen TO app_user;
GRANT SELECT ON citas_resumen TO qas_user;

CREATE MATERIALIZED VIEW agenda_medicos AS
SELECT m.id AS id_medico,
       um.primer_nombre || ' ' || um.primer_apellido AS nombre_medico,
       e.nombre AS especialidad,
       f.fecha, f.hora_inicio, f.hora_fin, f.estado
FROM medicos m
JOIN usuarios um ON m.id_usuario = um.id
JOIN especialidades e ON m.especialidad = e.id
JOIN franja_horaria f ON m.id = f.id_medico;

GRANT SELECT ON agenda_medicos TO app_user;
GRANT SELECT ON agenda_medicos TO qas_user;

CREATE MATERIALIZED VIEW ordenes_resumen AS
SELECT o.id,
       o.descripcion,
       o.estado,
       o.fecha_vencimiento,
       c.tipo_cita,
       p.id AS id_paciente,
       u.primer_nombre || ' ' || u.primer_apellido AS nombre_paciente,
       m.id AS id_medico,
       um.primer_nombre || ' ' || um.primer_apellido AS nombre_medico,
       e.nombre AS especialidad
FROM ordenes o
JOIN citas c ON o.id_cita = c.id
JOIN pacientes p ON c.id_paciente = p.id
JOIN usuarios u ON p.id_usuario = u.id
JOIN medicos m ON c.id_medico = m.id
JOIN usuarios um ON m.id_usuario = um.id
JOIN especialidades e ON o.especialidad = e.id;

GRANT SELECT ON ordenes_resumen TO app_user;
GRANT SELECT ON ordenes_resumen TO qas_user;

CREATE MATERIALIZED VIEW roles_resumen AS
SELECT u.id,
       u.primer_nombre || ' ' || u.primer_apellido AS nombre_usuario,
       r.nombre AS rol
FROM usuarios u
JOIN roles_usuario ru ON u.id = ru.id_usuario
JOIN roles r ON ru.id_rol = r.id;

GRANT SELECT ON roles_resumen TO logs_user;
GRANT SELECT ON roles_resumen TO qas_user;

-- =========================
-- REFRESH POLICIES
-- =========================
REFRESH MATERIALIZED VIEW citas_resumen;
REFRESH MATERIALIZED VIEW agenda_medicos;
REFRESH MATERIALIZED VIEW ordenes_resumen;
REFRESH MATERIALIZED VIEW roles_resumen;
