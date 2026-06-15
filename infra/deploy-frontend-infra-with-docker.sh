#!/usr/bin/env bash
set -e

# Deploy frontend infrastructure (S3 + CloudFront) using Docker
# Usage: ./infra/deploy-frontend-infra-with-docker.sh <bucket-name> [stack-name]
# Requires: Docker running, AWS credentials in env vars

BUCKET_NAME="${1:?Please provide a globally unique S3 bucket name as the first argument}"
STACK_NAME="${2:-flash-mode-frontend}"
REGION="${AWS_REGION:-us-east-1}"

if [ -z "${AWS_ACCESS_KEY_ID}" ] || [ -z "${AWS_SECRET_ACCESS_KEY}" ]; then
  echo "❌ AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set"
  exit 1
fi

cd "$(dirname "$0")/.."

IMAGE_NAME="flash-mode-deploy"

if ! docker image inspect "${IMAGE_NAME}" >/dev/null 2>&1; then
  echo "🐳 Building deployment Docker image..."
  docker build -t "${IMAGE_NAME}" -f infra/Dockerfile.deploy infra/
fi

docker run --rm -it \
  -v "$(pwd):/app" \
  -e AWS_ACCESS_KEY_ID \
  -e AWS_SECRET_ACCESS_KEY \
  -e AWS_REGION="${REGION}" \
  -e AWS_DEFAULT_REGION="${REGION}" \
  "${IMAGE_NAME}" \
  -c "./infra/deploy-frontend-infra.sh ${BUCKET_NAME} ${STACK_NAME}"
