#!/usr/bin/env bash
# Deploy NeuroNode backend as two Lambda functions + API Gateway.
# Prerequisite: backend/.env must exist with DATABASE_URL etc.
# Usage: bash deploy.sh
set -euo pipefail

REGION="us-east-2"
ACCOUNT_ID="711962920328"
VPC_ID="vpc-087bd1cad2a81286b"
SUBNETS="subnet-028dff71cdc24e86b,subnet-0b60d8f24756b5ad8,subnet-0d9fb68bea538a19d"
OS_SG="sg-09d25314f0e574132"

source "$(dirname "$0")/.env"

echo "=== Build Lambda package ==="
cd "$(dirname "$0")"
rm -rf .build && mkdir .build
uv pip install --target .build --no-install-project . --quiet
cp api.py pipeline.py ingest_batch.py .build/
cd .build && zip -r ../lambda.zip . --quiet
cd ..
echo "  lambda.zip ready ($(du -sh lambda.zip | cut -f1))"

echo "=== IAM role for Lambda ==="
ROLE_ARN=$(AWS_PROFILE=tectoniq-readonly aws iam get-role \
  --role-name "neuronode-lambda-role" \
  --query "Role.Arn" --output text 2>/dev/null || echo "")

if [ -z "$ROLE_ARN" ]; then
  cat > /tmp/lambda-trust.json <<'TRUST'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "lambda.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
TRUST
  ROLE_ARN=$(AWS_PROFILE=tectoniq aws iam create-role \
    --role-name "neuronode-lambda-role" \
    --assume-role-policy-document file:///tmp/lambda-trust.json \
    --query "Role.Arn" --output text)
  AWS_PROFILE=tectoniq aws iam attach-role-policy \
    --role-name "neuronode-lambda-role" \
    --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
  AWS_PROFILE=tectoniq aws iam attach-role-policy \
    --role-name "neuronode-lambda-role" \
    --policy-arn "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
  AWS_PROFILE=tectoniq aws iam attach-role-policy \
    --role-name "neuronode-lambda-role" \
    --policy-arn "arn:aws:iam::aws:policy/AmazonBedrockFullAccess"
  AWS_PROFILE=tectoniq aws iam attach-role-policy \
    --role-name "neuronode-lambda-role" \
    --policy-arn "arn:aws:iam::aws:policy/AmazonS3FullAccess"
  AWS_PROFILE=tectoniq aws iam attach-role-policy \
    --role-name "neuronode-lambda-role" \
    --policy-arn "arn:aws:iam::aws:policy/AmazonTextractFullAccess"
  sleep 10  # wait for IAM propagation
  echo "  created IAM role $ROLE_ARN"
else
  echo "  IAM role exists: $ROLE_ARN"
fi

ENV_VARS="Variables={DATABASE_URL=${DATABASE_URL},S3_BUCKET=${S3_BUCKET},DYNAMODB_TABLE=${DYNAMODB_TABLE},AWS_DEFAULT_REGION=${REGION},OPENSEARCH_HOST=${OPENSEARCH_HOST},OPENSEARCH_USER=${OPENSEARCH_USER},OPENSEARCH_PASS=${OPENSEARCH_PASS}}"

echo "=== Deploy API Lambda ==="
API_ARN=$(AWS_PROFILE=tectoniq-readonly aws lambda get-function \
  --function-name "neuronode-api" --region "$REGION" \
  --query "Configuration.FunctionArn" --output text 2>/dev/null || echo "")

if [ -z "$API_ARN" ]; then
  API_ARN=$(AWS_PROFILE=tectoniq aws lambda create-function \
    --function-name "neuronode-api" \
    --runtime python3.12 \
    --role "$ROLE_ARN" \
    --handler api.handler \
    --zip-file fileb://lambda.zip \
    --timeout 30 \
    --memory-size 512 \
    --environment "$ENV_VARS" \
    --vpc-config "SubnetIds=${SUBNETS},SecurityGroupIds=${OS_SG}" \
    --region "$REGION" \
    --query "FunctionArn" --output text)
  echo "  created neuronode-api: $API_ARN"
