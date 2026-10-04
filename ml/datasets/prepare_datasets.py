import os
import json
import numpy as np
import pandas as pd
from PIL import Image, ImageDraw, ImageFilter
import random

# Base paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, "datasets", "processed")
MODELS_DIR = os.path.join(BASE_DIR, "models_saved")

os.makedirs(DATASET_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

# Disease Classes
DISEASE_CLASSES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___healthy",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___healthy"
]

def generate_crop_disease_dataset(num_samples_per_class=40):
    """
    Generates realistic synthetic leaf images with pattern textures for train/val/test splits.
    In a full deployment, PlantVillage or Kaggle leaf dataset is plugged into this folder structure.
    """
    print("Generating/Preparing Crop Disease Image Dataset...")
    disease_dir = os.path.join(DATASET_DIR, "disease")
    
    for split in ["train", "val", "test"]:
        split_dir = os.path.join(disease_dir, split)
        for cls in DISEASE_CLASSES:
            os.makedirs(os.path.join(split_dir, cls), exist_ok=True)

    np.random.seed(42)
    random.seed(42)

    for cls_idx, cls_name in enumerate(DISEASE_CLASSES):
        # Base colors for leaf and disease patterns
        is_healthy = "healthy" in cls_name.lower()
        
        for i in range(num_samples_per_class):
            img = Image.new("RGB", (224, 224), (20, random.randint(40, 70), 20))
            draw = ImageDraw.Draw(img)
            
            # Leaf background shape (ellipse)
            leaf_color = (random.randint(30, 60), random.randint(120, 190), random.randint(30, 70))
            draw.ellipse([20, 20, 204, 204], fill=leaf_color)
            
            # Leaf vein lines
            draw.line([112, 20, 112, 204], fill=(20, random.randint(80, 110), 20), width=3)
            draw.line([112, 70, 50, 130], fill=(20, random.randint(80, 110), 20), width=2)
            draw.line([112, 70, 174, 130], fill=(20, random.randint(80, 110), 20), width=2)
            draw.line([112, 130, 40, 180], fill=(20, random.randint(80, 110), 20), width=2)
            draw.line([112, 130, 184, 180], fill=(20, random.randint(80, 110), 20), width=2)

            if not is_healthy:
                # Add disease spots (scab, rust, blight, spots)
                spot_color = (random.randint(120, 180), random.randint(50, 90), random.randint(10, 40))
                if "blight" in cls_name.lower():
                    spot_color = (random.randint(60, 90), random.randint(40, 60), random.randint(20, 40))
                elif "rust" in cls_name.lower():
                    spot_color = (random.randint(180, 220), random.randint(90, 130), 20)

                for _ in range(random.randint(5, 15)):
                    x = random.randint(40, 180)
                    y = random.randint(40, 180)
                    r = random.randint(6, 18)
                    draw.ellipse([x-r, y-r, x+r, y+r], fill=spot_color)

            # Apply soft blur filter for organic texture
            img = img.filter(ImageFilter.GaussianBlur(radius=0.8))

            # Split allocation: 70% train, 15% val, 15% test
            if i < int(num_samples_per_class * 0.7):
                split = "train"
            elif i < int(num_samples_per_class * 0.85):
                split = "val"
            else:
                split = "test"

            save_path = os.path.join(disease_dir, split, cls_name, f"sample_{i+1:03d}.jpg")
            img.save(save_path, "JPEG")

    print(f"Crop Disease Dataset prepared: {len(DISEASE_CLASSES)} classes.")

