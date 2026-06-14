import os
from functools import lru_cache
from dotenv import load_dotenv

# Load environment variables from .env file (if present)
load_dotenv()


class Settings:
    ENV: str = os.getenv("ENV", "local")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    PRODUCTS_TABLE: str = os.getenv("PRODUCTS_TABLE", "Products")
    BUNDLES_TABLE: str = os.getenv("BUNDLES_TABLE", "Bundles")
    SESSIONS_TABLE: str = os.getenv("SESSIONS_TABLE", "Sessions")
    LOCAL_DYNAMODB_URL: str = os.getenv("LOCAL_DYNAMODB_URL", "")
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "*").split(",")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    @property
    def is_local(self) -> bool:
        return self.ENV.lower() == "local"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
