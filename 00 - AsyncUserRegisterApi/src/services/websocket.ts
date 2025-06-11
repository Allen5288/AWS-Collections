import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { dynamoDBService } from './dynamodb';

export class WebSocketService {
  private client: ApiGatewayManagementApiClient;

  constructor() {
    const endpoint = process.env.WEBSOCKET_ENDPOINT;
    if (!endpoint) {
      throw new Error('WEBSOCKET_ENDPOINT environment variable is required');
    }

    this.client = new ApiGatewayManagementApiClient({
      endpoint,
      region: process.env.AWS_REGION || 'us-east-1'
    });
  }

  async sendMessageToConnection(connectionId: string, message: any): Promise<boolean> {
    try {
      const command = new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: JSON.stringify(message)
      });

      await this.client.send(command);
      return true;
    } catch (error: any) {
      console.error(`Failed to send message to connection ${connectionId}:`, error);
      
      // If connection is stale, remove it
      if (error.statusCode === 410) {
        await dynamoDBService.removeConnection(connectionId);
      }
      
      return false;
    }
  }

  async broadcastToBoard(boardId: string, message: any): Promise<void> {
    try {
      const connections = await dynamoDBService.getConnectionsByBoard(boardId);
      
      const promises = connections.map(connection => 
        this.sendMessageToConnection(connection.connectionId, message)
      );

      await Promise.all(promises);
    } catch (error) {
      console.error(`Failed to broadcast to board ${boardId}:`, error);
    }
  }

  async notifyNewMessage(boardId: string, messageData: any): Promise<void> {
    const notification = {
      type: 'NEW_MESSAGE',
      boardId,
      data: messageData,
      timestamp: new Date().toISOString()
    };

    await this.broadcastToBoard(boardId, notification);
  }

  async notifyNewBoard(boardData: any): Promise<void> {
    // For simplicity, we'll broadcast new board notifications to all connections
    // In a production system, you might want to be more selective
    const notification = {
      type: 'NEW_BOARD',
      data: boardData,
      timestamp: new Date().toISOString()
    };

    // This would require getting all connections, but for demo purposes
    // we'll just log it and let subscribers know when they connect
    console.log('New board created:', notification);
  }
}

export const webSocketService = new WebSocketService();
