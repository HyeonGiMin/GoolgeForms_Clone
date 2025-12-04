# Google Forms Clone

이 Repository는 React, ASP.NET Core, MongoDB를 사용하여 Google Forms와 동일한 기능을 가지도록 Google Forms에 대한 클론 코딩입니다.

This repository is a clone coding of Google Forms using React, ASP.NET Core, and MongoDB to have the same functionality as Google Forms.

## 기술 스택 (Tech Stack)

### Frontend
- **React** with TypeScript
- **Material-UI (MUI)** for UI components
- **React Router** for navigation
- **Axios** for API calls

### Backend
- **ASP.NET Core Web API** (.NET 10)
- **MongoDB Driver** for database access
- **Swagger/OpenAPI** for API documentation

### Database
- **MongoDB** for storing forms and responses

## 주요 기능 (Features)

- ✅ 폼 생성, 수정, 삭제 (Create, edit, and delete forms)
- ✅ 다양한 질문 유형 지원 (Multiple question types):
  - 단답형 (Short Answer)
  - 장문형 (Paragraph)
  - 객관식 질문 (Multiple Choice)
  - 체크박스 (Checkboxes)
  - 드롭다운 (Dropdown)
  - 선형 배율 (Linear Scale)
  - 날짜 (Date)
  - 시간 (Time)
- ✅ 폼 미리보기 및 응답 제출 (Form preview and response submission)
- ✅ 응답 조회 및 관리 (View and manage responses)
- ✅ RESTful API with CORS support

## 프로젝트 구조 (Project Structure)

```
GoolgeForms_Clone/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── FormBuilder.tsx
│   │   │   ├── FormPreview.tsx
│   │   │   └── Responses.tsx
│   │   ├── services/
│   │   │   └── api.service.ts
│   │   └── types/
│   │       └── form.types.ts
│   └── package.json
├── backend/           # ASP.NET Core backend API
│   └── GoogleFormsClone.API/
│       ├── Controllers/
│       │   ├── FormsController.cs
│       │   └── ResponsesController.cs
│       ├── Models/
│       │   ├── Form.cs
│       │   └── FormResponse.cs
│       ├── Services/
│       │   ├── FormsService.cs
│       │   └── ResponsesService.cs
│       └── Configuration/
│           └── MongoDbSettings.cs
└── README.md
```

## 설치 및 실행 (Installation and Setup)

### 사전 요구사항 (Prerequisites)

- **Node.js** (v18 or higher)
- **.NET SDK** (10.0 or higher)
- **MongoDB** (v4.4 or higher)

### MongoDB 설정 (MongoDB Setup)

1. MongoDB 설치 및 실행
```bash
# MongoDB 설치 (Install MongoDB)
# https://www.mongodb.com/docs/manual/installation/

# MongoDB 실행 (Start MongoDB)
mongod
```

2. 기본적으로 localhost:27017에서 실행됩니다.

### Backend 설정 및 실행 (Backend Setup)

1. Backend 디렉토리로 이동:
```bash
cd backend/GoogleFormsClone.API
```

2. appsettings.json에서 MongoDB 연결 문자열 확인:
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

3. 패키지 복원 및 실행:
```bash
dotnet restore
dotnet run
```

Backend API는 기본적으로 https://localhost:5001 에서 실행됩니다.

### Frontend 설정 및 실행 (Frontend Setup)

1. Frontend 디렉토리로 이동:
```bash
cd frontend
```

2. 의존성 패키지 설치:
```bash
npm install
```

3. src/services/api.service.ts에서 API URL 확인:
```typescript
const API_BASE_URL = 'http://localhost:5000/api';
```

4. 개발 서버 실행:
```bash
npm start
```

Frontend 앱은 http://localhost:3000 에서 실행됩니다.

## API 문서 (API Documentation)

Backend가 실행 중일 때, Swagger UI를 통해 API 문서를 확인할 수 있습니다:
- Swagger UI: https://localhost:5001/swagger

### API Endpoints

#### Forms
- `GET /api/forms` - 모든 폼 조회
- `GET /api/forms/{id}` - 특정 폼 조회
- `POST /api/forms` - 새 폼 생성
- `PUT /api/forms/{id}` - 폼 업데이트
- `DELETE /api/forms/{id}` - 폼 삭제

#### Responses
- `GET /api/responses` - 모든 응답 조회
- `GET /api/responses/{id}` - 특정 응답 조회
- `GET /api/responses/form/{formId}` - 특정 폼의 모든 응답 조회
- `POST /api/responses` - 새 응답 제출
- `DELETE /api/responses/{id}` - 응답 삭제

## 사용 방법 (Usage)

1. **폼 생성**: 홈 페이지에서 "Create Form" 버튼을 클릭
2. **질문 추가**: "Add Question" 버튼으로 질문 추가
3. **질문 유형 선택**: 드롭다운에서 원하는 질문 유형 선택
4. **폼 저장**: "Save Form" 버튼으로 폼 저장
5. **응답 제출**: Preview 페이지에서 폼에 응답
6. **응답 확인**: Responses 페이지에서 제출된 응답 확인

## 개발 (Development)

### Frontend 빌드
```bash
cd frontend
npm run build
```

### Backend 빌드
```bash
cd backend/GoogleFormsClone.API
dotnet build
```

### 테스트
```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend/GoogleFormsClone.API
dotnet test
```

## 라이선스 (License)

This project is open source and available for educational purposes.

## 기여 (Contributing)

Contributions are welcome! Please feel free to submit a Pull Request.

## 문의 (Contact)

For any questions or issues, please open an issue on GitHub.
