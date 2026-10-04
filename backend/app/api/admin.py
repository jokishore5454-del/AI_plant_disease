from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_admin
from app.models.user import User
from app.models.predictions import DiseasePrediction, HealthPrediction, YieldPrediction
from app.models.datasets import DatasetMetadata
from app.models.logs import ActivityLog
from app.schemas.auth import UserResponse
from app.schemas.admin import UserAdminCreate, UserAdminUpdate
from app.core.security import get_password_hash
from app.services.ml_service import ml_service
from app.utils.logger import log_activity

router = APIRouter(prefix="/admin", tags=["Admin Management"])

@router.get("/users", response_model=list[UserResponse])
def get_all_users(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.id.asc()).all()
    return users

@router.post("/users", response_model=UserResponse)
def create_user_by_admin(
    user_in: UserAdminCreate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(User).filter((User.username == user_in.username) | (User.email == user_in.email)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username or email already exists.")

    new_user = User(
        username=user_in.username,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        role=user_in.role if user_in.role in ["user", "admin"] else "user",
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    log_activity(db, user_id=admin.id, username=admin.username, action=f"ADMIN_CREATE_USER: {new_user.username}", status="SUCCESS")
    return new_user

@router.patch("/users/{user_id}", response_model=UserResponse)
def update_user_by_admin(
    user_id: int,
    user_up: UserAdminUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if user_up.email: user.email = user_up.email
    if user_up.role and user_up.role in ["user", "admin"]: user.role = user_up.role
    if user_up.is_active is not None: user.is_active = user_up.is_active
    if user_up.password: user.password_hash = get_password_hash(user_up.password)

    db.commit()
    db.refresh(user)

    log_activity(db, user_id=admin.id, username=admin.username, action=f"ADMIN_UPDATE_USER: {user.username}", status="SUCCESS")
    return user

@router.delete("/users/{user_id}")
def delete_user_by_admin(
    user_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if user_id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete your own active administrator account.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    username = user.username
    db.delete(user)
    db.commit()

    log_activity(db, user_id=admin.id, username=admin.username, action=f"ADMIN_DELETE_USER: {username}", status="SUCCESS")
    return {"message": f"User {username} deleted successfully."}

@router.get("/logs")
def get_activity_logs(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    logs = db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(100).all()
    return logs

@router.get("/datasets")
def get_datasets_metadata(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    datasets = db.query(DatasetMetadata).all()
    return datasets

@router.get("/models")
def get_models_status(admin: User = Depends(get_current_admin)):
    metrics = ml_service.get_metrics()
    return {
        "disease_cnn": {
            "name": "Crop Disease Detection (MobileNetV2 Transfer Learning)",
            "status": "Loaded & Active",
            "metrics": metrics.get("crop_disease_cnn", {})
        },
        "health_rf": {
            "name": "Crop Health Assessment (Scikit-Learn RandomForest)",
            "status": "Loaded & Active",
            "metrics": metrics.get("crop_health_rf", {})
        },
        "yield_xgb": {
            "name": "Crop Yield Forecasting (XGBoost XGBRegressor)",
            "status": "Loaded & Active",
            "metrics": metrics.get("crop_yield_xgb", {})
        }
    }

@router.get("/system-health")
def get_system_health(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    db_ok = True
    try:
        db.query(User).first()
    except Exception:
        db_ok = False

    return {
        "status": "Healthy" if db_ok else "Degraded",
        "database": "Connected (SQLite/SQLAlchemy)" if db_ok else "Disconnected",
        "api_service": "Running (FastAPI)",
        "ml_inference": "Active",
        "ai_assistant": "Active"
    }
