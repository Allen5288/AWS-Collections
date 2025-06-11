# Deployment Guide - Async User Register API

## Step-by-Step Deployment Instructions

### 1. Prerequisites Setup

**Install Node.js and npm:**
- Download and install Node.js 18.x or later from [nodejs.org](https://nodejs.org/)
- Verify installation: `node --version` and `npm --version`

**Install AWS CLI:**
- Download from [AWS CLI Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- Configure with your AWS credentials: `aws configure`

**Install Serverless Framework:**
```bash
npm install -g serverless
```

### 2. Project Setup

1. **Navigate to the project directory:**
   ```bash
   cd "i:\00_SoftwareDevopment\AWS-Collections\00 - AsyncUserRegisterApi"
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Verify TypeScript compilation:**
   ```bash
   npm run build
   ```

### 3. AWS Configuration

**Ensure your AWS credentials have the following permissions:**
- CloudFormation full access
- IAM role creation
- Lambda function management
- API Gateway management
- DynamoDB table management
- SNS topic management
- SQS queue management

**Recommended IAM Policy (for development):**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cloudformation:*",
                "lambda:*",
                "apigateway:*",
                "dynamodb:*",
                "sns:*",
                "sqs:*",
                "iam:*",
                "logs:*"
            ],
            "Resource": "*"
        }
    ]
}
```

### 4. Deploy to AWS

**Deploy to development environment:**
```bash
serverless deploy
```

**Deploy to specific stage:**
```bash
serverless deploy --stage prod
```

**Deploy with verbose output:**
```bash
serverless deploy --verbose
```

### 5. Post-Deployment Steps

**1. Get your API URLs:**
After deployment, Serverless will display:
```
endpoints:
  REST API: https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev
  WebSocket: wss://yyyyyyyyyy.execute-api.us-east-1.amazonaws.com/dev
```

**2. Update test files:**
- Update `API_BASE_URL` in `test-api.sh`
- Update WebSocket URL in `websocket-test.html`

**3. Make test script executable:**
```bash
chmod +x test-api.sh
```

### 6. Testing the Deployment

**Run automated tests:**
```bash
./test-api.sh
```

**Test WebSocket:**
1. Open `websocket-test.html` in your browser
2. Enter the WebSocket URL from deployment output
3. Follow the testing instructions in the HTML file

### 7. Common Deployment Issues

**Issue: Permission Denied**
```
Error: The role defined for the function cannot be assumed by Lambda.
```
**Solution:** Ensure your AWS credentials have IAM permissions to create roles.

**Issue: Stack Already Exists**
```
Error: Stack with id async-user-register-api-dev already exists
```
**Solution:** Use `serverless remove` first, then redeploy.

**Issue: Timeout During Deployment**
```
Error: Stack deployment timed out
```
**Solution:** Increase timeout or check AWS CloudFormation console for specific errors.

### 8. Monitoring and Debugging

**View Lambda logs:**
```bash
serverless logs -f registerUser -t
```

**View specific function logs:**
```bash
serverless logs -f processUserRegistration --startTime 1h
```

**Check CloudFormation stack:**
- Go to AWS Console → CloudFormation
- Find stack: `async-user-register-api-dev`
- Check Events tab for any errors

**Check DynamoDB tables:**
- Go to AWS Console → DynamoDB
- Verify tables were created:
  - `async-user-register-api-users-dev`
  - `async-user-register-api-boards-dev`
  - `async-user-register-api-messages-dev`
  - `async-user-register-api-connections-dev`

### 9. Environment-Specific Configuration

**Development Environment:**
```bash
serverless deploy --stage dev
```

**Production Environment:**
```bash
serverless deploy --stage prod
```

**Custom Region:**
```bash
serverless deploy --region eu-west-1
```

### 10. Cleanup

**Remove all AWS resources:**
```bash
serverless remove
```

**Remove specific stage:**
```bash
serverless remove --stage prod
```

## Troubleshooting

### Common AWS Issues

1. **Region Mismatch:**
   - Ensure AWS CLI region matches serverless.yml region
   - Check `aws configure get region`

2. **Insufficient Permissions:**
   - Verify IAM user has required permissions
   - Check CloudTrail for denied API calls

3. **Resource Limits:**
   - Check AWS service limits in your region
   - Verify you haven't exceeded Lambda function limits

### Testing Issues

1. **API Not Responding:**
   - Check Lambda function logs
   - Verify API Gateway configuration
   - Test individual Lambda functions

2. **WebSocket Connection Failed:**
   - Verify WebSocket API URL
   - Check browser console for errors
   - Ensure proper CORS configuration

3. **Async Processing Not Working:**
   - Check SNS topic configuration
   - Verify SQS queue permissions
   - Check processor Lambda function logs

## Next Steps

After successful deployment:

1. **Set up monitoring:** Configure CloudWatch alarms
2. **Add authentication:** Implement API Gateway authorizers
3. **Scale testing:** Use tools like Artillery or JMeter
4. **CI/CD:** Set up automated deployment pipeline
5. **Documentation:** Create API documentation with tools like Swagger

## Support

If you encounter issues:
1. Check the serverless framework documentation
2. Review AWS service documentation
3. Check GitHub issues for the serverless framework
4. Use AWS support forums
