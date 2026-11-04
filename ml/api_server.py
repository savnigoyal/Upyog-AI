
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import uvicorn
import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image
import os
import shutil
import pickle
import pandas as pd
import json
import uuid
from sklearn.ensemble import RandomForestRegressor

app = FastAPI(title="Upyog AI Recycling API")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# --------------------------------------------------
# CLASS NAMES - MUST MATCH TRAINING CLASS ORDER
# --------------------------------------------------

CLASS_NAMES = [
    "aerosol_cans",
    "aluminum_food_cans",
    "aluminum_soda_cans",
    "cardboard_boxes",
    "cardboard_packaging",
    "clothing",
    "coffee_grounds",
    "disposable_plastic_cutlery",
    "eggshells",
    "food_waste",
    "glass_beverage_bottles",
    "glass_cosmetic_containers",
    "glass_food_jars",
    "magazines",
    "newspaper",
    "office_paper",
    "paper_cups",
    "plastic_cup_lids",
    "plastic_detergent_bottles",
    "plastic_food_containers",
    "plastic_shopping_bags",
    "plastic_soda_bottles",
    "plastic_straws",
    "plastic_trash_bags",
    "plastic_water_bottles",
    "shoes",
    "steel_food_cans",
    "styrofoam_cups",
    "styrofoam_food_containers",
    "tea_bags",
]


# --------------------------------------------------
# LOAD IMAGE CLASSIFICATION MODEL
# --------------------------------------------------

ARCHITECTURE_PATH = os.path.join(BASE_DIR, "config_model.json")
WEIGHTS_PATH = os.path.join(BASE_DIR, "waste_model.weights.h5")

model = None


def load_waste_model():

    global model

    if not os.path.isfile(ARCHITECTURE_PATH):
        print("ERROR: waste_model.json not found.")
        return

    if not os.path.isfile(WEIGHTS_PATH):
        print("ERROR: waste_model.weights.h5 not found.")
        return

    try:
        print("Loading waste classification architecture...")

        with open(ARCHITECTURE_PATH, "r", encoding="utf-8") as f:
            model_config = json.load(f)

        # Reconstruct the original Keras model
        model_json = json.dumps(model_config)

        loaded_model = tf.keras.models.model_from_json(model_json)

        print("Architecture loaded successfully.")

        # Load trained weights
        loaded_model.load_weights(WEIGHTS_PATH)

        print("Trained weights loaded successfully.")

        # Validate output dimensions
        output_shape = loaded_model.output_shape

        if output_shape[-1] != len(CLASS_NAMES):
            raise ValueError(
                f"Model has {output_shape[-1]} outputs, "
                f"but CLASS_NAMES has {len(CLASS_NAMES)} classes."
            )

        loaded_model.trainable = False
        model = loaded_model

        print("Waste classification model ready!")
        print("Architecture: EfficientNetB0")
        print(f"Number of classes: {len(CLASS_NAMES)}")

    except Exception as e:
        model = None
        print("ERROR loading waste classification model:")
        print(str(e))


load_waste_model()


# --------------------------------------------------
# LOAD WASTE MARKET DEMAND MODEL
# --------------------------------------------------

MARKET_DEMAND_DATA_PATH = os.path.join(BASE_DIR, "market_demand_sample_data.csv")
DEMAND_CATEGORY_LABELS = {
    "plastic": "Plastic",
    "cardboard": "Cardboard",
    "paper": "Paper",
    "metal": "Metal",
    "glass": "Glass",
    "clothing": "Clothing",
    "electronic_waste": "Electronic Waste",
}
DEMAND_FEATURE_COLUMNS = [
    "month_index",
    "collection_volume_kg",
    "seasonal_index",
    "price_index",
    "recycling_policy_score",
    "consumer_interest_score",
    "supply_pressure_index",
]

demand_model = None
demand_dataset = None


def load_market_demand_model():
    global demand_model, demand_dataset

    if not os.path.isfile(MARKET_DEMAND_DATA_PATH):
        print("ERROR: market_demand_sample_data.csv not found.")
        return

    try:
        demand_dataset = pd.read_csv(MARKET_DEMAND_DATA_PATH)

        if demand_dataset.empty:
            raise ValueError("Sample market demand dataset is empty.")

        required_columns = DEMAND_FEATURE_COLUMNS + ["category", "demand_index"]
        missing = [col for col in required_columns if col not in demand_dataset.columns]
        if missing:
            raise ValueError(f"Sample market demand dataset missing columns: {missing}")

        features = demand_dataset[DEMAND_FEATURE_COLUMNS]
        targets = demand_dataset["demand_index"]

        model = RandomForestRegressor(n_estimators=300, random_state=42)
        model.fit(features, targets)

        demand_model = model

        print("Waste market demand model ready!")
        print(f"Demand categories: {sorted(demand_dataset['category'].unique().tolist())}")
    except Exception as e:
        demand_model = None
        demand_dataset = None
        print("ERROR loading waste market demand model:")
        print(str(e))


load_market_demand_model()


def get_demand_level(score):
    if score >= 75:
        return "High"
    if score >= 55:
        return "Medium"
    return "Low"


def get_market_demand_summary(top_categories):
    leading_category = top_categories[0]
    leading_level = leading_category["demand_level"]
    leading_label = leading_category["label"]

    if leading_level == "High":
        return (
            f"{leading_label} leads the demand outlook in the sample market dataset, "
            "showing a strong upward trend with elevated collection and recycler interest."
        )
    if leading_level == "Medium":
        return (
            f"{leading_label} shows a stable demand profile in the sample market dataset, "
            "with healthy but not surge-level activity across recent periods."
        )
    return (
        f"{leading_label} remains a lower-priority segment in the sample market dataset, "
        "with softer demand signals and slower recovery momentum."
    )


