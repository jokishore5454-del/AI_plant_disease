import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from datasets.prepare_datasets import (
    generate_crop_disease_dataset,
    generate_crop_health_dataset,
    generate_crop_yield_dataset
)
from training.train_health_rf import train_crop_health_rf
from training.train_yield_xgb import train_crop_yield_xgb
from training.train_disease_cnn import train_disease_cnn

def run_pipeline():
    print("==================================================")
    print("    AGRIVISION AI - FULL ML PIPELINE TRAINING     ")
    print("==================================================")
    
    print("\nSTEP 1: Generating & Verifying Datasets...")
    generate_crop_disease_dataset()
    generate_crop_health_dataset()
    generate_crop_yield_dataset()

    print("\nSTEP 2: Training Random Forest Crop Health Model...")
    rf_metrics = train_crop_health_rf()

    print("\nSTEP 3: Training XGBoost Crop Yield Regressor...")
    xgb_metrics = train_crop_yield_xgb()

    print("\nSTEP 4: Training MobileNetV2 CNN Crop Disease Classifier...")
    cnn_metrics = train_disease_cnn()

    print("\n==================================================")
    print(" SUCCESS: All Models Trained & Evaluated Successfully!")
    print(f" CNN Accuracy:      {cnn_metrics.get('accuracy')}")
    print(f" RF F1-Score:       {rf_metrics.get('f1_score')}")
    print(f" XGBoost R2-Score:  {xgb_metrics.get('r2_score')}")
    print(" Metrics stored in ml/models_saved/model_metrics.json")
    print("==================================================")

if __name__ == "__main__":
    run_pipeline()