else
  AWS_PROFILE=tectoniq aws lambda update-function-code \
    --function-name "neuronode-api" \
    --zip-file fileb://lambda.zip \
    --region "$REGION" > /dev/null
  AWS_PROFILE=tectoniq aws lambda update-function-configuration \
    --function-name "neuronode-api" \
    --environment "$ENV_VARS" \
    --region "$REGION" > /dev/null
  echo "  updated neuronode-api"
fi

echo "=== Deploy Pipeline Lambda ==="
PIPE_ARN=$(AWS_PROFILE=tectoniq-readonly aws lambda get-function \
  --function-name "neuronode-pipeline" --region "$REGION" \
  --query "Configuration.FunctionArn" --output text 2>/dev/null || echo "")

if [ -z "$PIPE_ARN" ]; then
  PIPE_ARN=$(AWS_PROFILE=tectoniq aws lambda create-function \
    --function-name "neuronode-pipeline" \
    --runtime python3.12 \
    --role "$ROLE_ARN" \
    --handler pipeline.lambda_handler \
    --zip-file fileb://lambda.zip \
    --timeout 900 \
    --memory-size 1024 \
    --environment "$ENV_VARS" \
    --vpc-config "SubnetIds=${SUBNETS},SecurityGroupIds=${OS_SG}" \
    --region "$REGION" \
    --query "FunctionArn" --output text)
  echo "  created neuronode-pipeline: $PIPE_ARN"
else
  AWS_PROFILE=tectoniq aws lambda update-function-code \
    --function-name "neuronode-pipeline" \
    --zip-file fileb://lambda.zip \
    --region "$REGION" > /dev/null
  echo "  updated neuronode-pipeline"
fi

echo "=== API Gateway (HTTP API) ==="
API_ID=$(AWS_PROFILE=tectoniq-readonly aws apigatewayv2 get-apis \
  --region "$REGION" \
  --query "Items[?Name=='neuronode-api-gw'].ApiId | [0]" --output text 2>/dev/null || echo "")

if [ -z "$API_ID" ] || [ "$API_ID" = "None" ]; then
  API_ID=$(AWS_PROFILE=tectoniq aws apigatewayv2 create-api \
    --name "neuronode-api-gw" \
    --protocol-type HTTP \
    --region "$REGION" \
    --query "ApiId" --output text)
  echo "  created API Gateway $API_ID"

  INTEGRATION_ID=$(AWS_PROFILE=tectoniq aws apigatewayv2 create-integration \
    --api-id "$API_ID" \
    --integration-type AWS_PROXY \
    --integration-uri "arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:neuronode-api" \
    --payload-format-version "2.0" \
    --region "$REGION" \
    --query "IntegrationId" --output text)

  AWS_PROFILE=tectoniq aws apigatewayv2 create-route \
    --api-id "$API_ID" \
    --route-key "ANY /{proxy+}" \
    --target "integrations/$INTEGRATION_ID" \
    --region "$REGION" > /dev/null

  AWS_PROFILE=tectoniq aws apigatewayv2 create-stage \
    --api-id "$API_ID" \
    --stage-name '$default' \
    --auto-deploy \
    --region "$REGION" > /dev/null

  AWS_PROFILE=tectoniq aws lambda add-permission \
    --function-name "neuronode-api" \
    --statement-id "apigw-invoke" \
    --action "lambda:InvokeFunction" \
    --principal "apigateway.amazonaws.com" \
    --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/*/{proxy+}" \
    --region "$REGION" > /dev/null

  echo "  routes configured"
else
  echo "  API Gateway $API_ID already exists"
fi

API_URL="https://${API_ID}.execute-api.${REGION}.amazonaws.com"
echo ""
echo "=== Done ==="
echo "API URL: $API_URL"
echo ""
echo "Test: curl ${API_URL}/api/patients/demo/keyword-graph"
echo ""
echo "Add to msk1/.env.local:"
echo "  VITE_API_BASE=${API_URL}"
