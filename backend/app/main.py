from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from app.routes import cart, catalog, calendar
from app.config import get_settings

settings = get_settings()

app = FastAPI(
    title="Amazon Flash Mode API",
    description="Situation-to-cart API for Amazon Flash Mode MVP",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cart.router)
app.include_router(catalog.router)
app.include_router(calendar.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "mode": "flash-mode-mvp"}


# AWS Lambda entry point
handler = Mangum(app, lifespan="off")
