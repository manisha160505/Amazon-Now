#!/usr/bin/env bash
set -e

# Deploy backend infrastructure via AWS SAM
# Usage: ./deploy.sh [stack-name] [environment]

STACK_NAME="${1:-flash-mode-backend}"
ENVIRONMENT="${2:-prod}"
GROQ_API_KEY="${GROQ_API_KEY:-}"
REGION="${AWS_DEFAULT_REGION:-us-east-1}"

cd "$(dirname "$0")/.."

echo "🚀 Building SAM application..."
sam build --template-file template.yaml

echo "🚀 Deploying stack ${STACK_NAME}..."
sam deploy \
  --template-file template.yaml \
  --stack-name "${STACK_NAME}" \
  --parameter-overrides "Environment=${ENVIRONMENT}" "GroqApiKey=${GROQ_API_KEY}" \
  --region "${REGION}" \
  --capabilities CAPABILITY_IAM \
  --no-confirm-changeset \
  --no-fail-on-empty-changeset

echo "🌱 Seeding DynamoDB tables..."
(
  cd backend
  ENV="${ENVIRONMENT}" PRODUCTS_TABLE="Products-${ENVIRONMENT}" BUNDLES_TABLE="Bundles-${ENVIRONMENT}" SESSIONS_TABLE="Sessions-${ENVIRONMENT}" \
    python scripts/seed_dynamodb.py
)

API_URL=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text \
  --region "${REGION}")

echo ""
echo "✅ Backend deployed successfully!"
echo "🌐 API URL: ${API_URL}"
echo ""
echo "To deploy the frontend, run:"
echo "  ./infra/deploy_frontend.sh <s3-bucket-name> [cloudfront-distribution-id] \"${API_URL}\""
