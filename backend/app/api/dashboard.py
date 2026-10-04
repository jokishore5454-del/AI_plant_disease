from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.predictions import DiseasePrediction, HealthPrediction, YieldPrediction
from app.models.datasets import DatasetMetadata
from app.models.logs import ActivityLog
from app.services.ml_service import ml_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "admin":
        # System-wide metrics for Admin
        total_users = db.query(User).count()
        active_users = db.query(User).filter(User.is_active == True).count()
        total_disease = db.query(DiseasePrediction).count()
        total_health = db.query(HealthPrediction).count()
        total_yield = db.query(YieldPrediction).count()
        total_predictions = total_disease + total_health + total_yield
        
        recent_logs = db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(10).all()
        dataset_count = db.query(DatasetMetadata).count()

        return {
            "role": "admin",
            "user_info": {"username": current_user.username, "email": current_user.email},
            "stats": {
                "total_users": total_users,
                "active_users": active_users,
                "total_disease_predictions": total_disease,
                "total_health_predictions": total_health,
                "total_yield_predictions": total_yield,
                "total_predictions": total_predictions,
                "datasets_managed": dataset_count
            },
            "models_status": {
                "disease_cnn": "Active (MobileNetV2 / Deep Classifier)",
                "health_rf": "Active (RandomForestClassifier)",
                "yield_xgb": "Active (XGBRegressor)"
            },
            "recent_activity": [
                {"id": log.id, "username": log.username or "System", "action": log.action, "status": log.status, "timestamp": log.timestamp.isoformat()}
                for log in recent_logs
            ]
        }

    else:
        # User-isolated metrics for Normal User
        user_disease = db.query(DiseasePrediction).filter(DiseasePrediction.user_id == current_user.id).count()
        user_health = db.query(HealthPrediction).filter(HealthPrediction.user_id == current_user.id).count()
        user_yield = db.query(YieldPrediction).filter(YieldPrediction.user_id == current_user.id).count()
        total_user_predictions = user_disease + user_health + user_yield

        recent_disease = db.query(DiseasePrediction).filter(DiseasePrediction.user_id == current_user.id).order_by(DiseasePrediction.created_at.desc()).limit(3).all()
        recent_health = db.query(HealthPrediction).filter(HealthPrediction.user_id == current_user.id).order_by(HealthPrediction.created_at.desc()).limit(3).all()
        recent_yield = db.query(YieldPrediction).filter(YieldPrediction.user_id == current_user.id).order_by(YieldPrediction.created_at.desc()).limit(3).all()

        return {
            "role": "user",
            "user_info": {"username": current_user.username, "email": current_user.email},
            "stats": {
                "user_disease_predictions": user_disease,
                "user_health_predictions": user_health,
                "user_yield_predictions": user_yield,
                "total_personal_predictions": total_user_predictions
            },
            "recent_activity": {
                "disease": [{"id": p.id, "crop": p.crop_name, "disease": p.disease_name, "confidence": p.confidence, "date": p.created_at.isoformat()} for p in recent_disease],
                "health": [{"id": p.id, "status": p.predicted_health, "date": p.created_at.isoformat()} for p in recent_health],
                "yield": [{"id": p.id, "predicted_yield": p.predicted_yield, "unit": p.unit, "date": p.created_at.isoformat()} for p in recent_yield]
            }
        }
