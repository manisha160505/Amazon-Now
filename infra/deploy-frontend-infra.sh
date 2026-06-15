#!/usr/bin/env bash
set -e

# Deploy frontend infrastructure (S3 + CloudFront) via AWS CloudFormation
# Usage: ./infra/deploy-frontend-infra.sh <bucket-name> [stack-name]

BUCKET_NAME="${1:?Please provide a globally unique S3 bucket name as the first argument}"
STACK_NAME="${2:-flash-mode-frontend}"
REGION="${AWS_REGION:-us-east-1}"

cd "$(dirname "$0")/.."

echo "🚀 Deploying frontend infrastructure..."
aws cloudformation deploy \
  --template-file infra/frontend-template.yaml \
  --stack-name "${STACK_NAME}" \
  --parameter-overrides "BucketName=${BUCKET_NAME}" \
  --region "${REGION}" \
  --capabilities CAPABILITY_IAM \
  --no-fail-on-empty-changeset

echo ""
echo "✅ Frontend infrastructure deployed!"
aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --query 'Stacks[0].Outputs' \
  --output table \
  --region "${REGION}"
