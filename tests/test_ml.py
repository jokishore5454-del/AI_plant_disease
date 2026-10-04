import pytest
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, "backend"))

from app.services.ml_service import ml_service

def test_crop_health_rf_prediction():
    sample_input = {
        "soil_ph": 6.8,
        "soil_moisture": 58.0,
        "temperature": 25.0,
        "humidity": 65.0,
        "rainfall": 150.0,
        "nitrogen": 90.0,
        "phosphorus": 50.0,
        "potassium": 55.0,
        "electrical_conductivity": 1.1
    }
    result = ml_service.predict_health(sample_input)
    assert "predicted_health" in result
    assert "probabilities" in result
    assert "important_features" in result
    assert isinstance(result["predicted_health"], str)

def test_crop_yield_xgb_prediction():
    sample_input = {
        "crop_type": "Wheat",
        "season": "Kharif",
        "area_hectares": 10.0,
        "rainfall_mm": 700.0,
        "avg_temp_c": 24.5,
        "fertilizer_kg_per_ha": 120.0,
        "soil_quality_index": 82.0
    }
    result = ml_service.predict_yield(sample_input)
    assert "predicted_yield" in result
    assert result["predicted_yield"] > 0
    assert result["unit"] == "tons/ha"
    assert "important_features" in result
