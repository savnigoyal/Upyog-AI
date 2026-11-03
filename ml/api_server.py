
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
import base64
from io import BytesIO
import cv2
from PIL import Image

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

def find_last_conv_layer(model_obj):
    last_conv = None

    def visit(node):
        nonlocal last_conv
        if isinstance(node, tf.keras.layers.Conv2D):
            last_conv = node
        elif isinstance(node, tf.keras.Model):
            for child in node.layers:
                visit(child)

    for layer in model_obj.layers:
        visit(layer)

    return last_conv


def encode_image_to_base64(image_array):
    success, encoded = cv2.imencode(".jpg", image_array)
    if not success:
        raise ValueError("Unable to encode image to JPEG data.")
    return "data:image/jpeg;base64," + base64.b64encode(encoded.tobytes()).decode("utf-8")


def extract_dominant_region(heatmap):
    if heatmap.size == 0:
        return "center"

    high_activation = heatmap > np.quantile(heatmap, 0.75)
    if not np.any(high_activation):
        return "center"

    ys, xs = np.where(high_activation)
    center_x = int(np.mean(xs))
    center_y = int(np.mean(ys))
    height, width = heatmap.shape

    x_bucket = "left" if center_x < width * 0.33 else "right" if center_x > width * 0.66 else "center"
    y_bucket = "upper" if center_y < height * 0.33 else "lower" if center_y > height * 0.66 else "middle"

    if y_bucket == "middle":
        return f"{x_bucket} middle region"
    if x_bucket == "center":
        return f"{y_bucket} center region"
    return f"{y_bucket} {x_bucket} region"


def generate_gradcam(img_path):
    if model is None:
        raise RuntimeError("Waste classification model is unavailable.")

    img = image.load_img(img_path, target_size=(224, 224), color_mode="rgb")
    img_array = image.img_to_array(img)
    img_array_batch = np.expand_dims(img_array, axis=0)

    prediction = model.predict(img_array_batch, verbose=0)[0]
    predicted_index = int(np.argmax(prediction))
    predicted_class = CLASS_NAMES[predicted_index]
    confidence = float(prediction[predicted_index])

    target_layer = find_last_conv_layer(model)
    if target_layer is None:
        raise RuntimeError("Could not locate a convolutional layer for Grad-CAM.")

    grad_model = tf.keras.models.Model(
        inputs=model.inputs,
        outputs=[target_layer.output, model.output]
    )

    with tf.GradientTape() as tape:
        conv_outputs, outputs = grad_model(tf.cast(img_array_batch, tf.float32))
        class_channel = outputs[:, predicted_index]

    grads = tape.gradient(class_channel, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    heatmap = tf.reduce_mean(tf.cast(conv_outputs, tf.float32) * pooled_grads, axis=-1)
    heatmap = tf.nn.relu(heatmap)
    heatmap = heatmap.numpy()[0]
    heatmap = heatmap / (np.max(heatmap) + 1e-8)

    heatmap_resized = cv2.resize(heatmap, (img.width, img.height))
    heatmap_uint8 = np.uint8(255 * heatmap_resized)
    heatmap_color = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)

    original_bgr = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    overlay = cv2.addWeighted(original_bgr, 0.65, heatmap_color, 0.35, 0)

    dominant_region = extract_dominant_region(heatmap_resized)
    explanation = (
        f"The strongest activation appears in the {dominant_region}, where the model found the most distinctive visual cues "
        f"for {predicted_class}. These highlighted pixels most strongly influenced the prediction toward this waste category."
    )

    return {
        "predicted_class": predicted_class,
        "confidence": round(confidence * 100, 2),
        "dominant_region": dominant_region,
        "explanation": explanation,
        "original_image": encode_image_to_base64(original_bgr),
        "heatmap_image": encode_image_to_base64(heatmap_color),
        "overlay_image": encode_image_to_base64(overlay),
    }


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

    # The shared model configuration includes its own
    # preprocessing/augmentation layers.
    predictions = model.predict(img_array, verbose=0)

    predicted_index = int(np.argmax(predictions[0]))

    predicted_class = CLASS_NAMES[predicted_index]

    confidence = float(predictions[0][predicted_index])

    return {
        "predicted_class": predicted_class,
        "confidence": round(confidence * 100, 2)
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
# GRAD-CAM EXPLANATION ENDPOINT
# --------------------------------------------------

@app.post("/explain")
async def explain(file: UploadFile = File(...)):
    if model is None:
        return {
            "error": "Image classification model is not available."
        }

    temp_path = os.path.join(
        BASE_DIR,
        f"gradcam_{uuid.uuid4().hex}.jpg"
    )

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        try:
            with Image.open(temp_path) as image_obj:
                image_obj.verify()
        except Exception as exc:
            raise ValueError(f"Invalid image uploaded: {str(exc)}") from exc

        explanation = generate_gradcam(temp_path)
        return explanation

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
