-- Script de inicialización de la base de datos de medicamentos
-- Fecha: 2026-05-09

-- ===================================
-- CREACIÓN DE TABLAS
-- ===================================

-- Tabla: medicamentos
CREATE TABLE IF NOT EXISTS medicamentos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR NOT NULL
);

-- Índice para la tabla medicamentos
CREATE INDEX IF NOT EXISTS ix_medicamentos_id ON medicamentos(id);

-- Tabla: inventario
CREATE TABLE IF NOT EXISTS inventario (
    id INTEGER PRIMARY KEY,
    total INTEGER NOT NULL,
    CONSTRAINT fk_inventario_medicamento FOREIGN KEY (id) REFERENCES medicamentos(id) ON DELETE CASCADE
);

-- Tabla: movimientos
CREATE TABLE IF NOT EXISTS movimientos (
    id SERIAL PRIMARY KEY,
    id_medicamento INTEGER,
    tipo_movimiento VARCHAR NOT NULL,
    cantidad INTEGER NOT NULL,
    created_by VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_movimientos_medicamento FOREIGN KEY (id_medicamento) REFERENCES medicamentos(id) ON DELETE CASCADE
);

-- Índices para la tabla movimientos
CREATE INDEX IF NOT EXISTS ix_movimientos_id ON movimientos(id);
CREATE INDEX IF NOT EXISTS ix_movimientos_id_medicamento ON movimientos(id_medicamento);

-- ===================================
-- INSERCIÓN DE DATOS DE EJEMPLO
-- ===================================

-- Medicamentos de ejemplo
INSERT INTO medicamentos (nombre) VALUES 
    ('N/A'),
    ('Acetaminofén 500mg'),
    ('Ibuprofeno 400mg'),
    ('Amoxicilina 500mg'),
    ('Omeprazol 20mg'),
    ('Loratadina 10mg'),
    ('Aspirina 100mg'),
    ('Metformina 850mg'),
    ('Losartán 50mg'),
    ('Atorvastatina 20mg'),
    ('Salbutamol Inhalador')
ON CONFLICT DO NOTHING;

-- Inventario inicial
INSERT INTO inventario (id, total) VALUES 
    (1, 0),  -- N/A
    (2, 150),  -- Acetaminofén
    (3, 200),  -- Ibuprofeno
    (4, 100),  -- Amoxicilina
    (5, 180),  -- Omeprazol
    (6, 120),  -- Loratadina
    (7, 90),   -- Aspirina
    (8, 160),  -- Metformina
    (9, 140),  -- Losartán
    (10, 110),  -- Atorvastatina
    (11, 75)   -- Salbutamol
ON CONFLICT DO NOTHING;

-- Movimientos iniciales (entradas al inventario)
INSERT INTO movimientos (id_medicamento, tipo_movimiento, cantidad, created_by, created_at) VALUES 
    (1, 'entrada', 150, 'admin', CURRENT_TIMESTAMP - INTERVAL '10 days'),
    (2, 'entrada', 200, 'admin', CURRENT_TIMESTAMP - INTERVAL '10 days'),
    (3, 'entrada', 100, 'admin', CURRENT_TIMESTAMP - INTERVAL '9 days'),
    (4, 'entrada', 200, 'admin', CURRENT_TIMESTAMP - INTERVAL '9 days'),
    (5, 'entrada', 150, 'admin', CURRENT_TIMESTAMP - INTERVAL '8 days'),
    (6, 'entrada', 100, 'admin', CURRENT_TIMESTAMP - INTERVAL '8 days'),
    (7, 'entrada', 180, 'admin', CURRENT_TIMESTAMP - INTERVAL '7 days'),
    (8, 'entrada', 150, 'admin', CURRENT_TIMESTAMP - INTERVAL '7 days'),
    (9, 'entrada', 120, 'admin', CURRENT_TIMESTAMP - INTERVAL '6 days'),
    (10, 'entrada', 80, 'admin', CURRENT_TIMESTAMP - INTERVAL '6 days'),
    
    -- Algunas salidas de ejemplo
    (4, 'salida', 20, 'doctor_garcia', CURRENT_TIMESTAMP - INTERVAL '5 days'),
    (5, 'salida', 30, 'doctor_lopez', CURRENT_TIMESTAMP - INTERVAL '4 days'),
    (6, 'salida', 10, 'enfermera_martinez', CURRENT_TIMESTAMP - INTERVAL '3 days'),
    (7, 'salida', 20, 'doctor_garcia', CURRENT_TIMESTAMP - INTERVAL '2 days'),
    (8, 'salida', 10, 'doctor_lopez', CURRENT_TIMESTAMP - INTERVAL '1 day'),
    (10, 'salida', 5, 'enfermera_rodriguez', CURRENT_TIMESTAMP - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- ===================================
-- VERIFICACIÓN
-- ===================================

-- Mostrar resumen de datos insertados
SELECT 
    'Medicamentos' as tabla, 
    COUNT(*) as registros 
FROM medicamentos
UNION ALL
SELECT 
    'Inventario' as tabla, 
    COUNT(*) as registros 
FROM inventario
UNION ALL
SELECT 
    'Movimientos' as tabla, 
    COUNT(*) as registros 
FROM movimientos;
