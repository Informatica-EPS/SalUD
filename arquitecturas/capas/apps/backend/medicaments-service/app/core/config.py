from pydantic_settings import BaseSettings


class Settings(BaseSettings):
  db_name: str = "dummy"
  db_user: str = "dummy"
  db_password: str = "dummy"
  db_host: str = "dummy"
  db_port: int = 5432

  @property
  def database_url(self) -> str:
    return f"postgresql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"


settings = Settings()
