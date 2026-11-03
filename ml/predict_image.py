import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2
import os

MODEL_PATH = "waste_model.weights.h5"
DATASET_PATH = "../dataset"

# Get class names in same alphabetical order
class_names = sorted(os.listdir(DATASET_PATH))

# Build EXACT same architecture
base_model = MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights='imagenet'
)

base_model.trainable = False

model = models.Sequential([
    layers.Rescaling(1./255),
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.3),
    layers.Dense(30, activation='softmax')
])

# Build model before loading weights
model.build((None, 224, 224, 3))

# Load weights
model.load_weights(MODEL_PATH)

def predict_image(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)

    predictions = model.predict(img_array)
    predicted_class = class_names[np.argmax(predictions)]

    return predicted_class


if __name__ == "__main__":
    print("Model loaded successfully.")

    class_folder = "../dataset/aerosol_cans"

    # Go inside first subfolder (like 'default')
    subfolders = os.listdir(class_folder)
    first_subfolder = os.path.join(class_folder, subfolders[0])

    # Now get image files inside that subfolder
    image_files = [
        f for f in os.listdir(first_subfolder)
        if f.lower().endswith(('.png', '.jpg', '.jpeg'))
    ]

    first_image = image_files[0]
    full_path = os.path.join(first_subfolder, first_image)

    print("Testing image:", full_path)

    prediction = predict_image(full_path)
    print("Predicted class:", prediction)