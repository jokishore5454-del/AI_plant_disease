import pytest
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, "backend"))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert "AgriVision AI" in response.json()["title"]

def test_admin_bootstrap_login():
    response = client.post("/api/auth/login", json={
        "username": "premkumar",
        "password": "kishore"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["username"] == "premkumar"
    assert data["user"]["role"] == "admin"

def test_invalid_login():
    response = client.post("/api/auth/login", json={
        "username": "premkumar",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "Invalid username or password" in response.json()["detail"]

def test_user_registration_and_login():
    import random
    rand_user = f"testuser_{random.randint(1000, 9999)}"
    reg_resp = client.post("/api/auth/register", json={
        "username": rand_user,
        "email": f"{rand_user}@agrivision.ai",
        "password": "TestPassword123!"
    })
    assert reg_resp.status_code == 200
    assert reg_resp.json()["role"] == "user"

    login_resp = client.post("/api/auth/login", json={
        "username": rand_user,
        "password": "TestPassword123!"
    })
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    # Verify protected route /auth/me
    me_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["username"] == rand_user
