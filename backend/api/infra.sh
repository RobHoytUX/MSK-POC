#!/usr/bin/env bash
# NeuroNode infrastructure provisioning script.
# Run once to create all AWS resources needed before the pipeline.
# Usage: bash infra.sh
set -euo pipefail

REGION="us-east-2"
ACCOUNT_ID="711962920328"
VPC_ID="vpc-087bd1cad2a81286b"
SUBNETS="subnet-028dff71cdc24e86b subnet-0b60d8f24756b5ad8 subnet-0d9fb68bea538a19d"
OS_SG="sg-09d25314f0e574132"
S3_BUCKET="neuronode-ehr-${ACCOUNT_ID}"
DYNAMO_TABLE="neuronode_pubmed_cache"
RDS_IDENTIFIER="neuronode-rds"
RDS_DB="neuronode"
RDS_USER="neuronode"
RDS_PASS="NeuroNode$(openssl rand -hex 8)"

echo "=== Phase 1: S3 bucket ==="
if AWS_PROFILE=tectoniq aws s3api head-bucket --bucket "$S3_BUCKET" --region "$REGION" 2>/dev/null; then
  echo "  $S3_BUCKET already exists"
else
  AWS_PROFILE=tectoniq aws s3api create-bucket \
    --bucket "$S3_BUCKET" \
    --region "$REGION" \
    --create-bucket-configuration LocationConstraint="$REGION"
  echo "  created s3://$S3_BUCKET"
fi

echo "=== Phase 1: DynamoDB table ==="
if AWS_PROFILE=tectoniq aws dynamodb describe-table --table-name "$DYNAMO_TABLE" --region "$REGION" 2>/dev/null | grep -q TableName; then
  echo "  $DYNAMO_TABLE already exists"
else
  AWS_PROFILE=tectoniq aws dynamodb create-table \
    --table-name "$DYNAMO_TABLE" \
    --attribute-definitions AttributeName=node_id,AttributeType=S \
    --key-schema AttributeName=node_id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region "$REGION"
  echo "  created $DYNAMO_TABLE"
fi

echo "=== Phase 1: RDS security group ==="
RDS_SG_ID=$(AWS_PROFILE=tectoniq-readonly aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=neuronode-rds-sg" "Name=vpc-id,Values=$VPC_ID" \
  --region "$REGION" \
  --query "SecurityGroups[0].GroupId" --output text 2>/dev/null || echo "None")

if [ "$RDS_SG_ID" = "None" ] || [ -z "$RDS_SG_ID" ]; then
  RDS_SG_ID=$(AWS_PROFILE=tectoniq aws ec2 create-security-group \
    --group-name "neuronode-rds-sg" \
    --description "NeuroNode RDS PostgreSQL" \
    --vpc-id "$VPC_ID" \
    --region "$REGION" \
    --query "GroupId" --output text)
  AWS_PROFILE=tectoniq aws ec2 authorize-security-group-ingress \
    --group-id "$RDS_SG_ID" \
    --protocol tcp \
    --port 5432 \
    --cidr "0.0.0.0/0" \
    --region "$REGION"
  echo "  created security group $RDS_SG_ID"
else
  echo "  security group $RDS_SG_ID already exists"
fi

echo "=== Phase 1: RDS subnet group ==="
if AWS_PROFILE=tectoniq-readonly aws rds describe-db-subnet-groups \
  --db-subnet-group-name "neuronode-subnet-group" --region "$REGION" 2>/dev/null | grep -q SubnetGroupName; then
  echo "  subnet group already exists"
else
  AWS_PROFILE=tectoniq aws rds create-db-subnet-group \
    --db-subnet-group-name "neuronode-subnet-group" \
    --db-subnet-group-description "NeuroNode subnets" \
    --subnet-ids $SUBNETS \
    --region "$REGION"
  echo "  created subnet group"
fi

echo "=== Phase 1: RDS PostgreSQL instance ==="
if AWS_PROFILE=tectoniq-readonly aws rds describe-db-instances \
  --db-instance-identifier "$RDS_IDENTIFIER" --region "$REGION" 2>/dev/null | grep -q DBInstanceIdentifier; then
  echo "  RDS instance already exists"
  RDS_ENDPOINT=$(AWS_PROFILE=tectoniq-readonly aws rds describe-db-instances \
    --db-instance-identifier "$RDS_IDENTIFIER" --region "$REGION" \
    --query "DBInstances[0].Endpoint.Address" --output text)
else
  AWS_PROFILE=tectoniq aws rds create-db-instance \
    --db-instance-identifier "$RDS_IDENTIFIER" \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --engine-version "15.4" \
    --master-username "$RDS_USER" \
    --master-user-password "$RDS_PASS" \
    --db-name "$RDS_DB" \
    --allocated-storage 20 \
    --storage-type gp2 \
    --no-multi-az \
    --publicly-accessible \
    --vpc-security-group-ids "$RDS_SG_ID" \
    --db-subnet-group-name "neuronode-subnet-group" \
    --region "$REGION" \
    --backup-retention-period 0

  echo "  RDS instance creating — waiting for 'available' (takes ~5 min)…"
  AWS_PROFILE=tectoniq-readonly aws rds wait db-instance-available \
    --db-instance-identifier "$RDS_IDENTIFIER" \
    --region "$REGION"

  RDS_ENDPOINT=$(AWS_PROFILE=tectoniq-readonly aws rds describe-db-instances \
    --db-instance-identifier "$RDS_IDENTIFIER" --region "$REGION" \
    --query "DBInstances[0].Endpoint.Address" --output text)

  echo "  RDS endpoint: $RDS_ENDPOINT"
  echo "  RDS password: $RDS_PASS"
fi

echo ""
echo "=== Write these to backend/.env ==="
cat <<EOF
DATABASE_URL=postgresql://${RDS_USER}:${RDS_PASS}@${RDS_ENDPOINT:-<endpoint>}:5432/${RDS_DB}
S3_BUCKET=${S3_BUCKET}
DYNAMODB_TABLE=${DYNAMO_TABLE}
AWS_DEFAULT_REGION=${REGION}
OPENSEARCH_HOST=<opensearch-vpc-endpoint>
OPENSEARCH_USER=<opensearch-username>
OPENSEARCH_PASS=<opensearch-password>
EOF

echo ""
echo "=== Apply DDL ==="
echo "Run this once RDS is available:"
echo "  psql \$DATABASE_URL < backend/schema.sql"
