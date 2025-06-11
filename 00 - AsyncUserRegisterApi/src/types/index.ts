// User types
export interface User {
  userId: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRegistrationRequest {
  name: string;
  email: string;
}

export interface UserRegistrationEvent {
  name: string;
  email: string;
  timestamp: string;
}

// Board types
export interface Board {
  boardId: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoardCreationRequest {
  name: string;
  description: string;
  createdBy: string;
}

export interface BoardCreationEvent {
  name: string;
  description: string;
  createdBy: string;
  timestamp: string;
}

// Message types
export interface Message {
  messageId: string;
  boardId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
  createdAt: string;
}

export interface MessagePostRequest {
  content: string;
  userId: string;
  userName: string;
}

export interface MessagePostEvent {
  boardId: string;
  content: string;
  userId: string;
  userName: string;
  timestamp: string;
}

// WebSocket types
export interface WebSocketConnection {
  connectionId: string;
  userId?: string;
  subscribedBoards: string[];
  connectedAt: string;
}

export interface WebSocketMessage {
  action: string;
  data?: any;
}

export interface SubscribeRequest {
  action: 'subscribe';
  boardId: string;
  userId: string;
}

// API Response types
export interface ApiResponse<T = any> {
  statusCode: number;
  body: string;
  headers?: { [key: string]: string };
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
}

// Lambda Event types
export interface SNSEventRecord {
  EventSource: string;
  EventVersion: string;
  EventSubscriptionArn: string;
  Sns: {
    Type: string;
    MessageId: string;
    TopicArn: string;
    Subject: string;
    Message: string;
    Timestamp: string;
    SignatureVersion: string;
    Signature: string;
    SigningCertUrl: string;
    UnsubscribeUrl: string;
    MessageAttributes: any;
  };
}

export interface SQSEventRecord {
  messageId: string;
  receiptHandle: string;
  body: string;
  attributes: any;
  messageAttributes: any;
  md5OfBody: string;
  eventSource: string;
  eventSourceARN: string;
  awsRegion: string;
}
