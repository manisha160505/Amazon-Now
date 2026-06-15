# AWS Deployment Guide

This project uses **AWS SAM** for the serverless backend and **S3 + CloudFront** for the static frontend.

## Architecture

- **Backend**: FastAPI app running on AWS Lambda behind API Gateway (HTTP API)
- **Database**: DynamoDB tables for Products, Bundles, and Sessions
- **Frontend**: React + Vite static site hosted on S3, served via CloudFront

## Prerequisites

Choose one of these options:

### Option A: Local tools
- AWS CLI installed and configured
- AWS SAM CLI installed
- Node.js 20+ and npm
- Python 3.12+

### Option B: Docker (recommended)
- Docker Desktop running
- No need to install AWS CLI, SAM CLI, or Node.js locally

You will also need:
- AWS account with appropriate permissions
- (Optional) A Groq API key for LLM intent fallback

## Required AWS Permissions

Your AWS user/role needs permissions for:

- CloudFormation
- Lambda
- API Gateway
- DynamoDB
- IAM (to create roles)
- S3
- CloudFront

## Deployment Options

### 1. Fully automated (GitHub Actions)

See `.github/workflows/deploy.yml`.

#### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |
| `GROQ_API_KEY` | Groq API key for LLM intent fallback (optional but recommended) |

#### Required GitHub Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `AWS_REGION` | AWS region | `us-east-1` |
| `STACK_NAME` | CloudFormation stack name | `flash-mode-backend` |
| `S3_BUCKET_NAME` | S3 bucket for frontend hosting | `flash-mode-frontend` |
| `CLOUDFRONT_DISTRIBUTION_ID` | (Optional) CloudFront distribution ID | `E1234567890ABCD` |

The workflow runs on every push to `main`/`master` or manually. It deploys the backend, seeds DynamoDB, builds the frontend against the live API, uploads to S3, and invalidates CloudFront.

---

### 2. Docker-based deployment (no local install needed)

Set your AWS credentials:

```bash
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_REGION=us-east-1
export GROQ_API_KEY=your_groq_key  # optional
```

#### Step 1: Deploy backend

```bash
./infra/deploy-with-docker.sh flash-mode-backend prod
```

This prints the API Gateway URL at the end.

#### Step 2: Deploy frontend infrastructure

```bash
# Replace with a globally unique bucket name
./infra/deploy-frontend-infra-with-docker.sh flash-mode-frontend-bucket flash-mode-frontend
```

#### Step 3: Deploy frontend code

```bash
# Use the DistributionId and API URL from the previous steps
./infra/deploy-frontend-with-docker.sh flash-mode-frontend-bucket E1234567890ABCD "https://your-api-url.execute-api.us-east-1.amazonaws.com/"
```

---

### 3. Manual deployment with local tools

#### Deploy backend

```bash
GROQ_API_KEY=your_key ./infra/deploy.sh flash-mode-backend prod
```

#### Deploy frontend infrastructure

```bash
./infra/deploy-frontend-infra.sh flash-mode-frontend-bucket flash-mode-frontend
```

#### Deploy frontend code

```bash
./infra/deploy_frontend.sh flash-mode-frontend-bucket E1234567890ABCD "https://your-api-url/"
```

---

## Notes

- The Lambda function uses `python3.12` and an `x86_64` architecture.
- DynamoDB tables use on-demand billing (`PAY_PER_REQUEST`).
- The frontend build expects `VITE_API_BASE_URL` to point to the deployed API Gateway URL.
- The CloudFront distribution is configured to serve `index.html` for 403/404 errors so React Router works.
