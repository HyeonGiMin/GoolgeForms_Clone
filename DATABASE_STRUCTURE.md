# MongoDB 데이터 구조 및 통계 표시 방식

## 📊 MongoDB 컬렉션 구조

Google Forms Clone 프로젝트는 MongoDB에 **2개의 컬렉션**으로 데이터를 관리합니다.

### 1️⃣ **Forms 컬렉션** (설문 폼 데이터)

```javascript
{
  "_id": "550e8400-e29b-41d4-a716-446655440000",  // Guid (String으로 저장)
  "title": "2024 고객 만족도 설문",
  "description": "고객 만족도를 조사하는 설문입니다.",
  "confirmationMessage": "감사합니다!",
  "showProgressBar": true,
  "createdAtUtc": ISODate("2024-12-07T10:00:00.000Z"),
  "updatedAtUtc": ISODate("2024-12-07T15:30:00.000Z"),
  "questions": [
    {
      "id": "662e8400-e29b-41d4-a716-446655440001",
      "title": "저희 서비스 품질은 어떠셨나요?",
      "type": "MULTIPLE_CHOICE",  // 콤보박스, 단답형, 장문형, 체크박스, 드롭다운, 날짜, 시간
      "required": true,
      "options": [
        { "id": "762e8400-e29b-41d4-a716-446655440001", "label": "매우 만족" },
        { "id": "762e8400-e29b-41d4-a716-446655440002", "label": "만족" },
        { "id": "762e8400-e29b-41d4-a716-446655440003", "label": "보통" },
        { "id": "762e8400-e29b-41d4-a716-446655440004", "label": "불만족" }
      ]
    },
    {
      "id": "662e8400-e29b-41d4-a716-446655440002",
      "title": "개선할 점이 있으면 말씀해주세요",
      "type": "LONG_TEXT",
      "required": false,
      "options": []
    }
  ]
}
```

**Forms 컬렉션 역할:**

-   설문 폼의 메타데이터 저장 (제목, 설명, 확인 메시지)
-   질문 목록과 각 질문의 선택지 정보 저장
-   폼의 생성/수정 시간 기록

---

### 2️⃣ **FormResponses 컬렉션** (응답 데이터)

```javascript
{
  "_id": "750e8400-e29b-41d4-a716-446655440000",  // String (응답 ID)
  "formId": "550e8400-e29b-41d4-a716-446655440000",  // 어느 폼에 대한 응답인지
  "createdAt": ISODate("2024-12-07T10:15:30.000Z"),
  "answers": [
    {
      "questionId": "662e8400-e29b-41d4-a716-446655440001",
      "questionTitle": "저희 서비스 품질은 어떠셨나요?",
      "questionType": "MULTIPLE_CHOICE",
      "answer": "",  // 객관식/체크박스/드롭다운은 빈 문자열
      "selectedOptions": ["만족"]  // 실제 선택한 옵션
    },
    {
      "questionId": "662e8400-e29b-41d4-a716-446655440002",
      "questionTitle": "개선할 점이 있으면 말씀해주세요",
      "questionType": "LONG_TEXT",
      "answer": "UI가 좀 더 직관적으면 좋겠습니다.",  // 주관식은 여기에 저장
      "selectedOptions": []
    }
  ]
}
```

**FormResponses 컬렉션 역할:**

-   사용자가 제출한 각 응답 저장
-   각 응답은 하나의 문서(도큐먼트)로 저장
-   응답 제출 시간 기록

---

## 📈 통계 계산 흐름

### 단계별 통계 계산 프로세스

```
FormResponsesPage (프론트엔드)
    ↓
fetchStatistics(formId) API 호출
    ↓
Backend: FormResponsesController.GetStatistics(formId)
    ↓
FormResponseService.GetStatisticsAsync(formId)
    │
    ├─ 1) Forms 컬렉션에서 설문 데이터 조회
    │     → 설문의 모든 질문 정보 가져오기
    │
    ├─ 2) FormResponses 컬렉션에서 해당 formId의 모든 응답 조회
    │     → 수백/수천 개의 응답 문서 가져오기
    │
    ├─ 3) 각 질문별로 통계 계산
    │     ├─ 질문 1: "서비스 품질"
    │     │    응답들에서 "selectedOptions" 추출
    │     │    "매우 만족": 45건 (45%)
    │     │    "만족": 32건 (32%)
    │     │    "보통": 15건 (15%)
    │     │    "불만족": 8건 (8%)
    │     │
    │     └─ 질문 2: "개선할 점"
    │          응답들에서 "answer" 추출
    │          모든 텍스트 답변을 배열로 수집
    │
    └─ 4) QuestionStatisticsDto 객체로 변환
         → 프론트엔드에 전달
    ↓
Backend → Frontend (JSON 응답)
    ↓
StatisticsChart 컴포넌트에서 시각화
    ├─ 선택지 문제: 가로 막대 차트
    │  ┌─────────────────────────────┐
    │  │ 매우 만족 │████████░ 45%     │
    │  │ 만족     │██████░░ 32%      │
    │  │ 보통     │████░░░░ 15%      │
    │  │ 불만족   │██░░░░░░ 8%       │
    │  └─────────────────────────────┘
    │
    └─ 주관식 문제: 텍스트 답변 목록
       ├─ "UI가 좀 더 직관적이면..."
       ├─ "로딩이 빨랐으면..."
       └─ "디자인이 예쁘네요!"
```

---

## 🔧 통계 계산 코드 (백엔드)

### FormResponseService.cs의 핵심 로직

