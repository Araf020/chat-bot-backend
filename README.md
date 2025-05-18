# Chat Bot Backend

Node.js backend for the chat bot application using Express and Groq API.

## Setup

1. Install dependencies
   ```
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3001
   GROQ_API_KEY=your_groq_api_key_here
   ```

3. Replace `your_groq_api_key_here` with your actual Groq API key.

## Running the server

### Development mode
```
npm run dev
```

### Production mode
```
npm start
```

## API Endpoints

### Chat API
- **URL**: `/api/chat`
- **Method**: POST
- **Body**:
  ```json
  {
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "Hello, can you help me with something?"
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "response": "Hello! I'd be happy to help you. What do you need assistance with?"
  }
  ```

### Save Conversation API
- **URL**: `/api/conversations`
- **Method**: POST
- **Body**:
  ```json
  {
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "Hello!"
      },
      {
        "role": "assistant",
        "content": "Hi there! How can I help you today?"
      }
    ],
    "systemPrompt": "You are a helpful assistant."
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Conversation saved"
  }
  ```