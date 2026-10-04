import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AgriVision AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./agrivision.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "default_secret_key_please_change")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "premkumar")
    ADMIN_INITIAL_PASSWORD: str = os.getenv("ADMIN_INITIAL_PASSWORD", "kishore")
    
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
    ]
    
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")

    class Config:
        case_sensitive = True

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
