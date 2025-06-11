import { SNSHandler, SNSEventRecord } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRegistrationEvent } from '../../types';
import { dynamoDBService } from '../../services/dynamodb';
import { getCurrentTimestamp, parseJsonSafely } from '../../utils/response';

export const handler: SNSHandler = async (event) => {
  console.log('Processing user registration events:', JSON.stringify(event, null, 2));

  try {
    for (const record of event.Records) {
      await processUserRegistrationRecord(record);
    }
  } catch (error) {
    console.error('Error processing user registration events:', error);
    throw error; // This will cause the Lambda to retry
  }
};

async function processUserRegistrationRecord(record: SNSEventRecord): Promise<void> {
  try {
    const message = parseJsonSafely<UserRegistrationEvent>(record.Sns.Message);
    if (!message) {
      console.error('Invalid message format:', record.Sns.Message);
      return;
    }

    console.log('Processing user registration for:', message.email);

    // Check if user already exists (race condition protection)
    const existingUser = await dynamoDBService.getUserByEmail(message.email);
    if (existingUser) {
      console.log('User already exists:', message.email);
      return;
    }

    // Create new user
    const userId = uuidv4();
    const currentTime = getCurrentTimestamp();

    const newUser: User = {
      userId,
      email: message.email,
      name: message.name,
      createdAt: currentTime,
      updatedAt: currentTime
    };

    await dynamoDBService.createUser(newUser);

    console.log('Successfully created user:', {
      userId,
      email: message.email,
      name: message.name
    });

  } catch (error: any) {
    console.error('Error processing user registration record:', error);
    
    // For certain errors, we might want to send the message to a DLQ
    // For now, we'll just log and rethrow to trigger retry
    throw error;
  }
}
