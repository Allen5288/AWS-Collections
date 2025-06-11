import { SQSHandler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { Board, BoardCreationEvent, SQSEventRecord } from '../../types';
import { dynamoDBService } from '../../services/dynamodb';
import { webSocketService } from '../../services/websocket';
import { getCurrentTimestamp, parseJsonSafely } from '../../utils/response';

export const handler: SQSHandler = async (event) => {
  console.log('Processing board creation events:', JSON.stringify(event, null, 2));

  try {
    for (const record of event.Records) {
      await processBoardCreationRecord(record);
    }
  } catch (error) {
    console.error('Error processing board creation events:', error);
    throw error; // This will cause the Lambda to retry
  }
};

async function processBoardCreationRecord(record: SQSEventRecord): Promise<void> {
  try {
    const message = parseJsonSafely<BoardCreationEvent>(record.body);
    if (!message) {
      console.error('Invalid message format:', record.body);
      return;
    }

    console.log('Processing board creation:', message.name);

    // Verify the creator user exists
    const user = await dynamoDBService.getUserById(message.createdBy);
    if (!user) {
      console.error('Creator user not found:', message.createdBy);
      return; // Don't retry for this error
    }

    // Create new board
    const boardId = uuidv4();
    const currentTime = getCurrentTimestamp();

    const newBoard: Board = {
      boardId,
      name: message.name,
      description: message.description,
      createdBy: message.createdBy,
      createdAt: currentTime,
      updatedAt: currentTime
    };

    await dynamoDBService.createBoard(newBoard);

    console.log('Successfully created board:', {
      boardId,
      name: message.name,
      createdBy: message.createdBy
    });

    // Notify WebSocket clients about the new board
    try {
      await webSocketService.notifyNewBoard(newBoard);
    } catch (wsError) {
      console.error('Failed to notify WebSocket clients:', wsError);
      // Don't fail the entire operation for WebSocket errors
    }

  } catch (error: any) {
    console.error('Error processing board creation record:', error);
    throw error;
  }
}
