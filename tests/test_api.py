import pytest
import os
import sys
import base64
import io
from PIL import Image

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, "backend"))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_user_data_isolation():
    # Login user A
    client.post("/api/auth/register", json={"username": "userA", "email": "usera@agrivision.ai", "password": "UserA_Password123!"})
    resp_a = client.post("/api/auth/login", json={"username": "userA", "password": "UserA_Password123!"})
    token_a = resp_a.json()["access_token"]

    # Login user B
    client.post("/api/auth/register", json={"username": "userB", "email": "userb@agrivision.ai", "password": "UserB_Password123!"})
    resp_b = client.post("/api/auth/login", json={"username": "userB", "password": "UserB_Password123!"})
    token_b = resp_b.json()["access_token"]

    # User A creates a yield prediction
    yield_req = {
        "crop_type": "Rice",
        "season": "Kharif",
        "area_hectares": 3.5,
        "rainfall_mm": 800.0,
        "avg_temp_c": 28.0,
        "fertilizer_kg_per_ha": 140.0,
        "soil_quality_index": 75.0
    }
    pred_a = client.post("/api/yield/predict", json=yield_req, headers={"Authorization": f"Bearer {token_a}"})
    assert pred_a.status_code == 200

    # User B fetches history -> must NOT see User A's yield record!
    hist_b = client.get("/api/history?prediction_type=yield", headers={"Authorization": f"Bearer {token_b}"})
    assert hist_b.status_code == 200
    b_yield_records = hist_b.json()["yield"]
    assert len(b_yield_records) == 0 # Isolated!

    # Normal user B tries to access admin API -> Must be rejected with 403 Forbidden!
    admin_attempt = client.get("/api/admin/users", headers={"Authorization": f"Bearer {token_b}"})
    assert admin_attempt.status_code == 403
    assert "Administrator permissions required" in admin_attempt.json()["detail"]

def test_webcam_live_detection_endpoint():
    # Login user
    rand_user = "webcam_tester"
    client.post("/api/auth/register", json={"username": rand_user, "email": f"{rand_user}@agrivision.ai", "password": "WebcamPassword123!"})
    login_resp = client.post("/api/auth/login", json={"username": rand_user, "password": "WebcamPassword123!"})
    token = login_resp.json()["access_token"]

    # Create a synthetic 224x224 leaf image and encode as base64 data URI
    img = Image.new("RGB", (224, 224), color=(40, 160, 40))
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG")
    base64_str = "data:image/jpeg;base64," + base64.b64encode(buffer.getvalue()).decode("utf-8")

    # Post base64 webcam frame to endpoint
    webcam_payload = {
        "image_data": base64_str,
        "detection_mode": "capture",
        "low_confidence_threshold": 0.60
    }

    res = client.post("/api/disease/predict/webcam", json=webcam_payload, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()

    assert "crop_name" in data
    assert "disease_name" in data
    assert "confidence" in data
    assert data["detection_mode"] == "webcam"
    assert len(data["top_predictions"]) > 0

    # Verify that the webcam prediction was saved in the user's isolated history
    hist_res = client.get("/api/history?prediction_type=disease", headers={"Authorization": f"Bearer {token}"})
    assert hist_res.status_code == 200
    disease_records = hist_res.json()["disease"]
    assert len(disease_records) >= 1
    assert disease_records[0]["crop_name"] == data["crop_name"]
