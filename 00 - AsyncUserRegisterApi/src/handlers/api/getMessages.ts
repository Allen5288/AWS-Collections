import { APIGatewayProxyHandler } from 'aws-lambda';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { dynamoDBService } from '../../services/dynamodb';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('Get messages request:', JSON.stringify(event, null, 2));

    const boardId = event.pathParameters?.boardId;
    if (!boardId) {
      return createErrorResponse('MISSING_BOARD_ID', 'Board ID parameter is required', 400);
    }

    // Check if board exists
    const board = await dynamoDBService.getBoard(boardId);
    if (!board) {
      return createErrorResponse('BOARD_NOT_FOUND', 'Board not found', 404);
    }

    // Get query parameters for pagination
    const limit = parseInt(event.queryStringParameters?.limit || '50');
    const validLimit = Math.min(Math.max(limit, 1), 100); // Between 1 and 100

    // Get messages for the board
    const messages = await dynamoDBService.getMessagesByBoard(boardId, validLimit);

    return createSuccessResponse({
      boardId,
      boardName: board.name,
      messages,
      count: messages.length,
      limit: validLimit
    });

  } catch (error: any) {
    console.error('Error in getMessages:', error);
    return createErrorResponse(
      'INTERNAL_ERROR', 
      'An internal error occurred while retrieving messages', 
      500
    );
  }
};
