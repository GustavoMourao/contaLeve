from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://contaLeve:contaLeve@localhost:5432/contaLeve"
    secret_key: str = "change-me-in-production"
    debug: bool = True

    class Config:
        env_file = ".env"


settings = Settings()
