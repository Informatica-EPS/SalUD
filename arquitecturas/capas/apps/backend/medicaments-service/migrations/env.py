
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context


from app.core.config import settings
from app.core.database import Base
from app.models import medicament_model, movements_model, inventory_model

print("Tablas detectadas:", Base.metadata.tables.keys())  # ← agrega esto

config = context.config
config.set_main_option("sqlalchemy.url", settings.database_url)

target_metadata = Base.metadata  # Alembic necesita saber qué modelos migrar


def run_migrations_offline() -> None:
  url = config.get_main_option("sqlalchemy.url")
  context.configure(
      url=url,
      target_metadata=target_metadata,
      literal_binds=True,
      dialect_opts={"paramstyle": "named"},
  )
  with context.begin_transaction():
    context.run_migrations()


def run_migrations_online() -> None:
  connectable = engine_from_config(
      config.get_section(config.config_ini_section, {}),
      prefix="sqlalchemy.",
      poolclass=pool.NullPool,
  )
  with connectable.connect() as connection:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
    )
    with context.begin_transaction():
      context.run_migrations()


if context.is_offline_mode():
  run_migrations_offline()
else:
  run_migrations_online()
