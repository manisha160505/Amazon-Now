#!/usr/bin/env bash
set -e

# Deploy frontend using Docker (no local AWS CLI install needed)
# Usage: ./infra/deploy-frontend-with-docker.sh <s3-bucket-name> [cloudfront-distribution-id] [api-base-url]
# Requires: Docker running, AWS credentials in env vars

BUCKET_NAME="${1:?Please provide the S3 bucket name as the first argument}"
DISTRIBUTION_ID="${2:-}"
API_BASE_URL="${3:-}"
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

echo "🚀 Deploying frontend via Docker..."
docker run --rm -it \
  -v "$(pwd):/app" \
  -e AWS_ACCESS_KEY_ID \
  -e AWS_SECRET_ACCESS_KEY \
  -e AWS_REGION="${REGION}" \
  -e AWS_DEFAULT_REGION="${REGION}" \
  "${IMAGE_NAME}" \
  -c "./infra/deploy_frontend.sh ${BUCKET_NAME} ${DISTRIBUTION_ID} ${API_BASE_URL}"
