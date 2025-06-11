#!/bin/bash

echo "🚀 Deploying Async User Register API..."
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    echo "See AWS-SETUP.md for instructions."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install serverless globally if not already installed
if ! command -v serverless &> /dev/null; then
    echo "🔧 Installing Serverless Framework..."
    npm install -g serverless
fi

# Deploy to AWS
echo "☁️ Deploying to AWS..."
npm run deploy

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Copy the API Gateway URL from the output above"
echo "2. Update the API_BASE_URL in test-api.sh"
echo "3. Run: npm test"
echo ""
echo "💡 For WebSocket testing, open websocket-test.html in your browser"
