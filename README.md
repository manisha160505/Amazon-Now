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

### Option 1: GitHub Actions (fully automated)

A complete CI/CD pipeline is provided in `.github/workflows/deploy.yml`. On every push to `main`/`master` it:

1. Deploys the SAM backend (Lambda + API Gateway + DynamoDB)
2. Seeds DynamoDB with products and bundles
3. Builds the frontend against the live API URL
4. Uploads the frontend to S3
5. Invalidates the CloudFront cache

Add these secrets/variables in **Settings → Secrets and variables → Actions**:

| Type | Name | Value |
|------|------|-------|
| Secret | `AWS_ACCESS_KEY_ID` | Your AWS access key |
| Secret | `AWS_SECRET_ACCESS_KEY` | Your AWS secret key |
| Secret | `GROQ_API_KEY` | Groq API key (optional, enables LLM fallback) |
| Variable | `AWS_REGION` | e.g. `us-east-1` |
| Variable | `STACK_NAME` | e.g. `flash-mode-backend` |
| Variable | `S3_BUCKET_NAME` | Frontend hosting bucket |
| Variable | `CLOUDFRONT_DISTRIBUTION_ID` | (Optional) CloudFront distribution ID |

### Option 2: Docker-based deployment (no local install)

Requires only Docker Desktop. Set AWS credentials and run:

```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_REGION=us-east-1
export GROQ_API_KEY=...  # optional

# 1. Deploy backend (prints API URL)
./infra/deploy-with-docker.sh flash-mode-backend prod

# 2. Deploy frontend infrastructure (S3 + CloudFront)
./infra/deploy-frontend-infra-with-docker.sh your-unique-bucket-name flash-mode-frontend

# 3. Deploy frontend code
./infra/deploy-frontend-with-docker.sh your-unique-bucket-name E1234567890ABCD "https://your-api-url/"
```

### Option 3: Local tooling

Requires AWS CLI, SAM CLI, Node.js, and Python.

```bash
# Backend (auto-seeds DynamoDB)
GROQ_API_KEY=... ./infra/deploy.sh flash-mode-backend prod

# Frontend infrastructure
./infra/deploy-frontend-infra.sh your-unique-bucket-name flash-mode-frontend

# Frontend code
./infra/deploy_frontend.sh your-unique-bucket-name E1234567890ABCD "https://your-api-url/"
```

For detailed deployment instructions, see [`infra/README.md`](infra/README.md).

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

## 💰 Estimated AWS Cost (Free Tier eligible)

For a demo / low-traffic MVP:

| Service | Free Tier | Typical Monthly Cost |
|---------|-----------|----------------------|
| AWS Lambda | 1M requests + 400K GB-sec free | ~$0 |
| API Gateway | 1M HTTP API calls free | ~$0 |
| DynamoDB | 25 GB + 25 WCU/RCU free | ~$0 |
| S3 | 5 GB free | ~$0.10 |
| CloudFront | 1 TB data transfer free (first year) | ~$0 |
| CloudWatch Logs | 5 GB logs free | ~$0 |

**Total first-year demo cost: typically under $1/month** if you stay within free tier limits.

---

## 📊 Success Metrics

- Bundle generated in under **3 seconds**
- Purchase flow completed in under **5 seconds**
- **Zero** manual product search
- Increased basket size through bundles
