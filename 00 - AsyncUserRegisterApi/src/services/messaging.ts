import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const snsClient = new SNSClient({ region: process.env.AWS_REGION || 'us-east-1' });
const sqsClient = new SQSClient({ region: process.env.AWS_REGION || 'us-east-1' });

export class MessagingService {
  private readonly userRegistrationTopicArn: string;
  private readonly messagePostingTopicArn: string;
  private readonly boardCreationQueueUrl: string;

  constructor() {
    // These will be set by the serverless framework
    this.userRegistrationTopicArn = `arn:aws:sns:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:${process.env.USER_REGISTRATION_TOPIC}`;
    this.messagePostingTopicArn = `arn:aws:sns:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:${process.env.MESSAGE_POSTING_TOPIC}`;
    this.boardCreationQueueUrl = `https://sqs.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_ACCOUNT_ID}/${process.env.BOARD_CREATION_QUEUE}`;
  }

  async publishUserRegistration(payload: any): Promise<void> {
    const command = new PublishCommand({
      TopicArn: this.userRegistrationTopicArn,
      Message: JSON.stringify(payload),
      Subject: 'User Registration Request'
    });

    await snsClient.send(command);
  }

  async publishMessagePosting(payload: any): Promise<void> {
    const command = new PublishCommand({
      TopicArn: this.messagePostingTopicArn,
      Message: JSON.stringify(payload),
      Subject: 'Message Posting Request'
    });

    await snsClient.send(command);
  }

  async sendBoardCreationRequest(payload: any): Promise<void> {
    const command = new SendMessageCommand({
      QueueUrl: this.boardCreationQueueUrl,
      MessageBody: JSON.stringify(payload)
    });

    await sqsClient.send(command);
  }
}

export const messagingService = new MessagingService();
