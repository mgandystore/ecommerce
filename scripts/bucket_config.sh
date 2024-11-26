#!/bin/bash

# Configuration variables
export BUCKET_NAME="hassmacdev"
export AWS_REGION="fr-par"
export ENDPOINT_URL="https://s3.fr-par.scw.cloud"
export ALLOWED_ORIGIN="http://localhost:3000"

# Check if credentials are set
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "Error: AWS credentials are not set"
    echo "Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables"
    exit 1
fi

# Create CORS configuration file
cat > cors.json << EOF
{
    "CORSRules": [
        {
            "AllowedOrigins": ["*"],
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
            "ExposeHeaders": ["ETag", "Content-Length", "Content-Type", "Content-MD5"],
            "MaxAgeSeconds": 3000
        }
    ]
}
EOF

# Configure AWS CLI
aws configure set region ${AWS_REGION}

# Apply CORS configuration
echo "Applying CORS configuration to bucket: ${BUCKET_NAME}"
aws s3api put-bucket-cors \
    --bucket ${BUCKET_NAME} \
    --cors-configuration file://cors.json \
    --endpoint-url ${ENDPOINT_URL}

# Clean up
rm cors.json

echo "CORS configuration complete!"