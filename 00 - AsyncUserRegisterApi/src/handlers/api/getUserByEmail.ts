import { APIGatewayProxyHandler } from 'aws-lambda';
import { createSuccessResponse, createErrorResponse, validateEmail } from '../../utils/response';
import { dynamoDBService } from '../../services/dynamodb';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('Get user by email request:', JSON.stringify(event, null, 2));

    const email = event.pathParameters?.email;
    
    if (!email) {
      return createErrorResponse('MISSING_EMAIL', 'Email parameter is required', 400);
    }

    // Validate email format
    if (!validateEmail(email)) {
      return createErrorResponse('INVALID_EMAIL', 'Invalid email format', 400);
    }

    // Get user from DynamoDB
    const user = await dynamoDBService.getUserByEmail(email.toLowerCase().trim());
    
    if (!user) {
      return createErrorResponse('USER_NOT_FOUND', 'User not found', 404);
    }

    return createSuccessResponse({
      userId: user.userId,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    });

  } catch (error: any) {
    console.error('Error in getUserByEmail:', error);
    return createErrorResponse(
      'INTERNAL_ERROR', 
      'An internal error occurred while retrieving the user', 
      500
    );
  }
};
