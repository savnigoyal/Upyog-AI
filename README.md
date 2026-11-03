# Upyog ♻️ — AI-Powered Recycling Assistant

Upyog is a full-stack web application that helps users give discarded items a new life. Upload a photo of any product and the app uses AI to:

1. **Classify** the item from an image (30 waste categories).
2. **Predict** a resale price based on item, condition, and weight (Indian market).
3. **Show** the environmental impact of recycling (CO₂, energy, trees, water saved).
4. **Generate** creative DIY reuse ideas powered by Google Gemini.

Everything runs with **Docker Compose** — no Python, Node, or dependency conflicts on your machine.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture & Integration](#architecture--integration)
- [ML Models & Techniques](#ml-models--techniques)
- [Dataset](#dataset)
- [Project Structure](#project-structure)
- [Local Deployment (Docker Compose)](#local-deployment-docker-compose)
- [Manual Development Setup](#manual-development-setup)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)

---

## Project Overview

Upyog ("use" in Hindi) addresses waste by guiding users toward the most sustainable end-of-life option for an item: **sell**, **recycle**, or **repurpose (DIY)**.

The user flow is:

1. **Upload** a photo of the item on `/upload`.
2. The image is sent to the ML backend, which returns the detected item class.
3. On `/result`, the user can:
   - Get an AI-predicted resale price (₹).
   - Calculate the environmental impact of recycling.
   - Generate DIY reuse ideas using Gemini.

---

## Architecture & Integration

The application is split into two services orchestrated by Docker Compose:

| Service | Technology | Port | Role |
|---------|------------|------|------|
| `frontend` | Next.js 16 (React 19, Tailwind CSS) | 3000 | Web UI + API routes |
| `ml` | FastAPI + Python 3.12 | 8001 | Image classification & price prediction |

### Request flow

**Image classification** — `POST /api/classify` (Next.js) → forwards the uploaded image to `http://ml:8001/predict` → FastAPI runs the TensorFlow Keras model → returns `predicted_class` + confidence.

**Price prediction** — `POST /api/price` (Next.js) → forwards `{item, condition, weight_kg}` to `http://ml:8001/predict-price` → FastAPI runs the pickled scikit-learn pipeline → returns `predicted_price`.

**Environmental impact** — `POST /api/impact` (Next.js) → static lookup table of per-item CO₂, energy, trees, and water savings. No external call.

**DIY ideas** — `POST /api/diy` (Next.js) → calls the Google Gemini REST API directly → returns 5 numbered reuse ideas.

The frontend reaches the ML backend through the `ML_API_URL` environment variable, which Docker Compose sets to `http://ml:8001` (the Compose service name). Outside Docker it defaults to `http://127.0.0.1:8001`.

### Diagram

```
Browser
  │
  ▼
┌──────────────┐      HTTP (Next.js API routes)      ┌───────────┐
│   Next.js    │◄───────────────────────────────────►│   ML      │
│  (port 3000) │                                     │ (port     │
│  UI + APIs   │         Docker network              │  8001)    │
└──────────────┘                                     │ FastAPI   │
       │                                             └───────────┘
       │ Gemini REST API (DIY only)
       ▼
  generativelanguage.googleapis.com
```

---

## ML Models & Techniques

### 1. Image Classification (Waste Detection)
- **Framework:** TensorFlow / Keras
- **Architecture:** EfficientNetB0 base with a custom classification head (GlobalAveragePooling → Dense → Dropout → Dense softmax), plus a Keras augmentation Sequential layer (RandomFlip, RandomRotation, RandomZoom) baked into the saved graph.
- **Input:** 224×224 RGB images, rescaled to `[0, 1]`.
- **Output:** 30 waste categories with confidence.
- **Model files:** `ml/config_model.json` (architecture) + `ml/waste_model.weights.h5` (trained weights).
- **Classes include:** aerosol cans, aluminum/steel/glass/plastic bottles & containers, cardboard, paper, clothing, shoes, food waste, coffee grounds, tea bags, eggshells, styrofoam, and disposable plastics.

### 2. Price Prediction (Resale Value)
- **Framework:** scikit-learn
- **Model:** `RandomForestRegressor` (200 estimators) wrapped in a scikit-learn `Pipeline`.
- **Preprocessing:** `OneHotEncoder(handle_unknown="ignore")` for the categorical `item` and `condition` fields; `weight_kg` passed through numerically.
- **Features:** `item`, `condition`, `weight_kg`.
- **Target:** `final_price`.
- **Model file:** `ml/price_model.pkl` (pickled pipeline).
- **Trained with:** `ml/train_price_model.py`.

### 3. DIY Idea Generation
- **Model:** Google Gemini (`gemini` family) via the Generative Language REST API.
- **Prompting:** Asks for exactly 5 practical, safe DIY reuse ideas with title, materials, and one-sentence instructions, avoiding unsafe uses and special tools.

---

## Dataset

The price model is trained on `ml/upyog_price_dataset.xlsx`, a synthetic/historical resale dataset with these columns:

| Column | Type | Description |
|--------|------|-------------|
| `item` | categorical | Waste item category (matches the 30 classification classes) |
| `condition` | categorical | Item condition (clean, slightly_dirty, dirty, wet, mixed, crushed) |
| `weight_kg` | numeric | Weight of the item in kilograms |
| `final_price` | numeric | Target resale price (₹) |

The pipeline one-hot encodes `item` and `condition`, then regresses `final_price` from `weight_kg` plus the encoded categories using a Random Forest.

The image classification model was trained on a separate foldered image dataset (one subfolder per class) referenced during training in `ml/predict_image.py`; the trained weights are bundled in the repo, so no training dataset is needed at runtime.

---

## Project Structure

```
upyog-ai-recycling-main/
├── docker-compose.yml          # Orchestrates frontend + ml services
├── Dockerfile                  # Next.js production image (standalone output)
├── ml/Dockerfile               # Python/ FastAPI image
├── .env.example                # Copy to .env and fill in GEMINI_API_KEY
├── next.config.ts              # Next.js config (output: standalone)
├── package.json                # Frontend dependencies
├── README.md                   # This file
│
├── app/                        # Next.js App Router
│   ├── page.tsx                # Home / landing page
│   ├── upload/page.tsx         # Image upload + analysis trigger
│   ├── result/page.tsx         # Result: price, impact, DIY
│   └── api/
│       ├── classify/route.ts   # Forwards image to ML /predict
│       ├── price/route.ts      # Forwards price payload to ML /predict-price
│       ├── impact/route.ts     # Static environmental impact lookup
│       └── diy/route.ts        # Calls Gemini API for reuse ideas
│
└── ml/                         # Python ML backend
    ├── api_server.py           # FastAPI app (/predict, /predict-price, /)
    ├── config_model.json       # Keras model architecture
    ├── waste_model.weights.h5  # Trained image classification weights
    ├── price_model.pkl         # Pickled scikit-learn price pipeline
    ├── upyog_price_dataset.xlsx# Price training dataset
    ├── train_price_model.py    # Price model training script
    ├── requirements.txt        # Python dependencies
    └── Dockerfile              # ML container image
```

---

## Local Deployment (Docker Compose)

Docker Compose builds both containers and wires them together, so you do **not** need Python, Node.js, or any ML dependencies installed locally.

### 1. Clone / open the project

```bash
cd upyog-ai-recycling-main
```

### 2. Create the environment file

Copy the example and add your Gemini API key (needed for DIY idea generation):

```bash
cp .env.example .env
```

Edit `.env` and set `GEMINI_API_KEY` to a valid Google Gemini API key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 3. Build and run

```bash
docker compose up --build
```

### 4. Open the app

- Frontend: http://localhost:3000
- ML backend (docs): http://localhost:8001/docs

### 5. Stop

```bash
docker compose down
```

### Rebuild after code changes

```bash
docker compose up --build
```

---

## Manual Development Setup

If you prefer to run without Docker:

### Frontend

```bash
npm ci
npm run dev        # http://localhost:3000
```

### ML backend

```bash
cd ml
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python api_server.py   # http://127.0.0.1:8001
```

Set `ML_API_URL=http://127.0.0.1:8001` in `.env` so the Next.js API routes reach the local backend.

---

## Environment Variables

| Variable | Example | Required | Description |
|----------|---------|----------|-------------|
| `ML_API_URL` | `http://ml:8001` | No | ML backend base URL (Docker compose sets this automatically) |
| `GEMINI_API_KEY` | `AIza...` | Yes (for DIY) | Google Gemini API key |
| `GEMINI_MODEL` | `gemini-2.0-flash` | No | Gemini model name |
| `GEMINI_API_URL` | `https://generativelanguage.googleapis.com/v1beta/models` | No | Gemini API base URL |
| `NODE_ENV` | `production` | No | Frontend node env |

---

## API Endpoints

### Frontend (Next.js, port 3000)

| Endpoint | Method | Body | Description |
|----------|--------|------|-------------|
| `/api/classify` | POST | `formData.file` (image) | Detects item class via ML backend |
| `/api/price` | POST | `{item, condition, weight_kg}` | Predicts resale price via ML backend |
| `/api/impact` | POST | `{item}` | Returns CO₂/energy/trees/water savings |
| `/api/diy` | POST | `{item}` | Generates DIY ideas via Gemini |

### ML backend (FastAPI, port 8001)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check (model load status) |
| `/predict` | POST | Upload image → `{predicted_class, confidence}` |
| `/predict-price` | POST | `{item, condition, weight_kg}` → `{predicted_price}` |
| `/docs` | GET | Swagger UI |

---

## License

MIT