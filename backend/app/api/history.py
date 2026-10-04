from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.predictions import DiseasePrediction, HealthPrediction, YieldPrediction
from app.utils.logger import log_activity

router = APIRouter(prefix="/history", tags=["Prediction History"])

@router.get("")
def get_user_history(
    prediction_type: str = "all", # 'all', 'disease', 'health', 'yield'
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    disease_records = []
    health_records = []
    yield_records = []

    if prediction_type in ["all", "disease"]:
        disease_q = db.query(DiseasePrediction).filter(DiseasePrediction.user_id == current_user.id).order_by(DiseasePrediction.created_at.desc()).all()
        disease_records = [
            {
                "id": r.id,
                "type": "disease",
                "crop_name": r.crop_name,
                "disease_name": r.disease_name,
                "confidence": r.confidence,
                "image_path": r.image_path,
                "top_predictions": r.top_predictions,
                "recommendation": r.recommendation,
                "created_at": r.created_at.isoformat()
            }
            for r in disease_q
        ]

    if prediction_type in ["all", "health"]:
        health_q = db.query(HealthPrediction).filter(HealthPrediction.user_id == current_user.id).order_by(HealthPrediction.created_at.desc()).all()
        health_records = [
            {
                "id": r.id,
                "type": "health",
                "predicted_health": r.predicted_health,
                "input_parameters": r.input_parameters,
                "probabilities": r.probabilities,
                "important_features": r.important_features,
                "created_at": r.created_at.isoformat()
            }
            for r in health_q
        ]

    if prediction_type in ["all", "yield"]:
        yield_q = db.query(YieldPrediction).filter(YieldPrediction.user_id == current_user.id).order_by(YieldPrediction.created_at.desc()).all()
        yield_records = [
            {
                "id": r.id,
                "type": "yield",
                "predicted_yield": r.predicted_yield,
                "unit": r.unit,
                "input_parameters": r.input_parameters,
                "important_features": r.important_features,
                "created_at": r.created_at.isoformat()
            }
            for r in yield_q
        ]

    return {
        "disease": disease_records,
        "health": health_records,
        "yield": yield_records,
        "total_records": len(disease_records) + len(health_records) + len(yield_records)
    }

@router.delete("/{record_type}/{record_id}")
def delete_history_record(
    record_type: str,
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Enforce strict user isolation: User can only delete their own records
    target_model = None
    if record_type == "disease": target_model = DiseasePrediction
    elif record_type == "health": target_model = HealthPrediction
    elif record_type == "yield": target_model = YieldPrediction
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid record type.")

    record = db.query(target_model).filter(target_model.id == record_id, target_model.user_id == current_user.id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found or unauthorized to delete.")

    db.delete(record)
    db.commit()

    log_activity(db, user_id=current_user.id, username=current_user.username, action=f"DELETE_HISTORY: {record_type} #{record_id}", status="SUCCESS")

    return {"message": f"Successfully deleted {record_type} prediction record #{record_id}"}