```csharp
public async Task<List<QuestionStatisticsDto>> GetStatisticsAsync(string formId)
{
    // 1️⃣ Forms 컬렉션에서 폼과 질문 조회
    var form = await _formRepository.GetByIdAsync(Guid.Parse(formId));

    // 2️⃣ FormResponses 컬렉션에서 모든 응답 조회
    var responses = await _responseRepository.GetByFormIdAsync(formId);

    var statistics = new List<QuestionStatisticsDto>();

    // 3️⃣ 각 질문별로 통계 계산
    foreach (var question in form.Questions)
    {
        // 해당 질문에 대한 모든 답변 추출
        var questionResponses = responses
            .SelectMany(r => r.Answers)
            .Where(a => a.QuestionId == question.Id.ToString())
            .ToList();

        // 선택지 타입 문제일 경우 (콤보박스, 체크박스, 드롭다운)
        var optionStats = GetOptionStatistics(question, questionResponses);
        // → 각 선택지별 선택 횟수 및 백분율 계산

        // 주관식 문제일 경우 (단답형, 장문형)
        var textAnswers = GetTextAnswers(question, questionResponses);
        // → 모든 텍스트 답변 수집

        statistics.Add(new QuestionStatisticsDto(
            QuestionId: question.Id.ToString(),
            QuestionTitle: question.Title,
            QuestionType: question.Type.ToString(),
            ResponseCount: responses.Count,  // 총 응답 수
            OptionStatistics: optionStats,   // 선택지별 통계
            TextAnswers: textAnswers         // 텍스트 답변들
        ));
    }

    return statistics;
}
```

### 선택지별 통계 계산 예시

```csharp
private List<OptionStatisticsDto> GetOptionStatistics(
    Question question,
    List<ResponseAnswer> questionResponses)
{
    var optionStats = new List<OptionStatisticsDto>();

    foreach (var option in question.Options)
    {
        // 이 선택지를 선택한 응답 수
        var count = questionResponses
            .Count(a => a.SelectedOptions.Contains(option.Label));

        // 백분율 계산
        var percentage = questionResponses.Count > 0
            ? (double)count / questionResponses.Count * 100
            : 0;

        optionStats.Add(new OptionStatisticsDto(
            OptionId: option.Id.ToString(),
            OptionLabel: option.Label,
            Count: count,
            Percentage: percentage
        ));
    }

    return optionStats;
}
```

---

## 📱 프론트엔드 통계 표시 흐름

### FormResponsesPage.tsx 구조

```tsx
// 1️⃣ 데이터 로드
useEffect(() => {
    const [formData, responsesData, statisticsData] =
        await Promise.all([
            fetchFormById(id),           // 설문 정보
            fetchResponses(id),          // 개별 응답 데이터
            fetchStatistics(id)          // 통계 데이터
        ]);
}, [id]);

// 2️⃣ 3가지 뷰 모드로 표시
- "summary" 모드: 질문별 통계 시각화
  └─ StatisticsChart 컴포넌트로 각 질문의 통계 표시

- "by-question" 모드: 질문별 상세 통계

- "individual" 모드: 개별 응답 조회
  └─ 각 응답자의 상세 답변 표시
```

### StatisticsChart.tsx 시각화

```tsx
// 선택지 문제 (콤보박스, 체크박스, 드롭다운)
<div className="progress" style={{ height: "28px" }}>
    <div
        className="progress-bar bg-primary"
        style={{ width: `${option.percentage}%` }}
    >
        {option.percentage.toFixed(1)}%
    </div>
</div>

// 주관식 문제 (단답형, 장문형)
<ul>
    {textAnswers.map((answer) => (
        <li key={answer}>{answer}</li>
    ))}
</ul>
```

---

## 🔑 주요 개념 정리

| 구분                     | 내용                                                          |
| ------------------------ | ------------------------------------------------------------- |
| **Forms 컬렉션**         | 설문 템플릿 정보 (제목, 질문, 선택지)                         |
| **FormResponses 컬렉션** | 사용자가 제출한 응답 데이터                                   |
| **통계 계산**            | FormResponses 데이터를 수집 후 선택지별 카운트 및 백분율 계산 |
| **시각화**               | 진행률 막대, 텍스트 리스트 등으로 프론트엔드에서 표시         |
| **응답 조회 성능**       | 많은 응답이 있을 경우 MongoDB 인덱싱 권장                     |

---

## 💡 실제 MongoDB 쿼리 예시

### Forms 컬렉션에서 특정 폼 조회

```javascript
db.forms.findOne({ _id: "550e8400-e29b-41d4-a716-446655440000" });
```

### FormResponses 컬렉션에서 특정 폼의 모든 응답 조회

```javascript
db.formResponses.find({ formId: "550e8400-e29b-41d4-a716-446655440000" });
```

### 특정 선택지의 선택 횟수 계산

```javascript
db.formResponses.aggregate([
    { $match: { formId: "550e8400-e29b-41d4-a716-446655440000" } },
    { $unwind: "$answers" },
    {
        $match: {
            "answers.questionId": "662e8400-e29b-41d4-a716-446655440001",
        },
    },
    { $unwind: "$answers.selectedOptions" },
    {
        $group: {
            _id: "$answers.selectedOptions",
            count: { $sum: 1 },
        },
    },
    { $sort: { count: -1 } },
]);
```

이 결과:

```javascript
[
    { _id: "매우 만족", count: 45 },
    { _id: "만족", count: 32 },
    { _id: "보통", count: 15 },
    { _id: "불만족", count: 8 },
];
```

---

## 🚀 성능 최적화 팁

1. **인덱싱**: FormResponses 컬렉션에 `formId` 인덱스 추가

    ```javascript
    db.formResponses.createIndex({ formId: 1 });
    ```

2. **대량 응답 처리**: 응답이 많을 경우 MongoDB의 aggregation pipeline 사용

3. **캐싱**: 통계 데이터를 메모리에 캐싱하여 반복 조회 성능 개선
