import os
import json
import xgboost as xgb
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "datasets", "processed", "crop_yield.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models_saved")
METRICS_PATH = os.path.join(MODELS_DIR, "model_metrics.json")

os.makedirs(MODELS_DIR, exist_ok=True)

def train_crop_yield_xgb():
    print("=== Training XGBoost Crop Yield Regressor ===")
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}. Run prepare_datasets.py first.")

    df = pd.read_csv(DATA_PATH)
    X = df.drop(columns=["yield_tons_per_ha"])
    y = df["yield_tons_per_ha"]

    feature_names = list(X.columns)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = xgb.XGBRegressor(
        n_estimators=150,
        max_depth=6,
        learning_rate=0.07,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    mae = float(mean_absolute_error(y_test, y_pred))
    mse = float(mean_squared_error(y_test, y_pred))
    rmse = float(np.sqrt(mse))
    r2 = float(r2_score(y_test, y_pred))

    feature_imp = dict(zip(feature_names, [float(v) for v in model.feature_importances_]))

    model_path = os.path.join(MODELS_DIR, "yield_xgb.json")
    model.save_model(model_path)
    print(f"XGBoost model saved to {model_path}")
    print(f"MAE: {mae:.4f}, RMSE: {rmse:.4f}, R2: {r2:.4f}")

    metrics = {}
    if os.path.exists(METRICS_PATH):
        try:
            with open(METRICS_PATH, "r") as f:
                metrics = json.load(f)
        except Exception:
            metrics = {}

    metrics["crop_yield_xgb"] = {
        "model_type": "XGBRegressor",
        "mae": round(mae, 4),
        "mse": round(mse, 4),
        "rmse": round(rmse, 4),
        "r2_score": round(r2, 4),
        "feature_importances": feature_imp,
        "features": feature_names,
        "sample_test_predictions": [
            {"actual": round(float(act), 2), "predicted": round(float(prd), 2)}
            for act, prd in zip(y_test.values[:10], y_pred[:10])
        ]
    }

    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    return metrics["crop_yield_xgb"]

if __name__ == "__main__":
    train_crop_yield_xgb()
