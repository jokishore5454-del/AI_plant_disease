from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.predictions import DiseasePrediction, HealthPrediction, YieldPrediction
from app.services.ml_service import ml_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/model-metrics")
def get_model_evaluation_metrics(current_user: User = Depends(get_current_user)):
    return ml_service.get_metrics()

@router.get("/disease")
def get_disease_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(DiseasePrediction)
    if current_user.role != "admin":
        query = query.filter(DiseasePrediction.user_id == current_user.id)

    disease_counts = query.with_entities(DiseasePrediction.disease_name, func.count(DiseasePrediction.id)).group_by(DiseasePrediction.disease_name).all()
    crop_counts = query.with_entities(DiseasePrediction.crop_name, func.count(DiseasePrediction.id)).group_by(DiseasePrediction.crop_name).all()
    mode_counts = query.with_entities(DiseasePrediction.detection_mode, func.count(DiseasePrediction.id)).group_by(DiseasePrediction.detection_mode).all()

    total_scans = query.count()
    low_conf_scans = query.filter(DiseasePrediction.confidence < 0.60).count()
    avg_conf = query.with_entities(func.avg(DiseasePrediction.confidence)).scalar() or 0.0

    return {
        "total_scans": total_scans,
        "low_confidence_count": low_conf_scans,
        "average_confidence": round(float(avg_conf), 4),
        "disease_breakdown": [{"disease": d, "count": c} for d, c in disease_counts],
        "crop_breakdown": [{"crop": r, "count": c} for r, c in crop_counts],
        "detection_modes": [{"mode": m or "upload", "count": c} for m, c in mode_counts]
    }

@router.get("/health")
def get_health_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(HealthPrediction)
    if current_user.role != "admin":
        query = query.filter(HealthPrediction.user_id == current_user.id)

    status_counts = query.with_entities(HealthPrediction.predicted_health, func.count(HealthPrediction.id)).group_by(HealthPrediction.predicted_health).all()

    return {
        "health_status_breakdown": [{"status": s, "count": c} for s, c in status_counts]
    }

@router.get("/yield")
def get_yield_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(YieldPrediction)
    if current_user.role != "admin":
        query = query.filter(YieldPrediction.user_id == current_user.id)

    records = query.order_by(YieldPrediction.created_at.asc()).all()

    return {
        "yield_history": [
            {
                "id": r.id,
                "crop_type": r.input_parameters.get("crop_type", "Crop"),
                "predicted_yield": r.predicted_yield,
                "area_hectares": r.input_parameters.get("area_hectares", 1),
                "created_at": r.created_at.isoformat()
            }
            for r in records
        ]
    }
