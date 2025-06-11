import { APIGatewayProxyHandler } from 'aws-lambda';
import { SubscribeRequest } from '../../types';
import { dynamoDBService } from '../../services/dynamodb';
import { webSocketService } from '../../services/websocket';
import { parseJsonSafely } from '../../utils/response';

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('WebSocket subscribe event:', JSON.stringify(event, null, 2));

  try {
    const connectionId = event.requestContext.connectionId!;
    
    // Parse the message body
    const message = parseJsonSafely<SubscribeRequest>(event.body || '{}');
    if (!message || message.action !== 'subscribe') {
      await webSocketService.sendMessageToConnection(connectionId, {
        type: 'ERROR',
        message: 'Invalid subscribe request format'
      });
      return { statusCode: 400, body: 'Invalid request' };
    }

    if (!message.boardId || !message.userId) {
      await webSocketService.sendMessageToConnection(connectionId, {
        type: 'ERROR',
        message: 'Missing boardId or userId'
      });
      return { statusCode: 400, body: 'Missing required fields' };
    }

    // Verify the board exists
    const board = await dynamoDBService.getBoard(message.boardId);
    if (!board) {
      await webSocketService.sendMessageToConnection(connectionId, {
        type: 'ERROR',
        message: 'Board not found'
      });
      return { statusCode: 404, body: 'Board not found' };
    }

    // Verify the user exists
    const user = await dynamoDBService.getUserById(message.userId);
    if (!user) {
      await webSocketService.sendMessageToConnection(connectionId, {
        type: 'ERROR',
        message: 'User not found'
      });
      return { statusCode: 404, body: 'User not found' };
    }

    // Update connection to subscribe to the board
    await dynamoDBService.updateConnectionSubscription(connectionId, message.boardId);

    // Send confirmation
    await webSocketService.sendMessageToConnection(connectionId, {
      type: 'SUBSCRIBED',
      boardId: message.boardId,
      boardName: board.name,
      message: `Successfully subscribed to board: ${board.name}`
    });

    console.log(`Connection ${connectionId} subscribed to board ${message.boardId}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Subscribed successfully' })
    };

  } catch (error: any) {
    console.error('Error in WebSocket subscribe:', error);
    
    try {
      const connectionId = event.requestContext.connectionId!;
      await webSocketService.sendMessageToConnection(connectionId, {
        type: 'ERROR',
        message: 'Internal server error'
      });
    } catch (sendError) {
      console.error('Failed to send error message:', sendError);
    }
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to process subscription',
        message: error.message 
      })
    };
  }
};
