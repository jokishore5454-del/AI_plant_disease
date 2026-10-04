from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class TopPrediction(BaseModel):
    label: str
    confidence: float

class DiseasePredictionResponse(BaseModel):
    id: int
    crop_name: str
    disease_name: str
    confidence: float
    image_path: str
    top_predictions: List[TopPrediction]
    recommendation: Optional[str] = None
    detection_mode: str = "upload" # 'upload' or 'webcam'
    is_low_confidence: bool = False
    quality_warning: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class WebcamPredictionRequest(BaseModel):
    image_data: str # Base64 encoded JPEG/PNG image string from canvas
    detection_mode: Optional[str] = "capture" # 'capture' or 'live'
    low_confidence_threshold: Optional[float] = 0.60

class HealthPredictionRequest(BaseModel):
    soil_ph: float = Field(..., ge=0, le=14)
    soil_moisture: float = Field(..., ge=0, le=100)
    temperature: float = Field(..., ge=-10, le=60)
    humidity: float = Field(..., ge=0, le=100)
    rainfall: float = Field(..., ge=0, le=2000)
    nitrogen: float = Field(..., ge=0, le=500)
    phosphorus: float = Field(..., ge=0, le=500)
    potassium: float = Field(..., ge=0, le=500)
    electrical_conductivity: float = Field(..., ge=0, le=20)

class HealthPredictionResponse(BaseModel):
    id: int
    input_parameters: Dict[str, float]
    predicted_health: str
    probabilities: Dict[str, float]
    important_features: Dict[str, float]
    created_at: datetime

    class Config:
        from_attributes = True

class YieldPredictionRequest(BaseModel):
    crop_type: str = Field(...) # Wheat, Rice, Maize, Potato, Tomato
    season: str = Field(...) # Kharif, Rabi, Zaid
    area_hectares: float = Field(..., ge=0.1, le=10000)
    rainfall_mm: float = Field(..., ge=0, le=3000)
    avg_temp_c: float = Field(..., ge=-10, le=50)
    fertilizer_kg_per_ha: float = Field(..., ge=0, le=1000)
    soil_quality_index: float = Field(..., ge=0, le=100)

class YieldPredictionResponse(BaseModel):
    id: int
    input_parameters: Dict[str, Any]
    predicted_yield: float
    unit: str
    important_features: Dict[str, float]
    created_at: datetime

    class Config:
        from_attributes = True
