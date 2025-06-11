import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const snsClient = new SNSClient({ region: process.env.AWS_REGION || 'us-east-1' });
const sqsClient = new SQSClient({ region: process.env.AWS_REGION || 'us-east-1' });

export class MessagingService {
  private readonly userRegistrationTopicArn: string;
  private readonly messagePostingTopicArn: string;
  private readonly boardCreationQueueUrl: string;

  constructor() {
    // Use the actual ARNs and URLs provided by serverless framework
    this.userRegistrationTopicArn = process.env.USER_REGISTRATION_TOPIC_ARN!;
    this.messagePostingTopicArn = process.env.MESSAGE_POSTING_TOPIC_ARN!;
    this.boardCreationQueueUrl = process.env.BOARD_CREATION_QUEUE_URL!;
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
