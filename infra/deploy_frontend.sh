#!/usr/bin/env bash
set -e

# Deploy frontend to S3 + CloudFront
# Usage: ./deploy_frontend.sh <s3-bucket-name> [cloudfront-distribution-id] [api-base-url]

BUCKET_NAME="${1:?Please provide the S3 bucket name as the first argument}"
DISTRIBUTION_ID="${2:-}"
API_BASE_URL="${3:-}"

cd "$(dirname "$0")/../frontend"

echo "📦 Building frontend..."
if [ -n "${API_BASE_URL}" ]; then
  VITE_API_BASE_URL="${API_BASE_URL}" npm run build
else
  npm run build
fi

echo "☁️  Uploading to S3..."
aws s3 sync dist/ "s3://${BUCKET_NAME}/" --delete

if [ -n "${DISTRIBUTION_ID}" ]; then
  echo "🔄 Invalidating CloudFront distribution..."
  aws cloudfront create-invalidation \
    --distribution-id "${DISTRIBUTION_ID}" \
    --paths "/*"
fi

echo "✅ Frontend deployed successfully!"
