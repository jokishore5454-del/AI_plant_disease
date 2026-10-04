# AgriVision AI: An Integrated Machine Learning Framework for Crop Disease Detection, Crop Health Monitoring, and Yield Prediction Using CNN, Random Forest, and XGBoost

[![Framework](https://img.shields.io/badge/AgriVision-v1.0.0-green.svg)](https://github.com/premkumar-s/agrivision-ai)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org)

## 🌿 PROJECT OVERVIEW
**AgriVision AI** is an industrial-grade full-stack artificial intelligence web application engineered to solve critical agricultural challenges through computer vision, soil chemical telemetry, and predictive harvest regression.

### 👥 DEVELOPMENT TEAM
* **Lead Developer:** Prem Kumar.S
* **Sub-Developer:** Kishore V A
* **Domain:** Artificial Intelligence, Machine Learning, Precision Agriculture & Full-Stack Web Development

---

## ⚡ KEY FEATURES & CAPABILITIES
1. **CNN Crop Disease Detection:** MobileNetV2 transfer learning convolutional network analyzing leaf images across 10 crop categories with top-3 predictions and agronomic recommendations.
2. **Random Forest Crop Health Assessment:** Multi-variable decision tree classifier evaluating soil telemetry (pH, N-P-K, EC, moisture) and microclimate parameters.
3. **XGBoost Crop Yield Regressor:** Gradient-boosted harvest prediction model incorporating area, precipitation, temperature, and fertilizer rates.
4. **AI Agricultural Assistant:** Domain-tuned AI advisory layer providing contextual explanations and soil management advice.
5. **Secure Authentication & RBAC:** JWT bearer tokens, Argon2/Bcrypt password hashing, bootstrap admin initialization, and role-based access control.
6. **User Data Isolation:** Enforced database queries isolating personal prediction history between users.
7. **Admin Management Portal:** Administrative user management, system audit logging, dataset status, and model evaluation telemetry.

---

## 🛠 TECH STACK & SYSTEM ARCHITECTURE
* **Frontend:** React 18, Vite, Tailwind CSS, Recharts, Lucide React icons
* **Backend APIs:** FastAPI, Uvicorn, SQLAlchemy ORM, Pydantic v2, PyJWT, Passlib/Bcrypt
* **Machine Learning:** TensorFlow/Keras (MobileNetV2), Scikit-Learn (Random Forest), XGBoost (XGBRegressor), Pandas, NumPy, Pillow
* **Database:** SQLite (SQLAlchemy ORM)

---

## 💻 WINDOWS EXECUTION INSTRUCTIONS

### 1. Environment Setup & Virtual Environment
```powershell
# Navigate to workspace
cd d:\Agrivision

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Install backend dependencies
pip install -r backend/requirements.txt
```

### 2. Prepare Datasets & Train ML Models
```powershell
# Run automatic dataset acquisition and full model training pipeline
python ml/train_all.py
```

### 3. Run FastAPI Backend Server
```powershell
# Execute Uvicorn server on port 8000
python -m uvicorn app.main:app --reload --app-dir backend
```

### 4. Run React Vite Frontend
```powershell
# In a new terminal tab, navigate to frontend
cd d:\Agrivision\frontend

# Install dependencies
npm install

# Start Vite development server on port 3000
npm run dev
```

---

## 🍎 macOS / LINUX EXECUTION INSTRUCTIONS

```bash
# 1. Virtual Environment
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Train Models
python3 ml/train_all.py

# 4. Start Backend Server
python3 -m uvicorn app.main:app --reload --app-dir backend

# 5. Start Frontend
cd frontend
npm install
npm run dev
```

---

## 🔑 BOOTSTRAP ADMINISTRATOR CREDENTIALS
During startup, the system automatically initializes the administrator account from environment variables:

* **Admin Username:** `premkumar`
* **Admin Initial Password:** `kishore`

> **Note:** Credentials can be changed after initial setup via the Admin Portal or `.env`.

---

## 🧪 RUNNING AUTOMATED SUITE
```powershell
# Execute pytest validation suite
pytest tests/
```

---

## 🛡 SECURITY AUDIT HIGHLIGHTS
* Password hashing using Argon2 / Bcrypt.
* JWT bearer token authentication with 24h expiration.
* Input validation & file sanitization (MIME format check, size limit 10MB, safe UUID filenames).
* Parameterized SQL queries preventing SQL Injection.
* User isolation enforced at database model layer.

---

© 2026 AgriVision AI Framework • Prem Kumar.S & Kishore V A
