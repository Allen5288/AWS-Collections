import { APIGatewayProxyHandler } from 'aws-lambda';
import { dynamoDBService } from '../../services/dynamodb';

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('WebSocket disconnect event:', JSON.stringify(event, null, 2));

  try {
    const connectionId = event.requestContext.connectionId!;
    
    // Remove connection record
    await dynamoDBService.removeConnection(connectionId);

    console.log('WebSocket connection disconnected:', connectionId);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Disconnected successfully' })
    };

  } catch (error: any) {
    console.error('Error in WebSocket disconnect:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to handle disconnection',
        message: error.message 
      })
    };
  }
};
