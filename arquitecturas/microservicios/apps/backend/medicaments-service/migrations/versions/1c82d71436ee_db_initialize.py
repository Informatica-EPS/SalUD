"""db initialize

Revision ID: 1c82d71436ee
Revises:
Create Date: 2026-05-04 05:24:56.564846

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "1c82d71436ee"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute(
        """
        DO $$
        BEGIN
          CREATE DOMAIN dom_tipo_movimiento AS VARCHAR(20)
            CHECK (VALUE IN ('entrada', 'salida'));
        EXCEPTION
          WHEN duplicate_object THEN NULL;
        END $$;

        CREATE TABLE IF NOT EXISTS medicamentos (
          id BIGSERIAL PRIMARY KEY,
          nombre VARCHAR(20) NOT NULL,
          cantidad VARCHAR(20) NOT NULL,
          presentacion VARCHAR(20) NOT NULL,
          concentracion VARCHAR(20) NOT NULL,
          fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
          creado_por VARCHAR(100),
          ultima_actualizacion TIMESTAMPTZ,
          actualizado_por VARCHAR(100)
        );

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

        CREATE INDEX IF NOT EXISTS ix_medicamentos_id ON medicamentos(id);
        CREATE INDEX IF NOT EXISTS ix_movimientos_id ON movimientos(id);
        CREATE INDEX IF NOT EXISTS ix_movimientos_id_medicamento ON movimientos(id_medicamento);
        """
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute(
        """
        DROP INDEX IF EXISTS ix_movimientos_id_medicamento;
        DROP INDEX IF EXISTS ix_movimientos_id;
        DROP INDEX IF EXISTS ix_medicamentos_id;
        DROP TABLE IF EXISTS movimientos;
        DROP TABLE IF EXISTS inventario;
        DROP TABLE IF EXISTS medicamentos;
        DROP DOMAIN IF EXISTS dom_tipo_movimiento;
        """
    )
