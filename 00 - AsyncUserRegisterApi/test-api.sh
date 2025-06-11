#!/bin/bash

# API Testing Script for Async User Register API
# This script demonstrates how to test all the API endpoints

# Configuration
API_BASE_URL="https://czicg2e1el.execute-api.us-east-1.amazonaws.com/dev/api/v1"
WEBSOCKET_URL="wss://w7hs5zpy2g.execute-api.us-east-1.amazonaws.com/dev"

echo "=== Async User Register API Testing ==="
echo "API Base URL: $API_BASE_URL"
echo ""

# Test 1: Register a new user
echo "1. Testing User Registration (Async)"
echo "POST $API_BASE_URL/register"

REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com"
  }')

echo "Response: $REGISTER_RESPONSE"
echo ""

# Wait a moment for async processing
echo "Waiting 5 seconds for user registration to process..."
sleep 5

# Test 2: Get user by email
echo "2. Testing Get User by Email"
echo "GET $API_BASE_URL/user/john.doe@example.com"

USER_RESPONSE=$(curl -s -X GET "$API_BASE_URL/user/john.doe@example.com")
echo "Response: $USER_RESPONSE"

# Extract userId from response
USER_ID=$(echo $USER_RESPONSE | grep -o '"userId":"[^"]*"' | cut -d'"' -f4)
echo "Extracted User ID: $USER_ID"
echo ""

# Test 3: List all boards (should be empty initially)
echo "3. Testing List Message Boards"
echo "GET $API_BASE_URL/boards"

BOARDS_RESPONSE=$(curl -s -X GET "$API_BASE_URL/boards")
echo "Response: $BOARDS_RESPONSE"
echo ""

# Test 4: Create a new board
echo "4. Testing Create Message Board (Async via SQS)"
echo "POST $API_BASE_URL/boards"

if [ -n "$USER_ID" ]; then
  CREATE_BOARD_RESPONSE=$(curl -s -X POST "$API_BASE_URL/boards" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"General Discussion\",
      \"description\": \"A board for general discussions\",
      \"createdBy\": \"$USER_ID\"
    }")
  
  echo "Response: $CREATE_BOARD_RESPONSE"
else
  echo "Skipping board creation - no user ID available"
fi
echo ""

# Wait for board creation
echo "Waiting 5 seconds for board creation to process..."
sleep 5

# Test 5: List boards again (should now show the created board)
echo "5. Testing List Message Boards (After Creation)"
echo "GET $API_BASE_URL/boards"

BOARDS_RESPONSE=$(curl -s -X GET "$API_BASE_URL/boards")
echo "Response: $BOARDS_RESPONSE"

# Extract boardId from response
BOARD_ID=$(echo $BOARDS_RESPONSE | grep -o '"boardId":"[^"]*"' | cut -d'"' -f4)
echo "Extracted Board ID: $BOARD_ID"
echo ""

# Test 6: Post a message to the board
echo "6. Testing Post Message to Board (Async via SNS)"
echo "POST $API_BASE_URL/boards/$BOARD_ID/messages"

if [ -n "$BOARD_ID" ] && [ -n "$USER_ID" ]; then
  POST_MESSAGE_RESPONSE=$(curl -s -X POST "$API_BASE_URL/boards/$BOARD_ID/messages" \
    -H "Content-Type: application/json" \
    -d "{
      \"content\": \"Hello, this is my first message!\",
      \"userId\": \"$USER_ID\",
      \"userName\": \"John Doe\"
    }")
  
  echo "Response: $POST_MESSAGE_RESPONSE"
else
  echo "Skipping message posting - no board ID or user ID available"
fi
echo ""

# Wait for message processing
echo "Waiting 5 seconds for message posting to process..."
sleep 5

# Test 7: Get messages from the board
echo "7. Testing Get Messages from Board"
echo "GET $API_BASE_URL/boards/$BOARD_ID/messages"

if [ -n "$BOARD_ID" ]; then
  MESSAGES_RESPONSE=$(curl -s -X GET "$API_BASE_URL/boards/$BOARD_ID/messages")
  echo "Response: $MESSAGES_RESPONSE"
else
  echo "Skipping message retrieval - no board ID available"
fi
echo ""

# Test 8: Error cases
echo "8. Testing Error Cases"

echo "8.1. Register user with invalid email"
INVALID_EMAIL_RESPONSE=$(curl -s -X POST "$API_BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Invalid User",
    "email": "invalid-email"
  }')
echo "Response: $INVALID_EMAIL_RESPONSE"
echo ""

echo "8.2. Get non-existent user"
NOT_FOUND_RESPONSE=$(curl -s -X GET "$API_BASE_URL/user/nonexistent@example.com")
echo "Response: $NOT_FOUND_RESPONSE"
echo ""

echo "8.3. Get messages from non-existent board"
INVALID_BOARD_RESPONSE=$(curl -s -X GET "$API_BASE_URL/boards/invalid-board-id/messages")
echo "Response: $INVALID_BOARD_RESPONSE"
echo ""

echo "=== Testing Complete ==="
echo ""
echo "WebSocket Testing:"
echo "You can test WebSocket functionality using a WebSocket client:"
echo "1. Connect to: $WEBSOCKET_URL"
echo "2. Send subscription message:"
echo '   {"action": "subscribe", "boardId": "'$BOARD_ID'", "userId": "'$USER_ID'"}'
echo "3. Post new messages via the REST API to see real-time notifications"
