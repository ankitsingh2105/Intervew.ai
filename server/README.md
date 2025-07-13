# Interview.ai Backend API

A Node.js/Express backend for the Interview.ai platform, providing AI-powered mock interview functionality.

## 🏗️ Architecture

```
server/
├── controllers/          # Business logic
│   ├── topicController.js
│   └── interviewController.js
├── data/                # Static data and models
│   └── topics.js
├── middleware/          # Validation and error handling
│   ├── validation.js
│   └── errorHandler.js
├── routes/              # API route definitions
│   ├── topics.js
│   └── process.js
├── services/            # External service integrations
│   └── gemini.js
├── config/              # Configuration files
│   └── db.js
└── server.js           # Main application file
```

## 🚀 Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Start the server:
```bash
npm run dev
```

## 📡 API Endpoints

### Topics API

#### Get All Topics
```http
GET /api/topics
```
Returns all available topics (individual + combinations)

#### Get Individual Topics
```http
GET /api/topics/individual
```
Returns only individual interview topics

#### Get Topic Combinations
```http
GET /api/topics/combinations
```
Returns pre-defined topic combinations

#### Get Topic by ID
```http
GET /api/topics/:id
```
Returns specific topic or combination by ID

#### Create Custom Combination
```http
POST /api/topics/custom
Content-Type: application/json

{
  "topicIds": ["react", "javascript", "system-design"]
}
```
Creates a custom topic combination from 2-3 selected topics

### Interview API

#### Start Interview
```http
POST /api/process/start
Content-Type: application/json

{
  "topicId": "react"
}
```
Starts a new interview session with the specified topic

#### Continue Interview
```http
POST /api/process
Content-Type: application/json

{
  "answer": "User's response",
  "history": [
    {"role": "user", "content": "Previous answer"},
    {"role": "assistant", "content": "Previous question"}
  ],
  "topicId": "react"
}
```
Continues the interview conversation with AI-generated responses

### Health Check
```http
GET /health
```
Returns server health status

## 🎯 Available Topics

### Individual Topics
- **dsa** - Data Structures & Algorithms
- **react** - React.js Development
- **javascript** - JavaScript Fundamentals
- **system-design** - System Design
- **python** - Python Programming
- **machine-learning** - Machine Learning

### Pre-defined Combinations
- **frontend-fullstack** - React + JavaScript + System Design
- **backend-python** - Python + System Design + DSA
- **ml-data-science** - Machine Learning + Python + DSA
- **web-development** - React + JavaScript + Python

## 🔧 Features

- **Topic-based Interviews**: Single topics or combinations of 2-3 topics
- **Dynamic Question Generation**: AI generates questions based on conversation flow
- **Adaptive Difficulty**: Questions adapt to candidate's skill level
- **Voice Integration**: Ready for speech-to-text and text-to-speech
- **Validation**: Input validation for all endpoints
- **Error Handling**: Standardized error responses
- **MVC Architecture**: Clean separation of concerns

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **AI Service**: Google Gemini API
- **Database**: MongoDB (configured but not used in current version)
- **Validation**: Custom middleware
- **Error Handling**: Global error handler

## 📝 Environment Variables

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
```

## 🔄 API Response Format

### Success Response
```json
{
  "success": true,
  "data": {...}
}
```