def build_market_demand_response(item="", category=""):
    if demand_model is None or demand_dataset is None:
        raise RuntimeError("Waste market demand model is unavailable.")

    results = []
    for cat_name in sorted(demand_dataset["category"].unique().tolist()):
        category_history = demand_dataset[demand_dataset["category"] == cat_name]
        feature_row = category_history[DEMAND_FEATURE_COLUMNS].mean().to_dict()
        score = float(demand_model.predict(pd.DataFrame([feature_row]))[0])
        level = get_demand_level(score)

        label = DEMAND_CATEGORY_LABELS.get(cat_name, cat_name.replace("_", " ").title())
        if level == "High":
            explanation = (
                f"The sample demand model indicates {label.lower()} is trending strongly because recent "
                "recovery volume, consumer demand, and market activity remain elevated."
            )
            recommendation = (
                f"Increase collection and sales focus for {label.lower()} to capture stronger demand and maintain inventory turnover."
            )
        elif level == "Medium":
            explanation = (
                f"The sample demand model shows {label.lower()} is performing steadily, with moderate buying interest and balanced supply conditions."
            )
            recommendation = (
                f"Maintain a consistent sales flow for {label.lower()} and prioritize sorting efficiency to optimize margins."
            )
        else:
            explanation = (
                f"The sample demand model suggests {label.lower()} is slower than the market leaders, with weaker near-term buying momentum."
            )
            recommendation = (
                f"Reduce excess stock and focus on quality sorting or targeted bundles to improve sales for {label.lower()}."
            )

        results.append({
            "category": cat_name,
            "label": label,
            "demand_index": round(score, 2),
            "demand_level": level,
            "explanation": explanation,
            "recommendation": recommendation,
        })

    top_categories = sorted(results, key=lambda item_data: item_data["demand_index"], reverse=True)[:5]
    summary = get_market_demand_summary(top_categories)

    if item:
        item_key = item.lower()
        for category_data in top_categories:
            if category_data["category"] in item_key or item_key in category_data["category"]:
                summary = (
                    f"Detected item category aligns with {category_data['label']} demand, which is currently projected at {category_data['demand_level']} in the sample model."
                )
                break

    return {
        "source": "Sample market dataset",
        "is_demo_data": True,
        "summary": summary,
        "recommendation": top_categories[0]["recommendation"],
        "top_categories": top_categories,
    }


# --------------------------------------------------
# LOAD PRICE PREDICTION MODEL
# --------------------------------------------------

price_model = None

PRICE_MODEL_PATH = os.path.join(BASE_DIR, "price_model.pkl")

try:
    with open(PRICE_MODEL_PATH, "rb") as f:
        price_model = pickle.load(f)

    print("Price prediction model loaded successfully.")

except Exception as e:
    print("ERROR loading price prediction model:")
    print(str(e))


# --------------------------------------------------
# IMAGE PREPROCESSING AND PREDICTION
# --------------------------------------------------

def predict_image(img_path):

    if model is None:
        raise RuntimeError("Waste classification model is unavailable.")

    img = image.load_img(
        img_path,
        target_size=(224, 224),
        color_mode="rgb"
    )

    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)

    predictions = model.predict(img_array, verbose=0)[0]

    predicted_index = int(np.argmax(predictions))
    predicted_class = CLASS_NAMES[predicted_index]
    confidence = float(predictions[predicted_index])

    return {
        "predicted_class": predicted_class,
        "confidence": round(confidence * 100, 2),
    }


# --------------------------------------------------
# IMAGE CLASSIFICATION ENDPOINT
# --------------------------------------------------

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    if model is None:
        return {
            "error": "Image classification model is not available."
        }

    # Unique filename avoids collisions between simultaneous requests
    temp_path = os.path.join(
        BASE_DIR,
        f"temp_{uuid.uuid4().hex}.jpg"
    )

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        result = predict_image(temp_path)

        return result

    except Exception as e:
        return {
            "error": str(e)
        }

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

        await file.close()


# --------------------------------------------------
# WASTE MARKET DEMAND ENDPOINT
# --------------------------------------------------

class MarketDemandRequest(BaseModel):
    item: str = ""
    category: str = ""


@app.post("/predict-market-demand")
async def predict_market_demand(request: MarketDemandRequest):
    try:
        result = build_market_demand_response(request.item, request.category)
        return result
    except Exception as e:
        return {
            "error": str(e)
        }


# --------------------------------------------------
# PRICE PREDICTION REQUEST
# --------------------------------------------------

class PriceRequest(BaseModel):
    item: str
    condition: str
    weight_kg: float


# --------------------------------------------------
# PRICE PREDICTION ENDPOINT
# --------------------------------------------------

@app.post("/predict-price")
async def predict_price(request: PriceRequest):

    if price_model is None:
        return {
            "error": "Price prediction model is not available."
        }

    try:

        if request.weight_kg <= 0:
            return {
                "error": "Weight must be greater than zero."
            }

        input_data = pd.DataFrame([{
            "item": request.item,
            "condition": request.condition,
            "weight_kg": request.weight_kg
        }])

        predicted_price = price_model.predict(input_data)[0]

        return {
            "item": request.item,
            "condition": request.condition,
            "weight_kg": request.weight_kg,
            "predicted_price": round(float(predicted_price), 2)
        }

    except Exception as e:
        return {
            "error": str(e)
        }


# --------------------------------------------------
# HEALTH CHECK ENDPOINT
# --------------------------------------------------

@app.get("/")
async def root():

    return {
        "message": "Upyog AI Recycling API is running!",
        "image_model_loaded": model is not None,
        "price_model_loaded": price_model is not None
    }


# --------------------------------------------------
# RUN SERVER
# --------------------------------------------------

if __name__ == "__main__":

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001
    )
