import os
import base64
import uuid
import io
import numpy as np
from PIL import Image
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.predictions import DiseasePrediction
from app.schemas.predictions import DiseasePredictionResponse, WebcamPredictionRequest
from app.services.ml_service import ml_service, DISEASE_CLASSES
from app.utils.file_security import validate_and_save_upload
from app.utils.logger import log_activity
from app.core.config import settings

router = APIRouter(prefix="/disease", tags=["Disease Detection"])

@router.get("/classes")
def get_supported_classes():
    return {
        "total": len(DISEASE_CLASSES),
        "classes": [cls.replace("___", " - ").replace("_", " ") for cls in DISEASE_CLASSES]
    }

@router.post("/predict", response_model=DiseasePredictionResponse)
def predict_crop_disease(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate and save image safely
    saved_filename = validate_and_save_upload(file, settings.UPLOAD_DIR)
    full_image_path = os.path.join(settings.UPLOAD_DIR, saved_filename)

    # Run ML Inference
    try:
        res = ml_service.predict_disease(full_image_path)
    except Exception as e:
        log_activity(db, user_id=current_user.id, username=current_user.username, action="DISEASE_PREDICTION_FAILED", status="FAILURE")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing disease detection model: {str(e)}"
        )

    is_low_conf = res["confidence"] < 0.60

    # Record prediction in DB linked to authenticated user
    prediction_record = DiseasePrediction(
        user_id=current_user.id,
        crop_name=res["crop_name"],
        disease_name=res["disease_name"],
        confidence=res["confidence"],
        image_path=f"/uploads/{saved_filename}",
        top_predictions=res["top_predictions"],
        recommendation=res["recommendation"],
        detection_mode="upload"
    )
    db.add(prediction_record)
    db.commit()
    db.refresh(prediction_record)

    log_activity(
        db, 
        user_id=current_user.id, 
        username=current_user.username, 
        action=f"DISEASE_PREDICT_UPLOAD: {res['crop_name']} - {res['disease_name']}", 
        status="SUCCESS"
    )

    # Convert to response dictionary
    resp_dict = {
        "id": prediction_record.id,
        "crop_name": prediction_record.crop_name,
        "disease_name": prediction_record.disease_name,
        "confidence": prediction_record.confidence,
        "image_path": prediction_record.image_path,
        "top_predictions": prediction_record.top_predictions,
        "recommendation": prediction_record.recommendation,
        "detection_mode": "upload",
        "is_low_confidence": is_low_conf,
        "quality_warning": "Low confidence result. Please position the leaf clearly and ensure proper lighting." if is_low_conf else None,
        "created_at": prediction_record.created_at
    }

    return resp_dict

@router.post("/predict/webcam", response_model=DiseasePredictionResponse)
def predict_webcam_frame(
    req: WebcamPredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not req.image_data or not req.image_data.startswith("data:image"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid base64 webcam frame format. Must be a valid data URI (data:image/jpeg;base64,...)."
        )

    try:
        # Extract base64 encoded data
        header, encoded = req.image_data.split(",", 1)
        image_bytes = base64.b64decode(encoded)
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to decode webcam frame image bytes."
        )

    # Perform camera quality checks
    img_arr = np.array(img, dtype=np.float32)
    mean_brightness = float(np.mean(img_arr))
    pixel_std = float(np.std(img_arr))

    quality_warning = None
    if mean_brightness < 30.0:
        quality_warning = "Frame is very dark. Please improve lighting around the crop leaf."
    elif pixel_std < 8.0:
        quality_warning = "Low leaf texture contrast detected. Point camera directly at the leaf surface."

    # Save frame to uploads directory with secure filename
    safe_filename = f"webcam_{uuid.uuid4().hex}.jpg"
    full_save_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
    img.save(full_save_path, "JPEG")

    # Run trained CNN Inference
    try:
        res = ml_service.predict_disease(full_save_path)
    except Exception as e:
        log_activity(db, user_id=current_user.id, username=current_user.username, action="WEBCAM_PREDICTION_FAILED", status="FAILURE")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing CNN model on webcam frame: {str(e)}"
        )

    thresh = req.low_confidence_threshold or 0.60
    is_low_conf = res["confidence"] < thresh

    if is_low_conf and not quality_warning:
        quality_warning = f"Low confidence result ({res['confidence']*100:.1f}%). Position leaf steady and verify under proper illumination."

    # Record prediction in DB under authenticated user_id
    prediction_record = DiseasePrediction(
        user_id=current_user.id,
        crop_name=res["crop_name"],
        disease_name=res["disease_name"],
        confidence=res["confidence"],
        image_path=f"/uploads/{safe_filename}",
        top_predictions=res["top_predictions"],
        recommendation=res["recommendation"],
        detection_mode="webcam"
    )
    db.add(prediction_record)
    db.commit()
    db.refresh(prediction_record)

    log_activity(
        db, 
        user_id=current_user.id, 
        username=current_user.username, 
        action=f"DISEASE_PREDICT_WEBCAM: {res['crop_name']} - {res['disease_name']}", 
        status="SUCCESS"
    )

    resp_dict = {
        "id": prediction_record.id,
        "crop_name": prediction_record.crop_name,
        "disease_name": prediction_record.disease_name,
        "confidence": prediction_record.confidence,
        "image_path": prediction_record.image_path,
        "top_predictions": prediction_record.top_predictions,
        "recommendation": prediction_record.recommendation,
        "detection_mode": "webcam",
        "is_low_confidence": is_low_conf,
        "quality_warning": quality_warning,
        "created_at": prediction_record.created_at
    }

    return resp_dict
