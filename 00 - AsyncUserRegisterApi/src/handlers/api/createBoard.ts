import { APIGatewayProxyHandler } from 'aws-lambda';
import { createSuccessResponse, createErrorResponse, validateRequiredFields, getCurrentTimestamp, parseJsonSafely } from '../../utils/response';
import { BoardCreationRequest, BoardCreationEvent } from '../../types';
import { messagingService } from '../../services/messaging';
import { dynamoDBService } from '../../services/dynamodb';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('Create board request:', JSON.stringify(event, null, 2));

    // Parse request body
    const requestBody = parseJsonSafely<BoardCreationRequest>(event.body || '{}');
    if (!requestBody) {
      return createErrorResponse('INVALID_JSON', 'Invalid JSON in request body', 400);
    }

    // Validate required fields
    const { isValid, missingFields } = validateRequiredFields(requestBody, ['name', 'description', 'createdBy']);
    if (!isValid) {
      return createErrorResponse(
        'MISSING_FIELDS', 
        `Missing required fields: ${missingFields.join(', ')}`, 
        400
      );
    }

    // Validate that the user exists
    const user = await dynamoDBService.getUserById(requestBody.createdBy);
    if (!user) {
      return createErrorResponse('USER_NOT_FOUND', 'Creator user not found', 404);
    }

    // Create board creation event
    const boardCreationEvent: BoardCreationEvent = {
      name: requestBody.name.trim(),
      description: requestBody.description.trim(),
      createdBy: requestBody.createdBy,
      timestamp: getCurrentTimestamp()
    };

    // Send to SQS for async processing
    await messagingService.sendBoardCreationRequest(boardCreationEvent);

    return createSuccessResponse(
      { 
        message: 'Board creation request submitted successfully',
        name: boardCreationEvent.name,
        status: 'processing'
      },
      202, // Accepted for processing
      'Board creation request will be processed asynchronously'
    );

  } catch (error: any) {
    console.error('Error in createBoard:', error);
    return createErrorResponse(
      'INTERNAL_ERROR', 
      'An internal error occurred while processing the board creation request', 
      500
    );
  }
};
