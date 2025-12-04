# Google Forms Clone - Setup Guide

## Quick Start with Docker

가장 빠르게 시작하는 방법은 Docker Compose를 사용하는 것입니다.

The fastest way to get started is using Docker Compose.

### Prerequisites
- Docker
- Docker Compose

### Steps

1. Clone the repository:
```bash
git clone https://github.com/HyeonGiMin/GoolgeForms_Clone.git
cd GoolgeForms_Clone
```

2. Run with Docker Compose:
```bash
docker-compose up --build
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

## Manual Setup

### 1. MongoDB Setup

#### Option A: Local Installation
1. Download and install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service:
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

#### Option B: Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. Backend Setup

1. Navigate to backend directory:
```bash
cd backend/GoogleFormsClone.API
```

2. Restore dependencies:
```bash
dotnet restore
```

3. Update MongoDB connection string in `appsettings.json` if needed:
```json
{
  "MongoDbSettings": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "GoogleFormsClone"
  }
}
```

4. Run the backend:
```bash
dotnet run
```

The API will be available at:
- HTTP: http://localhost:5000
- HTTPS: https://localhost:5001
- Swagger: https://localhost:5001/swagger

### 3. Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update API URL in `src/services/api.service.ts` if needed:
```typescript
const API_BASE_URL = 'http://localhost:5000/api';
```

4. Start the development server:
```bash
npm start
```

The frontend will be available at http://localhost:3000

## Environment Variables

### Backend (appsettings.json)
```json
{
  "MongoDbSettings": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "GoogleFormsClone",
    "FormsCollectionName": "forms",
    "ResponsesCollectionName": "responses"
  }
}
```

### Frontend (.env)
Create a `.env` file in the frontend directory:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongosh` (MongoDB Shell)
- Check if port 27017 is not blocked
- Verify connection string in appsettings.json

### CORS Issues
- Ensure backend CORS policy allows frontend origin
- Check Program.cs for CORS configuration
- Default allows http://localhost:3000

### Port Conflicts
If ports are already in use:

Backend:
```bash
# Change in backend/GoogleFormsClone.API/Properties/launchSettings.json
dotnet run --urls "http://localhost:5050"
```

Frontend:
```bash
# Set PORT environment variable
PORT=3001 npm start
```

## Production Deployment

### Backend
```bash
cd backend/GoogleFormsClone.API
dotnet publish -c Release -o ./publish
```

### Frontend
```bash
cd frontend
npm run build
```

The build folder can be served with any static file server.

## Database Schema

### Forms Collection
```json
{
  "_id": "ObjectId",
  "title": "string",
  "description": "string",
  "questions": [
    {
      "_id": "ObjectId",
      "type": "number (0-7)",
      "title": "string",
      "description": "string",
      "required": "boolean",
      "options": ["string"]
    }
  ],
  "createdAt": "DateTime",
  "updatedAt": "DateTime",
  "isAcceptingResponses": "boolean"
}
```

### Responses Collection
```json
{
  "_id": "ObjectId",
  "formId": "ObjectId",
  "answers": [
    {
      "questionId": "ObjectId",
      "value": "any"
    }
  ],
  "submittedAt": "DateTime"
}
```

## Testing

### Backend Tests
```bash
cd backend/GoogleFormsClone.API
dotnet test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Development Tips

1. Use Swagger UI for API testing: https://localhost:5001/swagger
2. Use React DevTools for debugging frontend
3. Monitor MongoDB with MongoDB Compass
4. Check browser console for frontend errors
5. Check terminal/console for backend errors

## Support

For issues and questions:
- GitHub Issues: https://github.com/HyeonGiMin/GoolgeForms_Clone/issues
