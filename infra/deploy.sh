#!/usr/bin/env bash
set -e

# Deploy backend infrastructure via AWS SAM
# Usage: ./deploy.sh [stack-name] [environment]

STACK_NAME="${1:-flash-mode-backend}"
ENVIRONMENT="${2:-prod}"
REGION="${AWS_DEFAULT_REGION:-us-east-1}"

cd "$(dirname "$0")/.."

echo "🚀 Building SAM application..."
sam build --template-file template.yaml --use-container

echo "🚀 Deploying stack ${STACK_NAME}..."
sam deploy \
  --template-file template.yaml \
  --stack-name "${STACK_NAME}" \
  --parameter-overrides "Environment=${ENVIRONMENT}" \
  --region "${REGION}" \
  --capabilities CAPABILITY_IAM \
  --no-confirm-changeset \
  --no-fail-on-empty-changeset

echo "✅ Backend deployed successfully!"
