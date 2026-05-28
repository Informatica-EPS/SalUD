-- Script de inicializacion de la base de datos de medicamentos
-- Estructura unicamente (sin datos)

DO $$
BEGIN
    CREATE DOMAIN dom_tipo_movimiento AS VARCHAR(20)
    CHECK (VALUE IN ('entrada', 'salida', 'despacho'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS medicamentos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL,
    presentacion VARCHAR(20),
    concentracion VARCHAR(20),
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    creado_por VARCHAR(100),
    ultima_actualizacion TIMESTAMPTZ,
    actualizado_por VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS ix_medicamentos_id ON medicamentos(id);

CREATE TABLE IF NOT EXISTS inventario (
    id_medicamento BIGINT PRIMARY KEY,
    total INT NOT NULL DEFAULT 0,
    CONSTRAINT inventario_total_nonnegative_ck CHECK (total >= 0),
    CONSTRAINT fk_inventario_medicamento
      FOREIGN KEY (id_medicamento) REFERENCES medicamentos(id)
      ON DELETE CASCADE ON UPDATE CASCADE
);

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

CREATE INDEX IF NOT EXISTS ix_movimientos_id ON movimientos(id);
CREATE INDEX IF NOT EXISTS ix_movimientos_id_medicamento ON movimientos(id_medicamento);

-- Tabla de auditoria para medicamentos
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

-- Funcion para el trigger de auditoria
CREATE OR REPLACE FUNCTION fn_auditoria_medicamentos()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO auditoria_medicamentos (id_medicamento, nombre, presentacion, concentracion, movimiento)
        VALUES (OLD.id, OLD.nombre, OLD.presentacion, OLD.concentracion, 'DELETE');
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO auditoria_medicamentos (id_medicamento, nombre, presentacion, concentracion, movimiento)
        VALUES (OLD.id, OLD.nombre, OLD.presentacion, OLD.concentracion, 'UPDATE');
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

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
-- Trigger para UPDATE
DROP TRIGGER IF EXISTS tr_auditoria_medicamentos_update ON medicamentos;
CREATE TRIGGER tr_auditoria_medicamentos_update
AFTER UPDATE ON medicamentos
FOR EACH ROW
EXECUTE FUNCTION fn_auditoria_medicamentos();

-- Trigger para DELETE
DROP TRIGGER IF EXISTS tr_auditoria_medicamentos_delete ON medicamentos;
CREATE TRIGGER tr_auditoria_medicamentos_delete
AFTER DELETE ON medicamentos
FOR EACH ROW
EXECUTE FUNCTION fn_auditoria_medicamentos();
