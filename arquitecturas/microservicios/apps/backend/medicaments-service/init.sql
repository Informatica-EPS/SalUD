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

