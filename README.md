# Amazon Flash Mode ⚡

> **"Tell us your situation, not the product."**

Amazon Flash Mode is a quick-commerce MVP that transforms shopping from:

**Search → Browse → Compare → Buy**

into:

**Situation → Instant Bundle → One-Tap Checkout**

Customers describe their situation in one sentence and instantly receive a complete, ready-to-buy bundle.

---

## 🚀 Features

- **Flash Mode Toggle** — Switch between Normal Mode and Flash Mode ⚡
- **Text-Based Intent Input** — Describe your need in one sentence
- **Rule-Based Intent Engine** — Keyword matching with future Bedrock slot
- **Dynamic Bundle Generator** — Complete bundles for every situation
- **Smart Recommendations** — Need → Complete Experience
- **Emergency Quick Actions** — One-tap situation buttons
- **Flash Mode Calendar** — Auto-suggest carts from upcoming calendar events
- **Budget-Constrained Flash Mode** — Optional budget slider/input; AI optimizes the bundle to fit
- **Smart Context Questions** — AI asks 2-3 clarifying questions before generating the bundle for accuracy
- **Browser Extension** — Highlight text on any webpage and open Flash Mode pre-filled
- **One-Tap Cart** — Add entire bundle, edit quantities, checkout
- **Split the Bill** — Split order total among friends and share
- **Trending Recommendations** — Home page products based on recent searches and demands

---

## 🏗️ Architecture

```
User
  ↓
React SPA (S3 + CloudFront)
  ↓
API Gateway (HTTP API)
  ↓
AWS Lambda (FastAPI + Mangum)
  ↓
Intent Engine + DynamoDB
  ↓
Generated Cart
```

### AWS Services Used (Free Tier)

| Service | Purpose |
|---------|---------|
| Amazon S3 | Host React frontend + static assets |
| Amazon CloudFront | Global CDN |
| Amazon API Gateway | Serverless API endpoints |
| AWS Lambda | Backend business logic |
| Amazon DynamoDB | Products, bundles, sessions |
| Amazon CloudWatch | Logs and metrics |

---

## 📁 Project Structure

```
├── frontend/            # React + TypeScript + Tailwind CSS
├── backend/             # Python + FastAPI
├── browser-extension/   # Chrome extension for webpage text → Flash Cart
├── infra/               # AWS SAM templates + deployment scripts
└── README.md
```

---

## 🛠️ Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at: `http://127.0.0.1:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173` and proxies `/api` to the backend.

### Browser Extension

1. Open Chrome → `chrome://extensions/` → enable **Developer mode**
2. Click **Load unpacked** and select the `browser-extension` folder
3. Highlight any text on any webpage → right-click → **"⚡ Add to Flash Cart"**

Update `FLASH_APP_URL` in `browser-extension/background.js` if your frontend URL changes.

### Run Tests

```bash
# Backend tests
cd backend
pytest

# Frontend build
cd frontend
npm run build
```

---

## ☁️ AWS Deployment

### 1. Deploy Backend

```bash
cd infra
./deploy.sh flash-mode-backend prod
```

This creates:
- Lambda function
- API Gateway HTTP API
- DynamoDB tables (Products, Bundles, Sessions)

### 2. Seed DynamoDB

```bash
cd backend
source venv/bin/activate
python scripts/seed_dynamodb.py
```

### 3. Deploy Frontend

```bash
# Create S3 bucket and CloudFront distribution first via AWS Console or CLI
cd infra
./deploy_frontend.sh your-s3-bucket-name your-cloudfront-distribution-id
```

Update `frontend/.env` with the API Gateway URL before building:

```env
VITE_API_BASE_URL=https://your-api-url.execute-api.us-east-1.amazonaws.com
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/generate-cart` | Generate a bundle from a natural language query (optional `budget`, `context`) |
| POST | `/add-bundle-to-cart` | Add bundle items to cart |
| GET | `/bundles` | List all bundle templates |
| GET | `/products` | List all products |
| GET | `/health` | Health check |
| GET | `/calendar-events` | Upcoming events with suggested carts |
| GET | `/recommendations` | Trending products, recent searches, popular bundles |
| GET | `/trending` | Trending products only |
| POST | `/split-bill` | Split order total among N people |

---

## 🧪 Demo Scenarios

| Input | Output |
|-------|--------|
| "I have a fever." | Recovery Kit |
| "Guests are coming in 30 minutes." | Party Kit |
| "I want to make pasta tonight." | Pasta Night Kit |
| "I need snacks for movie night." | Movie Night Kit |
| "I am moving into a new apartment." | Home Setup Kit |
| "Movie night under ₹500" | Movie Night Kit (filtered to budget) |
| "Housewarming essentials under ₹2000" | Home Setup Kit (filtered to budget) |
| "Guests are coming" | Party Kit (asks: guest count, diet, occasion) |
| "I want to decorate my room" | Room Decor Kit (asks: room, vibe) |

---

## 🧠 LLM Fallback (Optional)

By default, Flash Mode uses a fast, zero-cost **rule-based keyword engine**. If a query doesn't match any known keywords, the system can optionally call **Groq** (e.g., `llama-3.3-70b-versatile`) to classify the situation.

To enable it, set your Groq API key:

```bash
# backend/.env
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile
```

No API key = rule-based engine only (still works for all keyword matches).

## 🔮 Future Extension

The `intent_engine.py` module exposes a single `detect_intent(query)` function. The rule-based + Groq implementation can be replaced with **Amazon Bedrock** without changing any routes or frontend code.

---

## 📊 Success Metrics

- Bundle generated in under **3 seconds**
- Purchase flow completed in under **5 seconds**
- **Zero** manual product search
- Increased basket size through bundles
