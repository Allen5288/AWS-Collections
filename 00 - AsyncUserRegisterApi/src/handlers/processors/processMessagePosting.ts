import { SNSHandler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { Message, MessagePostEvent, SNSEventRecord } from '../../types';
import { dynamoDBService } from '../../services/dynamodb';
import { webSocketService } from '../../services/websocket';
import { getCurrentTimestamp, parseJsonSafely } from '../../utils/response';

export const handler: SNSHandler = async (event) => {
  console.log('Processing message posting events:', JSON.stringify(event, null, 2));

  try {
    for (const record of event.Records) {
      await processMessagePostingRecord(record);
    }
  } catch (error) {
    console.error('Error processing message posting events:', error);
    throw error; // This will cause the Lambda to retry
  }
};

async function processMessagePostingRecord(record: SNSEventRecord): Promise<void> {
  try {
    const message = parseJsonSafely<MessagePostEvent>(record.Sns.Message);
    if (!message) {
      console.error('Invalid message format:', record.Sns.Message);
      return;
    }

    console.log('Processing message posting for board:', message.boardId);

    // Verify the board exists
    const board = await dynamoDBService.getBoard(message.boardId);
    if (!board) {
      console.error('Board not found:', message.boardId);
      return; // Don't retry for this error
    }

    // Verify the user exists
    const user = await dynamoDBService.getUserById(message.userId);
    if (!user) {
      console.error('User not found:', message.userId);
      return; // Don't retry for this error
    }

    // Create new message
    const messageId = uuidv4();
    const currentTime = getCurrentTimestamp();
    const timestamp = Date.now();

    const newMessage: Message = {
      messageId,
      boardId: message.boardId,
      userId: message.userId,
      userName: message.userName,
      content: message.content,
      timestamp,
      createdAt: currentTime
    };

    await dynamoDBService.createMessage(newMessage);

    console.log('Successfully created message:', {
      messageId,
      boardId: message.boardId,
      userId: message.userId
    });

    // Notify WebSocket clients about the new message
    try {
      await webSocketService.notifyNewMessage(message.boardId, newMessage);
    } catch (wsError) {
      console.error('Failed to notify WebSocket clients:', wsError);
      // Don't fail the entire operation for WebSocket errors
    }

  } catch (error: any) {
    console.error('Error processing message posting record:', error);
    throw error;
  }
}
