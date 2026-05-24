from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

from app.database import engine, SessionLocal
from app.models import Base
from app.routers import bills, suppliers, simulate, leads, partners, admin as admin_router
from app.services.supplier_engine import seed_suppliers, seed_partners
from app.models import AdminUser

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            logger.info("Seeding suppliers and partners...")
            seed_suppliers(db)
            seed_partners(db)
            # Seed default admin user if not exists
            if not db.query(AdminUser).filter(AdminUser.username == "admin").first():
                from app.routers.admin import hash_password
                db.add(AdminUser(
                    username="admin",
                    hashed_password=hash_password("admin"),
                    must_change_password=True,
                ))
                db.commit()
                logger.info("Default admin user created (admin/admin) — change password on first login")
            logger.info("Database initialization complete")
        finally:
            db.close()
    except OperationalError as e:
        logger.error(f"Database connection error during startup: {e}")
        logger.warning("Continuing without database initialization - app will fail on first request")
    except Exception as e:
        logger.error(f"Unexpected error during startup: {e}")
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
app.include_router(leads.router)
app.include_router(partners.router)
app.include_router(admin_router.router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}
