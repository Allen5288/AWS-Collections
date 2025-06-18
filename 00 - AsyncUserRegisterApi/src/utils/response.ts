import { ApiResponse, SuccessResponse, ErrorResponse } from '../types';

export function createSuccessResponse<T>(
  data: T, 
  statusCode: number = 200, 
  message?: string
): ApiResponse {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    ...(message && { message })
  };

  return {
    statusCode,
    headers: {
      // serverless.yml with cors: true - API Gateway handles CORS automatically, no need to set headers
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE'
    },
    body: JSON.stringify(response)
  };
}

export function createErrorResponse(
  error: string, 
  message: string, 
  statusCode: number = 400
): ApiResponse {
  const response: ErrorResponse = {
    success: false,
    error,
    message
  };

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE'
    },
    body: JSON.stringify(response)
  };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateRequiredFields(
  obj: any, 
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter(field => !obj[field] || obj[field].trim() === '');
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

export function parseJsonSafely<T>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return null;
  }
}
