import { APIGatewayProxyHandler } from 'aws-lambda';
import { createSuccessResponse, createErrorResponse, validateRequiredFields, getCurrentTimestamp, parseJsonSafely } from '../../utils/response';
import { MessagePostRequest, MessagePostEvent } from '../../types';
import { messagingService } from '../../services/messaging';
import { dynamoDBService } from '../../services/dynamodb';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('Post message request:', JSON.stringify(event, null, 2));

    const boardId = event.pathParameters?.boardId;
    if (!boardId) {
      return createErrorResponse('MISSING_BOARD_ID', 'Board ID parameter is required', 400);
    }

    // Parse request body
    const requestBody = parseJsonSafely<MessagePostRequest>(event.body || '{}');
    if (!requestBody) {
      return createErrorResponse('INVALID_JSON', 'Invalid JSON in request body', 400);
    }

    // Validate required fields
    const { isValid, missingFields } = validateRequiredFields(requestBody, ['content', 'userId', 'userName']);
    if (!isValid) {
      return createErrorResponse(
        'MISSING_FIELDS', 
        `Missing required fields: ${missingFields.join(', ')}`, 
        400
      );
    }

    // Validate that the board exists
    const board = await dynamoDBService.getBoard(boardId);
    if (!board) {
      return createErrorResponse('BOARD_NOT_FOUND', 'Board not found', 404);
    }

    // Validate that the user exists
    const user = await dynamoDBService.getUserById(requestBody.userId);
    if (!user) {
      return createErrorResponse('USER_NOT_FOUND', 'User not found', 404);
    }

    // Create message posting event
    const messagePostEvent: MessagePostEvent = {
      boardId,
      content: requestBody.content.trim(),
      userId: requestBody.userId,
      userName: requestBody.userName.trim(),
      timestamp: getCurrentTimestamp()
    };

    // Publish to SNS for async processing
    await messagingService.publishMessagePosting(messagePostEvent);

    return createSuccessResponse(
      { 
        message: 'Message posting request submitted successfully',
        boardId,
        status: 'processing'
      },
      202, // Accepted for processing
      'Message posting request will be processed asynchronously'
    );

  } catch (error: any) {
    console.error('Error in postMessage:', error);
    return createErrorResponse(
      'INTERNAL_ERROR', 
      'An internal error occurred while processing the message posting request', 
      500
    );
  }
};
