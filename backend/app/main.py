from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

from app.database import engine, SessionLocal
from app.models import Base
from app.routers import bills, suppliers, simulate
from app.services.supplier_engine import seed_suppliers


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            seed_suppliers(db)
        finally:
            db.close()
    except OperationalError:
        # DB not available (e.g. in unit-test environments without Postgres)
        pass
    yield


app = FastAPI(
    title="contaLeve API",
    description="Upload your electricity bill → see cheaper plans → simulate savings",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bills.router)
app.include_router(suppliers.router)
app.include_router(simulate.router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}
