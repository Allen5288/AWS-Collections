import { APIGatewayProxyHandler } from 'aws-lambda';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { dynamoDBService } from '../../services/dynamodb';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('List boards request:', JSON.stringify(event, null, 2));

    // Get all boards from DynamoDB
    const boards = await dynamoDBService.getAllBoards();

    // Sort boards by creation date (newest first)
    const sortedBoards = boards.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return createSuccessResponse({
      boards: sortedBoards,
      count: sortedBoards.length
    });

  } catch (error: any) {
    console.error('Error in listBoards:', error);
    return createErrorResponse(
      'INTERNAL_ERROR', 
      'An internal error occurred while retrieving boards', 
      500
    );
  }
};
