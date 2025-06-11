import { APIGatewayProxyHandler } from 'aws-lambda';
import { WebSocketConnection } from '../../types';
import { dynamoDBService } from '../../services/dynamodb';
import { getCurrentTimestamp } from '../../utils/response';

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('WebSocket connect event:', JSON.stringify(event, null, 2));

  try {
    const connectionId = event.requestContext.connectionId!;
    
    // Create connection record
    const connection: WebSocketConnection = {
      connectionId,
      subscribedBoards: [],
      connectedAt: getCurrentTimestamp()
    };

    await dynamoDBService.saveConnection(connection);

    console.log('WebSocket connection established:', connectionId);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Connected successfully' })
    };

  } catch (error: any) {
    console.error('Error in WebSocket connect:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to establish connection',
        message: error.message 
      })
    };
  }
};
