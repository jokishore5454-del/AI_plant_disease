import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal

from app.models.user import User
from app.models.datasets import DatasetMetadata

from app.core.security import get_password_hash


# ============================================================
# IMPORT ROUTERS
# ============================================================

from app.api.auth import router as auth_router
from app.api.disease import router as disease_router
from app.api.health import router as health_router
from app.api.yield_pred import router as yield_router
from app.api.ai import router as ai_router
from app.api.dashboard import router as dashboard_router
from app.api.analytics import router as analytics_router
from app.api.history import router as history_router
from app.api.admin import router as admin_router


# ============================================================
# DATABASE TABLE CREATION
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# BOOTSTRAP ADMIN + DATASETS
# ============================================================

def bootstrap_admin_and_datasets():

    db = SessionLocal()

    try:

        # ----------------------------------------------------
        # DATABASE MIGRATION
        # Add detection_mode if it does not already exist
        # ----------------------------------------------------

        try:

            db.execute(
                text(
                    "ALTER TABLE disease_predictions "
                    "ADD COLUMN detection_mode "
                    "VARCHAR(50) DEFAULT 'upload'"
                )
            )

            db.commit()

            print(
                "[Migration] Added "
                "'detection_mode' column."
            )

        except Exception as migration_error:

            db.rollback()

            # SQLite returns an error when the column already
            # exists. We ignore only this migration failure.
            print(
                "[Migration] detection_mode already exists "
                "or migration was skipped."
            )


        # ----------------------------------------------------
        # CREATE ADMIN USER
        # ----------------------------------------------------

        admin_user = (
            db.query(User)
            .filter(
                User.username == settings.ADMIN_USERNAME
            )
            .first()
        )

        if not admin_user:

            admin_pw_hash = get_password_hash(
                settings.ADMIN_INITIAL_PASSWORD
            )

            admin_user = User(
                username=settings.ADMIN_USERNAME,
                email="admin@agrivision.ai",
                password_hash=admin_pw_hash,
                role="admin",
                is_active=True
            )

            db.add(admin_user)
            db.commit()

            print(
                f"[Bootstrap] Admin account "
                f"'{settings.ADMIN_USERNAME}' created."
            )

        else:

            print(
                f"[Bootstrap] Admin account "
                f"'{settings.ADMIN_USERNAME}' already exists."
            )


        # ----------------------------------------------------
        # SEED DATASET METADATA
        # ----------------------------------------------------

        if db.query(DatasetMetadata).count() == 0:

            ds1 = DatasetMetadata(
                name="PlantVillage Leaf Disease Dataset",
                source="Public Kaggle / PlantVillage Repository",
                version="2.1.0",
                description=(
                    "Augmented multi-class leaf disease "
                    "image dataset containing 10 target "
                    "crop condition categories."
                ),
                sample_count=400,
                status="Active / Trained"
            )

            ds2 = DatasetMetadata(
                name="Soil Telemetry & Climate Health Dataset",
                source="USDA / ICAR Agronomic Open Dataset",
                version="1.4.0",
                description=(
                    "Tabular telemetry dataset including "
                    "soil pH, soil moisture, N-P-K nutrient "
                    "concentrations, and microclimatic variables."
                ),
                sample_count=1200,
                status="Active / Trained"
            )

            ds3 = DatasetMetadata(
                name="Regional Crop Yield Historical Records",
                source="FAO / Agricultural Statistics Division",
                version="3.0.0",
                description=(
                    "Historical crop yield dataset detailing "
                    "crop type, cultivated area, seasonal index, "
                    "rainfall, and thermal units."
                ),
                sample_count=1500,
                status="Active / Trained"
            )

            db.add_all([
                ds1,
                ds2,
                ds3
            ])

            db.commit()

            print(
                "[Bootstrap] Dataset metadata initialized."
            )

        else:

            print(
                "[Bootstrap] Dataset metadata already exists."
            )


    except Exception as e:

        db.rollback()

        print(
            f"[Bootstrap] ERROR: {e}"
        )

    finally:

        db.close()


# ============================================================
# FASTAPI LIFESPAN
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):

    print("")
    print("==========================================")
    print("       AGRIVISION AI BACKEND")
    print("==========================================")

    bootstrap_admin_and_datasets()

    print("[AgriVision] Startup completed.")
    print("")

    yield

    print("[AgriVision] Server shutting down...")


# ============================================================
# CREATE FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Integrated Machine Learning Framework for "
        "Crop Disease Detection, Crop Health Monitoring, "
        "and Yield Prediction Using CNN, Random Forest, "
        "and XGBoost"
    ),
    lifespan=lifespan
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=settings.CORS_ORIGINS,

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# UPLOAD DIRECTORY
# ============================================================

os.makedirs(
    settings.UPLOAD_DIR,
    exist_ok=True
)

app.mount(
    "/uploads",
    StaticFiles(
        directory=settings.UPLOAD_DIR
    ),
    name="uploads"
)


# ============================================================
# GLOBAL EXCEPTION HANDLER
# ============================================================

@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception
):

    print(
        f"[GlobalExceptionHandler] "
        f"{request.method} {request.url}"
    )

    print(
        f"[GlobalExceptionHandler] Error: {exc}"
    )

    return JSONResponse(
        status_code=500,
        content={
            "detail": "An internal server error occurred."
        }
    )


# ============================================================
# INCLUDE API ROUTERS
# ============================================================

app.include_router(
    auth_router,
    prefix=settings.API_V1_STR
)

app.include_router(
    disease_router,
    prefix=settings.API_V1_STR
)

app.include_router(
    health_router,
    prefix=settings.API_V1_STR
)

app.include_router(
    yield_router,
    prefix=settings.API_V1_STR
)

app.include_router(
    ai_router,
    prefix=settings.API_V1_STR
)

app.include_router(
    dashboard_router,
    prefix=settings.API_V1_STR
)

app.include_router(
    analytics_router,
    prefix=settings.API_V1_STR
)

app.include_router(
    history_router,
    prefix=settings.API_V1_STR
)

app.include_router(
    admin_router,
    prefix=settings.API_V1_STR
)


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():

    return {
        "title": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "Online",
        "documentation": "/docs"
    }


# ============================================================
# SIMPLE STATUS ENDPOINT
# ============================================================

@app.get("/status")
def status():

    return {
        "status": "online",
        "application": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

