# Google Forms Clone - Architecture Documentation

## System Architecture

이 시스템은 3-tier 아키텍처를 따릅니다:

This system follows a 3-tier architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│                   (React + TypeScript)                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │   Pages    │  │ Components │  │  Services  │        │
│  └────────────┘  └────────────┘  └────────────┘        │
└─────────────────────────────────────────────────────────┘
                         │
                    HTTP/REST API
                         │
┌─────────────────────────────────────────────────────────┐
│                   Backend Layer                          │
│               (ASP.NET Core Web API)                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │Controllers │  │  Services  │  │   Models   │        │
│  └────────────┘  └────────────┘  └────────────┘        │
└─────────────────────────────────────────────────────────┘
                         │
                    MongoDB Driver
                         │
┌─────────────────────────────────────────────────────────┐
│                   Database Layer                         │
│                      (MongoDB)                           │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │ forms Collection│  │responses Collection│            │
│  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Technology Stack
- **React 18** with TypeScript
- **Material-UI v6** for UI components
- **React Router v6** for client-side routing
- **Axios** for HTTP requests

### Project Structure
```
frontend/src/
├── pages/              # Page components
│   ├── Home.tsx        # Dashboard showing all forms
│   ├── FormBuilder.tsx # Create/Edit form interface
│   ├── FormPreview.tsx # Form filling interface
│   └── Responses.tsx   # View form responses
├── services/           # API services
│   └── api.service.ts  # HTTP client for backend API
├── types/              # TypeScript type definitions
│   └── form.types.ts   # Form-related types
└── App.tsx            # Main app with routing
```

### Key Components

#### 1. Home Page
- Lists all available forms
- Create, edit, delete operations
- Navigate to responses view

#### 2. Form Builder
- Add/remove questions
- Multiple question types support
- Set question as required/optional
- Dynamic options for choice-based questions

#### 3. Form Preview
- Renders form for users to fill
- Validates required fields
- Submits responses to backend

#### 4. Responses View
- Displays all responses in table format
- Shows submission timestamps
- Organized by questions

### State Management
- Uses React Hooks (useState, useEffect)
- Local component state
- No global state management library (can be added if needed)

## Backend Architecture

### Technology Stack
- **ASP.NET Core 10** Web API
- **MongoDB.Driver** for database access
- **Swashbuckle** for Swagger/OpenAPI documentation

### Project Structure
```
backend/GoogleFormsClone.API/
├── Controllers/         # API endpoints
│   ├── FormsController.cs
│   └── ResponsesController.cs
├── Models/             # Data models
│   ├── Form.cs
│   └── FormResponse.cs
├── Services/           # Business logic
│   ├── FormsService.cs
│   └── ResponsesService.cs
└── Configuration/      # Settings
    └── MongoDbSettings.cs
```

### Design Patterns

#### 1. Repository Pattern (Service Layer)
```csharp
public class FormsService
{
    private readonly IMongoCollection<Form> _formsCollection;
    
    // CRUD operations
    public async Task<List<Form>> GetAsync()
    public async Task<Form?> GetAsync(string id)
    public async Task CreateAsync(Form newForm)
    public async Task UpdateAsync(string id, Form updatedForm)
    public async Task RemoveAsync(string id)
}
```

#### 2. Dependency Injection
- Services registered in Program.cs
- Injected into controllers
- Configuration through Options pattern

#### 3. RESTful API Design
```
GET    /api/forms           # Get all forms
GET    /api/forms/{id}      # Get specific form
POST   /api/forms           # Create form
PUT    /api/forms/{id}      # Update form
DELETE /api/forms/{id}      # Delete form
```

### Middleware Pipeline
```
Request → CORS → HTTPS Redirect → Authorization → Routing → Controllers → Response
```

## Database Design

### MongoDB Collections

#### Forms Collection
Stores form definitions with questions:
```json
{
  "_id": ObjectId,
  "title": String,
  "description": String,
  "questions": [
    {
      "_id": ObjectId,
      "type": Number (QuestionType enum),
      "title": String,
      "description": String,
      "required": Boolean,
      "options": [String] (nullable)
    }
  ],
  "createdAt": DateTime,
  "updatedAt": DateTime,
  "isAcceptingResponses": Boolean
}
```

#### Responses Collection
Stores user responses to forms:
```json
{
  "_id": ObjectId,
  "formId": ObjectId (reference),
  "answers": [
    {
      "questionId": ObjectId,
      "value": Mixed (string, array, number, date)
    }
  ],
  "submittedAt": DateTime
}
```

### Indexes
Recommended indexes for performance:
```javascript
// Forms collection
db.forms.createIndex({ "createdAt": -1 })

// Responses collection
db.responses.createIndex({ "formId": 1 })
db.responses.createIndex({ "submittedAt": -1 })
```

## Data Flow

### Creating a Form
```
1. User clicks "Create Form" in Home page
2. Navigate to FormBuilder page
3. User enters form title, description, and questions
4. User clicks "Save"
5. React calls formsApi.createForm()
6. Axios sends POST request to /api/forms
7. Backend validates and saves to MongoDB
8. Returns created form with ID
9. Navigate back to Home page
```

### Submitting a Response
```
1. User navigates to FormPreview page with form ID
2. Frontend fetches form data from /api/forms/{id}
3. Renders form based on question types
4. User fills in answers
5. User clicks "Submit"
6. React calls responsesApi.createResponse()
7. Axios sends POST request to /api/responses
8. Backend saves response to MongoDB
9. Success message shown to user
```

### Viewing Responses
```
1. User clicks "Responses" button on a form
2. Navigate to Responses page
3. Frontend fetches:
   - Form data: /api/forms/{id}
   - Responses: /api/responses/form/{formId}
4. Renders table with questions as columns
5. Each row represents one response
```

## Security Considerations

### Current Implementation
- CORS enabled for specified origins
- Input validation on required fields
- MongoDB ObjectId validation
- HTTPS redirection in production

### Recommended Enhancements
1. **Authentication & Authorization**
   - Add user authentication (JWT, OAuth)
   - Form ownership and permissions
   - Response access control

2. **Input Validation**
   - Add FluentValidation in backend
   - More comprehensive client-side validation
   - Sanitize user inputs

3. **Rate Limiting**
   - Prevent spam submissions
   - API rate limiting

4. **Data Encryption**
   - Encrypt sensitive form responses
   - HTTPS only in production

## Scalability

### Horizontal Scaling
- Backend API is stateless (can add load balancer)
- MongoDB supports replica sets
- Frontend can be served from CDN

### Performance Optimization
- Add caching layer (Redis)
- Implement pagination for large datasets
- Add database indexes
- Lazy loading in frontend
- Code splitting in React

### Monitoring
- Add logging (Serilog, NLog)
- Application Insights / ELK stack
- MongoDB performance monitoring
- Frontend error tracking (Sentry)

## Future Enhancements

1. **User Management**
   - User authentication
   - Form ownership
   - Sharing and collaboration

2. **Advanced Features**
   - Form templates
   - Conditional logic (show/hide questions)
   - File uploads
   - Email notifications
   - Export responses (CSV, Excel)

3. **Analytics**
   - Response statistics
   - Charts and graphs
   - Response summary

4. **Real-time Features**
   - Live response updates
   - Collaborative form editing
   - WebSocket support

## API Documentation

Full API documentation is available via Swagger UI when running the backend:
- URL: https://localhost:5001/swagger
- Interactive testing
- Request/Response schemas
- Try it out functionality
