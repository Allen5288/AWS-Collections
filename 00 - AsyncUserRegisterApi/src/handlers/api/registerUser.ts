import { APIGatewayProxyHandler } from 'aws-lambda';
import { createSuccessResponse, createErrorResponse, validateEmail, validateRequiredFields, getCurrentTimestamp, parseJsonSafely } from '../../utils/response';
import { UserRegistrationRequest, UserRegistrationEvent } from '../../types';
import { messagingService } from '../../services/messaging';
import { dynamoDBService } from '../../services/dynamodb';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('Register user request:', JSON.stringify(event, null, 2));

    // Parse request body
    const requestBody = parseJsonSafely<UserRegistrationRequest>(event.body || '{}');
    if (!requestBody) {
      return createErrorResponse('INVALID_JSON', 'Invalid JSON in request body', 400);
    }

    // Validate required fields
    const { isValid, missingFields } = validateRequiredFields(requestBody, ['name', 'email']);
    if (!isValid) {
      return createErrorResponse(
        'MISSING_FIELDS', 
        `Missing required fields: ${missingFields.join(', ')}`, 
        400
      );
    }

    // Validate email format
    if (!validateEmail(requestBody.email)) {
      return createErrorResponse('INVALID_EMAIL', 'Invalid email format', 400);
    }

    // Check if user already exists
    const existingUser = await dynamoDBService.getUserByEmail(requestBody.email);
    if (existingUser) {
      return createErrorResponse('USER_EXISTS', 'User with this email already exists', 409);
    }

    // Create user registration event
    const registrationEvent: UserRegistrationEvent = {
      name: requestBody.name.trim(),
      email: requestBody.email.toLowerCase().trim(),
      timestamp: getCurrentTimestamp()
    };

    // Publish to SNS for async processing
    await messagingService.publishUserRegistration(registrationEvent);

    return createSuccessResponse(
      { 
        message: 'User registration request submitted successfully',
        email: registrationEvent.email,
        status: 'processing'
      },
      202, // Accepted for processing
      'Registration request will be processed asynchronously'
    );

  } catch (error: any) {
    console.error('Error in registerUser:', error);
    return createErrorResponse(
      'INTERNAL_ERROR', 
      'An internal error occurred while processing the registration request', 
      500
    );
  }
};
