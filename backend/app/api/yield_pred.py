from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.predictions import YieldPrediction
from app.schemas.predictions import YieldPredictionRequest, YieldPredictionResponse
from app.services.ml_service import ml_service
from app.utils.logger import log_activity

router = APIRouter(prefix="/yield", tags=["Yield Prediction"])

@router.get("/options")
def get_yield_options():
    return {
        "crops": ["Wheat", "Rice", "Maize", "Potato", "Tomato"],
        "seasons": ["Kharif", "Rabi", "Zaid"]
    }

@router.post("/predict", response_model=YieldPredictionResponse)
def predict_crop_yield(
    req: YieldPredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    input_dict = req.model_dump()
    try:
        res = ml_service.predict_yield(input_dict)
    except Exception as e:
        log_activity(db, user_id=current_user.id, username=current_user.username, action="YIELD_PREDICTION_FAILED", status="FAILURE")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing XGBoost yield prediction model: {str(e)}"
        )

    prediction_record = YieldPrediction(
        user_id=current_user.id,
        input_parameters=input_dict,
        predicted_yield=res["predicted_yield"],
        unit=res["unit"],
        important_features=res["important_features"]
    )
    db.add(prediction_record)
    db.commit()
    db.refresh(prediction_record)

    log_activity(
        db, 
        user_id=current_user.id, 
        username=current_user.username, 
        action=f"YIELD_PREDICT: {res['predicted_yield']} {res['unit']}", 
        status="SUCCESS"
    )

    return prediction_record
