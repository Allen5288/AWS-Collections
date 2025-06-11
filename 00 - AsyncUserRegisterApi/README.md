# Simple Async User Register API

A simple serverless API that demonstrates async processing with AWS services.

## 🎯 What This API Does

- **Register users** → Process asynchronously via SNS → Store in DynamoDB  
- **Create message boards** → Process asynchronously via SQS → Store in DynamoDB
- **Post messages** → Process asynchronously via SNS → Store in DynamoDB + WebSocket notifications
- **Real-time messages** → WebSocket subscriptions for live updates

## 🚀 API Endpoints (v1)

All endpoints are prefixed with `/api/v1`

- `POST /api/v1/register` - Register user (returns 202, processes async)
- `GET /api/v1/user/{email}` - Get user details  
- `GET /api/v1/boards` - List all message boards
- `POST /api/v1/boards` - Create board (returns 202, processes async)
- `POST /api/v1/boards/{id}/messages` - Post message (returns 202, processes async)
- `GET /api/v1/boards/{id}/messages` - Get messages from board

## 🛠️ Setup & Deployment

### 1. Prerequisites
- AWS Account
- Node.js 18+
- AWS CLI installed

### 2. AWS Setup
```bash
# Install AWS CLI
# Download from: https://aws.amazon.com/cli/

# Configure AWS credentials
aws configure
# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key  
# - Default region (us-east-1)
# - Output format (json)
```

### 3. Install Dependencies
```bash
npm install
npm install -g serverless
```

### 4. Deploy
```bash
# Deploy to AWS
npm run deploy

# After deployment, update .env file with the API URLs shown in output
```

### 5. Test
```bash
# Run automated tests, all api test already write in test-api.sh
npm test
```

## 📋 Quick Test Example

After deployment, update the API_BASE_URL in test-api.sh with your actual URL, then:

```bash
# 1. Register a user
curl -X POST "YOUR_API_URL/api/v1/register" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'

# 2. Wait 5 seconds, then get user
curl "YOUR_API_URL/api/v1/user/john@example.com"

# 3. Create a board (use userId from step 2)
curl -X POST "YOUR_API_URL/api/v1/boards" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Board", "description": "Testing", "createdBy": "USER_ID"}'

# 4. Wait 5 seconds, then list boards
curl "YOUR_API_URL/api/v1/boards"
```

## ⚡ Key Features

- **Async Processing**: All create operations return immediately (202 status)
- **SNS**: User registration & message posting
- **SQS**: Board creation  
- **DynamoDB**: Data storage with proper indexing
- **WebSocket**: Real-time message notifications
- **TypeScript**: Full type safety

## 🔧 Environment Variables

Create `.env` file with your AWS credentials:
```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=us-east-1
```

## 🧪 WebSocket Testing

1. Open `websocket-test.html` in browser
2. Enter WebSocket URL from deployment output
3. Subscribe to boards for real-time messages

## 🗂️ Architecture

```
API Gateway → Lambda → SNS/SQS → Processing Lambda → DynamoDB
                                                   ↓
WebSocket ← Notification Lambda ←─────────────────┘
```

## 🧹 Cleanup

```bash
npm run remove
```

This removes all AWS resources to avoid charges.

## 📝 Interview Notes

This is a simplified implementation focusing on:
- Async processing patterns (SNS/SQS)
- Serverless architecture
- TypeScript usage
- Real-time features (WebSocket)
- Proper error handling
- Testing capabilities

For production, add authentication, validation, monitoring, Add unit test, integration test, CICD pipielineetc.