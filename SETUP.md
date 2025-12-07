# Google Forms Clone - 실행 가이드

## 📋 사전 요구사항

-   **.NET SDK 8.0** 이상
-   **Node.js 18** 이상
-   **MongoDB** (외부 서버 또는 로컬)

## 🔧 초기 설정

### 1. 저장소 클론

```bash
git clone https://github.com/HyeonGiMin/GoolgeForms_Clone.git
cd GoolgeForms_Clone
```

### 2. Backend 환경 변수 설정

`backend/GoogleFormsClone.Api/.env` 파일에 MongoDB 연결 정보를 설정합니다:

```bash
# MongoDB Configuration
MONGODB_CONNECTION_STRING=mongodb://username:password@host:port
MONGODB_DATABASE_NAME=google_forms_clone
```

**연결 문자열 예시:**

-   **인증 있음**: `mongodb://username:password@host:port`
-   **인증 없음**: `mongodb://localhost:27017`
-   **MongoDB Atlas**: `mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority`

### 3. 의존성 설치

#### Backend

```bash
cd backend/GoogleFormsClone.Api
dotnet restore
```

#### Frontend

```bash
cd frontend
npm install --legacy-peer-deps
```

## 🚀 실행 방법

### Backend 실행

```bash
cd backend/GoogleFormsClone.Api
dotnet run
```

**또는 개발 모드 (핫 리로드):**

```bash
dotnet watch run
```

### Backend 핫 리로드(Hot Reload) 세부

-   `dotnet watch run` 으로 실행하면 C# 코드 변경 시 자동 빌드/재시작 + Blazor/razor 미사용 시 API도 자동 반영됩니다.
-   변경 후 수 초 내 리로드되며, 로그에 `watch : Hot reload enabled.`가 보이면 정상 동작 중입니다.
-   포트 충돌 시 `ASPNETCORE_URLS`로 임시 포트 지정 예: `ASPNETCORE_URLS=http://localhost:5050 dotnet watch run`.
-   VS Code F5 디버깅 시에도 `dotnet watch run`을 PreLaunchTask로 설정 가능하지만, 단순 터미널 실행이 가장 빠릅니다.

**실행 후 접속 주소:**

-   API: `http://localhost:15025`
-   Swagger UI: `http://localhost:15025/swagger`
-   HTTPS: `https://localhost:7057`

### Frontend 실행

```bash
cd frontend
npm run dev
```

**실행 후 접속 주소:**

-   `http://localhost:5173`

## 🐛 디버깅

### Visual Studio Code에서 디버깅

#### Backend 디버깅

1. VS Code에서 프로젝트 열기
2. `F5` 키 또는 Run > Start Debugging
3. `.NET Core Launch (web)` 선택

#### Frontend 디버깅

1. Chrome 브라우저에서 `http://localhost:5173` 접속
2. `F12` 개발자 도구 열기
3. Sources 탭에서 중단점 설정

### Visual Studio에서 디버깅

1. `backend/GoogleFormsClone.sln` 열기
2. `F5` 키로 디버깅 시작

## 📦 빌드

### Backend 빌드

```bash
cd backend/GoogleFormsClone.Api
dotnet build
```

**배포용 빌드:**

```bash
dotnet publish -c Release -o ./publish
```

### Frontend 빌드

```bash
cd frontend
npm run build
```

빌드된 파일은 `frontend/dist` 폴더에 생성됩니다.

## ✅ 연결 확인

### MongoDB 연결 확인

Backend 실행 시 다음 로그를 확인:

```
✅ MongoDB 연결 성공
```

연결 실패 시:

```
⚠️ MongoDB 연결 실패 - 서비스는 시작되지만 데이터베이스 작업이 실패할 수 있습니다.
```

### API 테스트

Swagger UI에서 API를 테스트하거나 curl 명령어를 사용:

```bash
# 폼 목록 조회
curl http://localhost:15025/api/forms

# 새 폼 생성
curl -X POST http://localhost:15025/api/forms \
  -H "Content-Type: application/json" \
  -d '{"title":"테스트 폼","description":"설명"}'
```

## 🔍 문제 해결

### Backend 실행 오류

**MongoDB 연결 실패:**

-   `.env` 파일의 연결 문자열 확인
-   MongoDB 서버 실행 상태 확인
-   방화벽/네트워크 설정 확인

**포트 충돌:**

-   `launchSettings.json`에서 포트 번호 변경
-   다른 프로세스가 15025 또는 7057 포트를 사용하는지 확인

### Frontend 실행 오류

**의존성 설치 오류:**

```bash
npm install --legacy-peer-deps --force
```

**CORS 오류:**

-   Backend의 `Program.cs`에서 CORS 설정 확인
-   Frontend의 API 호스트 주소 확인

**빌드 오류:**

```bash
# 캐시 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## 📝 추가 정보

### 포트 설정

-   **Backend (HTTP)**: 15025
-   **Backend (HTTPS)**: 7057
-   **Frontend**: 5173 (Vite 기본값)

### 환경 변수

Backend는 다음 순서로 설정을 로드합니다:

1. `.env` 파일
2. `appsettings.json`
3. `appsettings.Development.json`
4. 환경 변수

## 🎯 개발 워크플로우

1. Backend 실행 (터미널 1)
2. Frontend 실행 (터미널 2)
3. 브라우저에서 `http://localhost:5173` 접속
4. 코드 수정 시 자동 리로드됨 (Hot Reload)
5. API 확인은 Swagger UI 사용

## 📚 참고

-   [ASP.NET Core 문서](https://docs.microsoft.com/aspnet/core)
-   [React 문서](https://react.dev)
-   [Vite 문서](https://vitejs.dev)
-   [MongoDB Driver 문서](https://mongodb.github.io/mongo-csharp-driver)
