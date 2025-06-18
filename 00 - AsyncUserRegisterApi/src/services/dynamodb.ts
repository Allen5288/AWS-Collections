import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { User, Board, Message, WebSocketConnection } from '../types';

// Create the base DynamoDB client
const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });

// DynamoDBDocumentClient is a wrapper around DynamoDBClient that provides several key benefits:
// 1. Automatic marshalling/unmarshalling: Converts JavaScript objects to DynamoDB's AttributeValue format and vice versa
// 2. Simplified API: No need to specify data types (S, N, B, etc.) - it infers them automatically
// 3. Native JavaScript types: Work directly with strings, numbers, booleans, arrays, and objects
// 4. Better developer experience: Less boilerplate code and fewer conversion errors
// 
// Without DocumentClient, you'd need to write:
// { email: { S: "user@example.com" }, userId: { S: "123" }, age: { N: "25" } }
// 
// With DocumentClient, you can simply write:
// { email: "user@example.com", userId: "123", age: 25 }
const docClient = DynamoDBDocumentClient.from(client);

export class DynamoDBService {
  private readonly usersTable = process.env.USERS_TABLE!;
  private readonly boardsTable = process.env.BOARDS_TABLE!;
  private readonly messagesTable = process.env.MESSAGES_TABLE!;
  private readonly connectionsTable = process.env.CONNECTIONS_TABLE!;

  // User operations
  async createUser(user: User): Promise<void> {
    const command = new PutCommand({
      TableName: this.usersTable,
      Item: user,
      ConditionExpression: 'attribute_not_exists(email)'
    });

    await docClient.send(command);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const command = new GetCommand({
      TableName: this.usersTable,
      Key: { email }
    });

    const result = await docClient.send(command);
    return result.Item as User || null;
  }

  async getUserById(userId: string): Promise<User | null> {
    const command = new QueryCommand({
      TableName: this.usersTable,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    });

    const result = await docClient.send(command);
    return result.Items?.[0] as User || null;
  }

  // Board operations
  async createBoard(board: Board): Promise<void> {
    const command = new PutCommand({
      TableName: this.boardsTable,
      Item: board
    });

    await docClient.send(command);
  }

  async getBoard(boardId: string): Promise<Board | null> {
    const command = new GetCommand({
      TableName: this.boardsTable,
      Key: { boardId }
    });

    const result = await docClient.send(command);
    return result.Item as Board || null;
  }

  async getAllBoards(): Promise<Board[]> {
    const command = new ScanCommand({
      TableName: this.boardsTable
    });

    const result = await docClient.send(command);
    return result.Items as Board[] || [];
  }

  // Message operations
  async createMessage(message: Message): Promise<void> {
    const command = new PutCommand({
      TableName: this.messagesTable,
      Item: message
    });

    await docClient.send(command);
  }

  async getMessagesByBoard(boardId: string, limit: number = 50): Promise<Message[]> {
    const command = new QueryCommand({
      TableName: this.messagesTable,
      IndexName: 'BoardMessagesIndex',
      KeyConditionExpression: 'boardId = :boardId',
      ExpressionAttributeValues: {
        ':boardId': boardId
      },
      ScanIndexForward: false, // Latest messages first
      Limit: limit
    });

    const result = await docClient.send(command);
    return result.Items as Message[] || [];
  }

  // WebSocket connection operations
  async saveConnection(connection: WebSocketConnection): Promise<void> {
    const command = new PutCommand({
      TableName: this.connectionsTable,
      Item: connection
    });

    await docClient.send(command);
  }

  async removeConnection(connectionId: string): Promise<void> {
    const command = new UpdateCommand({
      TableName: this.connectionsTable,
      Key: { connectionId },
      UpdateExpression: 'SET #ttl = :ttl',
      ExpressionAttributeNames: {
        '#ttl': 'ttl'
      },
      ExpressionAttributeValues: {
        ':ttl': Math.floor(Date.now() / 1000) + 10 // Expire in 10 seconds
      }
    });

    await docClient.send(command);
  }

  async getConnection(connectionId: string): Promise<WebSocketConnection | null> {
    const command = new GetCommand({
      TableName: this.connectionsTable,
      Key: { connectionId }
    });

    const result = await docClient.send(command);
    return result.Item as WebSocketConnection || null;
  }

  async getConnectionsByBoard(boardId: string): Promise<WebSocketConnection[]> {
    const command = new ScanCommand({
      TableName: this.connectionsTable,
      FilterExpression: 'contains(subscribedBoards, :boardId)',
      ExpressionAttributeValues: {
        ':boardId': boardId
      }
    });

    const result = await docClient.send(command);
    return result.Items as WebSocketConnection[] || [];
  }
  async updateConnectionSubscription(connectionId: string, boardId: string): Promise<void> {
    // Simple implementation - for production, you'd check for duplicates
    const command = new UpdateCommand({
      TableName: this.connectionsTable,
      Key: { connectionId },
      UpdateExpression: 'SET subscribedBoards = list_append(if_not_exists(subscribedBoards, :empty_list), :boardId)',
      ExpressionAttributeValues: {
        ':empty_list': [],
        ':boardId': [boardId]
      }
    });

    await docClient.send(command);
  }
}

export const dynamoDBService = new DynamoDBService();
