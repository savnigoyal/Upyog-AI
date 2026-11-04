
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
    top_indices = np.argsort(predictions)[::-1][:3]

    top_predictions = []
    for idx in top_indices:
        score = float(predictions[idx])
        top_predictions.append({
            "class_name": CLASS_NAMES[int(idx)],
            "confidence": round(score * 100, 2),
        })

    predicted_index = int(np.argmax(predictions))
    predicted_class = CLASS_NAMES[predicted_index]
    confidence = float(predictions[predicted_index])

    return {
        "predicted_class": predicted_class,
        "confidence": round(confidence * 100, 2),
        "top_predictions": top_predictions,
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
