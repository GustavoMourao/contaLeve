from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://contaLeve:contaLeve@localhost:5432/contaLeve"
    secret_key: str = "change-me-in-production"
    debug: bool = True

    # Email notifications — set these in your .env file
    admin_email: str = ""          # recipient: your inbox
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""            # sender address / login
    smtp_password: str = ""        # app password or SMTP password
    smtp_from: str = ""            # display "from" address (defaults to smtp_user)

    class Config:
        env_file = ".env"


settings = Settings()
