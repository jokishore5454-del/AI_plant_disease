from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.predictions import HealthPrediction
from app.schemas.predictions import HealthPredictionRequest, HealthPredictionResponse
from app.services.ml_service import ml_service
from app.utils.logger import log_activity

router = APIRouter(prefix="/health", tags=["Crop Health"])

@router.post("/predict", response_model=HealthPredictionResponse)
def predict_crop_health(
    req: HealthPredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    input_dict = req.model_dump()
    try:
        res = ml_service.predict_health(input_dict)
    except Exception as e:
        log_activity(db, user_id=current_user.id, username=current_user.username, action="HEALTH_PREDICTION_FAILED", status="FAILURE")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing crop health Random Forest model: {str(e)}"
        )

    prediction_record = HealthPrediction(
        user_id=current_user.id,
        input_parameters=input_dict,
        predicted_health=res["predicted_health"],
        probabilities=res["probabilities"],
        important_features=res["important_features"]
    )
    db.add(prediction_record)
    db.commit()
    db.refresh(prediction_record)

    log_activity(
        db, 
        user_id=current_user.id, 
        username=current_user.username, 
        action=f"HEALTH_PREDICT: {res['predicted_health']}", 
        status="SUCCESS"
    )

    return prediction_record
