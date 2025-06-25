# AWS Deployment Project Collections

A comprehensive collection of AWS serverless applications and deployment examples, showcasing various AWS services, architectures, and deployment patterns.

## 🎯 Overview

This repository contains multiple AWS-based projects demonstrating different serverless architectures, services, and deployment strategies. Each project is designed to showcase specific AWS capabilities and can serve as learning examples or starter templates for your own AWS deployments.

## 📂 Projects

### 00 - Async User Register API

**Technology Stack**: TypeScript, Serverless Framework, AWS Lambda, DynamoDB, SNS, SQS, WebSocket  
**Architecture**: Event-driven serverless application with asynchronous processing

A sophisticated serverless API demonstrating asynchronous user registration and real-time messaging capabilities.

**Key Features**:

- Asynchronous user registration with SNS
- Real-time message boards with WebSocket support
- Event-driven architecture using SQS and SNS
- DynamoDB for data persistence
- RESTful API with proper HTTP status codes

**AWS Services Used**:

- AWS Lambda (Compute)
- Amazon DynamoDB (Database)
- Amazon SNS (Simple Notification Service)
- Amazon SQS (Simple Queue Service)
- API Gateway (HTTP API & WebSocket)

[📖 View Project Details](./00%20-%20AsyncUserRegisterApi/README.md)

---

### 01 - Social Post App Sample Structure - S3Lambda

**Technology Stack**: Node.js, Express.js, MongoDB, Serverless Framework  
**Architecture**: Traditional web application with serverless deployment capabilities

A full-featured social media application built with modern web technologies and prepared for serverless deployment.

**Key Features**:

- User authentication with JWT
- Complete CRUD operations for posts
- Security middleware (Helmet, CORS, Rate Limiting)
- Comprehensive logging and monitoring
- Input validation and error handling
- Test suite with Jest

**AWS Services Used**:

- AWS Lambda (Compute)
- Amazon S3 (Storage)
- API Gateway (HTTP API)

[📖 View Project Details](./01%20-%20SocialPostAppSampleStructure%20-%20S3Lambda/README.md)

---

## 🚀 Getting Started

Each project contains its own detailed README with specific setup instructions. Generally, you'll need:

### Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Node.js (version specified in each project)
- Serverless Framework (`npm install -g serverless`)

### General Setup Steps

1. Navigate to the desired project directory
2. Install dependencies: `npm install`
3. Configure AWS credentials: `aws configure`
4. Deploy: `npm run deploy` or `serverless deploy`

## 🛠️ AWS Services Covered

This collection demonstrates the following AWS services:

| Service | Purpose | Projects |
|---------|---------|----------|
| AWS Lambda | Serverless compute | All projects |
| Amazon DynamoDB | NoSQL database | 00 - Async User Register API |
| Amazon SNS | Pub/Sub messaging | 00 - Async User Register API |
| Amazon SQS | Message queuing | 00 - Async User Register API |
| API Gateway | HTTP/WebSocket APIs | All projects |
| Amazon S3 | Object storage | 01 - Social Post App |

## 🎓 Learning Outcomes

By exploring these projects, you'll learn about:

- **Serverless Architecture Patterns**: Event-driven design, microservices
- **AWS Service Integration**: How different AWS services work together
- **Deployment Automation**: Using Serverless Framework for infrastructure as code
- **API Design**: RESTful APIs and WebSocket implementations
- **Security Best Practices**: Authentication, validation, and security headers
- **Monitoring & Logging**: CloudWatch integration and application logging
- **Testing Strategies**: Unit and integration testing for serverless applications

## 📈 Future Projects

This collection will continue to grow with additional AWS deployment examples, including:

- Container-based deployments (ECS, Fargate)
- Machine Learning applications (SageMaker)
- Data processing pipelines (Kinesis, EMR)
- CDN and static hosting (CloudFront, S3)
- Advanced security implementations (Cognito, IAM)
- Multi-region deployments
- CI/CD pipelines (CodePipeline, CodeBuild)

## 🤝 Contributing

Feel free to contribute additional AWS deployment examples or improvements to existing projects. Each project should include:

- Clear documentation
- Deployment instructions
- Test examples
- Cost estimation
- Security considerations

## 📄 License

This project collection is provided for educational and demonstration purposes.

---

**Note**: Remember to clean up AWS resources after testing to avoid unnecessary charges. Each project includes cleanup instructions in its respective README.