def generate_crop_health_dataset(num_samples=1200):
    """
    Generates tabular soil and climate parameters dataset for Crop Health RF classifier.
    Features: soil_ph, soil_moisture, temperature, humidity, rainfall, nitrogen, phosphorus, potassium, electrical_conductivity
    Target: health_status (0: Optimal, 1: Moderate Stress, 2: Severe Stress)
    """
    print("Generating/Preparing Crop Health Dataset...")
    np.random.seed(42)

    soil_ph = np.random.uniform(4.5, 8.5, num_samples)
    soil_moisture = np.random.uniform(15.0, 85.0, num_samples) # %
    temperature = np.random.uniform(12.0, 42.0, num_samples) # Celsius
    humidity = np.random.uniform(30.0, 95.0, num_samples) # %
    rainfall = np.random.uniform(20.0, 300.0, num_samples) # mm
    nitrogen = np.random.uniform(10.0, 140.0, num_samples) # kg/ha
    phosphorus = np.random.uniform(5.0, 90.0, num_samples) # kg/ha
    potassium = np.random.uniform(10.0, 120.0, num_samples) # kg/ha
    ec = np.random.uniform(0.5, 4.5, num_samples) # dS/m

    # Health category heuristic formula based on agronomic logic
    health_status = []
    for i in range(num_samples):
        score = 0
        # Optimal ranges: pH 6.0-7.5, moisture 40-70, N>50, P>30, K>40, temp 20-32
        if 6.0 <= soil_ph[i] <= 7.5: score += 2
        elif 5.5 <= soil_ph[i] <= 8.0: score += 1

        if 40.0 <= soil_moisture[i] <= 70.0: score += 2
        elif 25.0 <= soil_moisture[i] <= 80.0: score += 1

        if 20.0 <= temperature[i] <= 32.0: score += 2
        elif 15.0 <= temperature[i] <= 36.0: score += 1

        if nitrogen[i] >= 60 and phosphorus[i] >= 35 and potassium[i] >= 45: score += 3
        elif nitrogen[i] >= 30 and phosphorus[i] >= 20 and potassium[i] >= 25: score += 1

        if ec[i] <= 2.5: score += 1

        if score >= 7:
            status = 0 # Optimal / Healthy
        elif score >= 4:
            status = 1 # Moderate Stress / Deficiency
        else:
            status = 2 # Severe Stress / Critical

        health_status.append(status)

    df = pd.DataFrame({
        "soil_ph": soil_ph,
        "soil_moisture": soil_moisture,
        "temperature": temperature,
        "humidity": humidity,
        "rainfall": rainfall,
        "nitrogen": nitrogen,
        "phosphorus": phosphorus,
        "potassium": potassium,
        "electrical_conductivity": ec,
        "health_status": health_status
    })

    file_path = os.path.join(DATASET_DIR, "crop_health.csv")
    df.to_csv(file_path, index=False)
    print(f"Crop Health Dataset saved to {file_path}. Total samples: {num_samples}")

def generate_crop_yield_dataset(num_samples=1500):
    """
    Generates tabular dataset for XGBoost Crop Yield Prediction.
    Features: area_hectares, rainfall_mm, avg_temp_c, fertilizer_kg_per_ha, soil_quality_index, crop_type_code, season_code
    Target: yield_tons_per_ha
    """
    print("Generating/Preparing Crop Yield Dataset...")
    np.random.seed(42)

    area = np.random.uniform(0.5, 50.0, num_samples)
    rainfall = np.random.uniform(100.0, 1200.0, num_samples)
    temp = np.random.uniform(15.0, 38.0, num_samples)
    fertilizer = np.random.uniform(20.0, 250.0, num_samples)
    soil_quality = np.random.uniform(30.0, 95.0, num_samples) # index out of 100
    crop_type = np.random.randint(0, 5, num_samples) # 0: Wheat, 1: Rice, 2: Maize, 3: Potato, 4: Tomato
    season = np.random.randint(0, 3, num_samples) # 0: Kharif, 1: Rabi, 2: Zaid

    # Yield base potential per crop type
    crop_base = {0: 3.2, 1: 3.8, 2: 4.5, 3: 18.0, 4: 22.0}
    
    yields = []
    for i in range(num_samples):
        base = crop_base[crop_type[i]]
        rf_factor = np.clip(rainfall[i] / 600.0, 0.4, 1.3)
        temp_factor = 1.0 - abs(temp[i] - 25.0) * 0.025
        fert_factor = 1.0 + (fertilizer[i] / 200.0) * 0.35
        soil_factor = soil_quality[i] / 70.0
        season_mod = 1.05 if season[i] == 0 else (0.95 if season[i] == 1 else 0.90)

        noise = np.random.normal(0, 0.1 * base)
        predicted_y = (base * rf_factor * temp_factor * fert_factor * soil_factor * season_mod) + noise
        yields.append(max(0.5, round(predicted_y, 2)))

    df = pd.DataFrame({
        "area_hectares": area,
        "rainfall_mm": rainfall,
        "avg_temp_c": temp,
        "fertilizer_kg_per_ha": fertilizer,
        "soil_quality_index": soil_quality,
        "crop_type_code": crop_type,
        "season_code": season,
        "yield_tons_per_ha": yields
    })

    file_path = os.path.join(DATASET_DIR, "crop_yield.csv")
    df.to_csv(file_path, index=False)
    print(f"Crop Yield Dataset saved to {file_path}. Total samples: {num_samples}")

if __name__ == "__main__":
    generate_crop_disease_dataset()
    generate_crop_health_dataset()
    generate_crop_yield_dataset()
    print("All datasets prepared successfully!")
