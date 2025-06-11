# AWS Setup Guide for Interview Assessment

## Quick Setup

### 1. Get AWS Account
- Sign up at https://aws.amazon.com/

### 2. Create Access Keys
1. Go to AWS Console → IAM → Users → Create User
2. User name: `serverless-demo` 
3. Attach policies: `AdministratorAccess` (for demo only)
4. Create user → Security credentials → Create access key
5. Choose "Command Line Interface (CLI)"
6. Save the Access Key ID and Secret Access Key

### 3. Install AWS CLI
**Windows:**
- Download installer from: https://aws.amazon.com/cli/
- Run installer and follow prompts

**Mac/Linux:**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### 4. Configure AWS CLI
```bash
aws configure
```
Enter when prompted:
- AWS Access Key ID: (from step 2)
- AWS Secret Access Key: (from step 2)  
- Default region: `us-east-1`
- Default output format: `json`

### 5. Verify Setup
```bash
aws sts get-caller-identity
```
Should show your account info.

## Deploy the API

```bash
# Install dependencies
npm install
npm install -g serverless

# Deploy to AWS
npm run deploy
```

After deployment, you'll see output like:
```
endpoints:
  POST - https://abc123.execute-api.us-east-1.amazonaws.com/dev/api/v1/register
  GET - https://abc123.execute-api.us-east-1.amazonaws.com/dev/api/v1/user/{email}
  ...
```

Update your `.env` file with these URLs and run tests:
```bash
npm test
```

## Cleanup
```bash
npm run remove
```

## Troubleshooting

**Permission errors?**
- Make sure your IAM user has `AdministratorAccess` policy
- Check AWS CLI configuration: `aws configure list`

**Region issues?**
- Stick with `us-east-1` for this demo
- Make sure serverless.yml and AWS CLI use same region

**Still having issues?**
- Check AWS CloudFormation console for error details
- Look at Lambda function logs in CloudWatch
