from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./dev.db"

    class Config:
        env_prefix = ''
        env_file = '.env'
        case_sensitive = False


settings = Settings()
