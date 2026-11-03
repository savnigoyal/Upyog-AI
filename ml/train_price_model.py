import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error


# LOAD DATA


df = pd.read_excel("upyog_price_dataset.xlsx")

print("Dataset loaded successfully.")
print("Total rows:", len(df))


# FEATURES & TARGET


X = df[["item", "condition", "weight_kg"]]
y = df["final_price"]


# TRAIN TEST SPLIT


X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)


# PREPROCESSING


categorical_features = ["item", "condition"]
numeric_features = ["weight_kg"]

preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features)
    ],
    remainder="passthrough"
)


# MODEL


model = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("regressor", RandomForestRegressor(n_estimators=200, random_state=42))
    ]
)


# TRAIN


print("Training model...")
model.fit(X_train, y_train)


# EVALUATE


predictions = model.predict(X_test)
mae = mean_absolute_error(y_test, predictions)

print("Model trained successfully.")
print("Mean Absolute Error:", round(mae, 2))


# SAVE MODEL


with open("price_model.pkl", "wb") as f:
    pickle.dump(model, f)

print("Model saved as price_model.pkl")