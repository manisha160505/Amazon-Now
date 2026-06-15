#!/usr/bin/env bash
set -e

# Deploy backend using Docker (no local AWS CLI/SAM install needed)
# Usage: ./infra/deploy-with-docker.sh [stack-name] [environment]
# Requires: Docker running, AWS credentials in env vars

STACK_NAME="${1:-flash-mode-backend}"
ENVIRONMENT="${2:-prod}"
GROQ_API_KEY="${GROQ_API_KEY:-}"
REGION="${AWS_REGION:-us-east-1}"

if [ -z "${AWS_ACCESS_KEY_ID}" ] || [ -z "${AWS_SECRET_ACCESS_KEY}" ]; then
  echo "❌ AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set"
  exit 1
fi

cd "$(dirname "$0")/.."

IMAGE_NAME="flash-mode-deploy"

# Build deploy image if needed
if ! docker image inspect "${IMAGE_NAME}" >/dev/null 2>&1; then
  echo "🐳 Building deployment Docker image..."
  docker build -t "${IMAGE_NAME}" -f infra/Dockerfile.deploy infra/
fi

echo "🚀 Deploying backend via Docker..."
docker run --rm -it \
  -v "$(pwd):/app" \
  -e AWS_ACCESS_KEY_ID \
  -e AWS_SECRET_ACCESS_KEY \
  -e AWS_REGION="${REGION}" \
  -e AWS_DEFAULT_REGION="${REGION}" \
  -e GROQ_API_KEY="${GROQ_API_KEY}" \
  "${IMAGE_NAME}" \
  -c "./infra/deploy.sh ${STACK_NAME} ${ENVIRONMENT}"
