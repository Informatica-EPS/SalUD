-- =========================
-- ROLES
-- =========================

-- Rol administrador (control total)
CREATE ROLE admin_medicamentos LOGIN PASSWORD 'Adm3d1c@2026!';
GRANT CONNECT ON DATABASE neondb TO admin_medicamentos;
GRANT ALL PRIVILEGES ON DATABASE neondb TO admin_medicamentos;
GRANT ALL PRIVILEGES ON SCHEMA public TO admin_medicamentos;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin_medicamentos;

-- Rol aplicación (para la app de medicamentos)
CREATE ROLE app_user LOGIN PASSWORD 'AppUs3r#2026!';
GRANT CONNECT ON DATABASE neondb TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON medicamentos TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON inventario TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON movimientos TO app_user;

-- Rol QAS (Quality Assurance, pruebas)
CREATE ROLE qas_user LOGIN PASSWORD 'Q@sT3st2026!';
GRANT CONNECT ON DATABASE neondb TO qas_user;
GRANT USAGE ON SCHEMA public TO qas_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO qas_user;

-- Rol logs/auditoría (solo acceso a auditoría)
CREATE ROLE logs_user LOGIN PASSWORD 'L0gs#2026!';
GRANT CONNECT ON DATABASE neondb TO logs_user;
GRANT USAGE ON SCHEMA public TO logs_user;
GRANT SELECT ON auditoria_medicamentos TO logs_user;

-- =========================
-- VISTAS MATERIALIZADAS
-- =========================

CREATE MATERIALIZED VIEW inventario_resumen AS
SELECT i.id, i.total, m.nombre AS medicamento
FROM inventario i
JOIN medicamentos m ON i.id = m.id;

GRANT SELECT ON inventario_resumen TO app_user;
GRANT SELECT ON inventario_resumen TO qas_user;

CREATE MATERIALIZED VIEW movimientos_resumen AS
SELECT mo.id, mo.tipo_movimiento, mo.cantidad, mo.created_by, mo.created_at, m.nombre AS medicamento
FROM movimientos mo
LEFT JOIN medicamentos m ON mo.id_medicamento = m.id
WHERE mo.created_at > CURRENT_DATE - INTERVAL '30 days';

GRANT SELECT ON movimientos_resumen TO qas_user;

CREATE MATERIALIZED VIEW auditoria_resumen AS
SELECT id_medicamento, nombre, cantidad, presentacion, concentracion, momento, usuario_bd, movimiento
FROM auditoria_medicamentos;

GRANT SELECT ON auditoria_resumen TO logs_user;

-- =========================
-- REFRESH POLICIES
-- =========================
REFRESH MATERIALIZED VIEW inventario_resumen;
REFRESH MATERIALIZED VIEW movimientos_resumen;
REFRESH MATERIALIZED VIEW auditoria_resumen;
