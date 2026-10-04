import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "datasets", "processed", "crop_health.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models_saved")
METRICS_PATH = os.path.join(MODELS_DIR, "model_metrics.json")

os.makedirs(MODELS_DIR, exist_ok=True)

def train_crop_health_rf():
    print("=== Training Random Forest Crop Health Classifier ===")
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}. Run prepare_datasets.py first.")

    df = pd.read_csv(DATA_PATH)
    X = df.drop(columns=["health_status"])
    y = df["health_status"]

    feature_names = list(X.columns)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    model = RandomForestClassifier(n_estimators=120, max_depth=10, random_state=42, class_weight='balanced')
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    acc = float(accuracy_score(y_test, y_pred))
    prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='weighted')
    cm = confusion_matrix(y_test, y_pred).tolist()
    feature_imp = dict(zip(feature_names, [float(v) for v in model.feature_importances_]))

    model_path = os.path.join(MODELS_DIR, "health_rf.joblib")
    joblib.dump(model, model_path)
    print(f"Random Forest model saved to {model_path}")
    print(f"Accuracy: {acc:.4f}, F1-Score: {f1:.4f}")

    # Update model_metrics.json
    metrics = {}
    if os.path.exists(METRICS_PATH):
        try:
            with open(METRICS_PATH, "r") as f:
                metrics = json.load(f)
        except Exception:
            metrics = {}

    metrics["crop_health_rf"] = {
        "model_type": "RandomForestClassifier",
        "accuracy": round(acc, 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1_score": round(float(f1), 4),
        "confusion_matrix": cm,
        "feature_importances": feature_imp,
        "features": feature_names,
        "target_classes": ["Optimal / Healthy", "Moderate Stress / Deficiency", "Severe Stress / Critical"]
    }

    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    return metrics["crop_health_rf"]

if __name__ == "__main__":
    train_crop_health_rf()
