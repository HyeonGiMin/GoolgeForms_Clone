# Answer 값을 통계로 표시하는 방식 상세 설명

## 🎯 핵심 개념

**Answer 필드**는 질문 타입에 따라 다르게 동작합니다:

```
┌─────────────────────────────────────────────────────────────┐
│                    질문 타입별 데이터 저장 방식                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 콤보박스/체크박스/드롭다운 (선택지 있는 문제)                  │
│ ─────────────────────────────────────────────────────────   │
│   answer: ""  (빈 문자열 - 사용 안 함)                       │
│   selectedOptions: ["매우 만족", "친절함"]                   │
│   → 이 값들을 카운트해서 통계 계산!                           │
│                                                               │
│ 단답형/장문형 (자유 입력)                                     │
│ ──────────────────────────────────────                        │
│   answer: "UI가 좋아요"  (실제 입력 값)                      │
│   selectedOptions: []  (빈 배열 - 사용 안 함)                │
│   → 모든 answer들을 리스트로 표시!                            │
│                                                               │
│ 날짜/시간                                                     │
│ ──────────────────────────────────────                        │
│   answer: "2024-12-07" 또는 "14:30"                         │
│   selectedOptions: []                                        │
│   → 모든 answer들을 리스트로 표시!                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 구체적인 예시

### 예시 데이터: 설문 응답 2건

#### FormResponses 컬렉션에 저장된 데이터

```javascript
// 응답 1번
{
  "_id": "response-001",
  "formId": "form-123",
  "createdAt": "2024-12-07T10:00:00Z",
  "answers": [
    {
      "questionId": "q1",
      "questionTitle": "서비스 품질은?",
      "questionType": "MULTIPLE_CHOICE",
      "answer": "",                          // ← 비어있음
      "selectedOptions": ["매우 만족"]       // ← 여기에 실제 값
    },
    {
      "questionId": "q2",
      "questionTitle": "개선할 점은?",
      "questionType": "LONG_TEXT",
      "answer": "UI가 더 직관적이면 좋겠어요",  // ← 여기에 실제 값
      "selectedOptions": []                  // ← 비어있음
    }
  ]
}

// 응답 2번
{
  "_id": "response-002",
  "formId": "form-123",
  "createdAt": "2024-12-07T10:15:00Z",
  "answers": [
    {
      "questionId": "q1",
      "questionTitle": "서비스 품질은?",
      "questionType": "MULTIPLE_CHOICE",
      "answer": "",
      "selectedOptions": ["만족"]            // ← 다른 옵션 선택
    },
    {
      "questionId": "q2",
      "questionTitle": "개선할 점은?",
      "questionType": "LONG_TEXT",
      "answer": "로딩 속도가 느려요",
      "selectedOptions": []
    }
  ]
}
```

---

## 🔧 백엔드에서 통계 계산 과정

### 단계 1: 폼과 응답 데이터 조합

```
FormResponseService.GetStatisticsAsync(formId) 호출
    ↓
Forms 컬렉션에서 폼 조회
    ├─ 질문 1: "서비스 품질은?" (MULTIPLE_CHOICE)
    │  선택지: ["매우 만족", "만족", "보통", "불만족"]
    │
    └─ 질문 2: "개선할 점은?" (LONG_TEXT)
       선택지: 없음 (자유 입력)
    ↓
FormResponses 컬렉션에서 모든 응답 조회
    ├─ 응답 1: q1→["매우 만족"], q2→"UI가 더..."
    └─ 응답 2: q1→["만족"], q2→"로딩 속도가..."
```

### 단계 2: 질문별로 통계 계산

#### 질문 1 (콤보박스) - selectedOptions 사용

```csharp
// GetOptionStatistics() 메서드 실행
var optionCounts = new Dictionary<string, int>();

// 응답 1: selectedOptions = ["매우 만족"]
optionCounts["매우 만족"] = 1;

// 응답 2: selectedOptions = ["만족"]
optionCounts["만족"] = 1;

// 결과:
// {
//   "매우 만족": 1 (50%),
//   "만족": 1 (50%),
//   "보통": 0 (0%),
//   "불만족": 0 (0%)
// }
```

**코드:**

```csharp
private List<OptionStatisticsDto> GetOptionStatistics(
    Question question,
    List<ResponseAnswer> answers)
{
    var optionCounts = new Dictionary<string, int>();
    var totalCount = 0;

    // 1️⃣ 각 응답에서 selectedOptions 추출
    foreach (var answer in answers)
    {
        if (answer.SelectedOptions.Count > 0)
        {
            // 2️⃣ 선택된 각 옵션 카운트
            foreach (var option in answer.SelectedOptions)
            {
                if (!optionCounts.ContainsKey(option))
                    optionCounts[option] = 0;
                optionCounts[option]++;
                totalCount++;
            }
        }
    }

    // 3️⃣ 백분율 계산
    return question.Options.Select(o =>
    {
        var count = optionCounts.TryGetValue(o.Label, out var c) ? c : 0;
        var percentage = totalCount > 0
            ? (count * 100.0) / totalCount
            : 0;

        return new OptionStatisticsDto(
            OptionLabel: o.Label,
            Count: count,
            Percentage: percentage
        );
    }).ToList();
}
```

#### 질문 2 (장문형) - answer 사용

```csharp
// GetTextAnswers() 메서드 실행
var textAnswers = new List<string>();

// 응답 1: answer = "UI가 더 직관적이면 좋겠어요"
textAnswers.Add("UI가 더 직관적이면 좋겠어요");

// 응답 2: answer = "로딩 속도가 느려요"
textAnswers.Add("로딩 속도가 느려요");

// 결과:
// [
//   "UI가 더 직관적이면 좋겠어요",
//   "로딩 속도가 느려요"
// ]
```

**코드:**

```csharp
private List<string> GetTextAnswers(
    Question question,
    List<ResponseAnswer> answers)
{
    // 1️⃣ 질문이 자유 입력형(단답, 장문, 날짜, 시간)인지 확인
    if (IsOptionType(question.Type))
        return null;  // 선택지형은 null 반환

    // 2️⃣ answer 필드에서 값 추출
    return answers
        .Where(a => !string.IsNullOrEmpty(a.Answer))
        .Select(a => a.Answer)  // ← answer 값 수집
        .ToList();
}
```

---

## 📱 프론트엔드에서 표시

### 질문 1 통계 (선택지형)

**백엔드에서 받은 데이터:**

```json
{
    "questionId": "q1",
    "questionTitle": "서비스 품질은?",
    "questionType": "MULTIPLE_CHOICE",
    "responseCount": 2,
    "optionStatistics": [
        { "optionLabel": "매우 만족", "count": 1, "percentage": 50.0 },
        { "optionLabel": "만족", "count": 1, "percentage": 50.0 },
        { "optionLabel": "보통", "count": 0, "percentage": 0.0 },
        { "optionLabel": "불만족", "count": 0, "percentage": 0.0 }
    ]
}
```

**프론트엔드 표시 (StatisticsChart.tsx):**

```
매우 만족 │████████████░ 50% (1명)
만족     │████████████░ 50% (1명)
보통     │░░░░░░░░░░░░░  0% (0명)
불만족   │░░░░░░░░░░░░░  0% (0명)
```

### 질문 2 통계 (자유입력형)

**백엔드에서 받은 데이터:**

```json
{
    "questionId": "q2",
    "questionTitle": "개선할 점은?",
    "questionType": "LONG_TEXT",
    "responseCount": 2,
    "textAnswers": ["UI가 더 직관적이면 좋겠어요", "로딩 속도가 느려요"]
}
```

**프론트엔드 표시:**

```
응답 (2건):
✓ UI가 더 직관적이면 좋겠어요
✓ 로딩 속도가 느려요
```

---

## ✅ Form 데이터와의 관계

**답변 통계는 두 곳의 데이터를 결합합니다:**

```
┌─────────────────────────────────────────────────────────┐
│                   데이터 결합 프로세스                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Forms 컬렉션 (템플릿)                                   │
│  ────────────────────────────────────────────────      │
│  {                                                      │
│    questions: [                                         │
│      {                                                  │
│        id: "q1",                                        │
│        title: "서비스 품질은?",                         │
│        type: "MULTIPLE_CHOICE",                         │
│        options: [                                       │
│          { label: "매우 만족" },    ← 선택지 목록      │
│          { label: "만족" },                             │
│          ...                                            │
│        ]                                                │
│      }                                                  │
│    ]                                                    │
│  }                                                      │
│              ↓ JOIN                                     │
│  FormResponses 컬렉션 (응답)                            │
│  ──────────────────────────────────────────────────   │
│  {                                                      │
│    answers: [                                           │
│      {                                                  │
│        questionId: "q1",                                │
│        selectedOptions: ["만족"]    ← 실제 선택        │
│      }                                                  │
│    ]                                                    │
│  }                                                      │
│              ↓ AGGREGATE                                │
│  최종 통계                                              │
│  ──────────────────────────────────────────────────   │
│  {                                                      │
│    optionStatistics: [                                  │
│      {                                                  │
│        optionLabel: "매우 만족",  ← Form의 선택지명     │
│        count: 0,                  ← 응답 카운트        │
│        percentage: 0.0            ← 계산된 백분율      │
│      },                                                 │
│      {                                                  │
│        optionLabel: "만족",                             │
│        count: 1,                                        │
│        percentage: 50.0                                 │
│      },                                                 │
│      ...                                                │
│    ]                                                    │
│  }                                                      │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 요약

| 항목                    | 설명                                                                                                                    |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Form 데이터**         | 설문 템플릿 (질문 제목, 질문 타입, **선택지 목록**)                                                                     |
| **FormResponse 데이터** | 사용자 응답 (**answer** 또는 **selectedOptions**)                                                                       |
| **통계 계산**           | Form의 선택지 목록과 FormResponse의 응답을 결합하여 각 선택지별 카운트 계산                                             |
| **Answer 활용**         | 선택지형(콤보박스, 체크박스, 드롭다운)→ selectedOptions 카운트<br>자유입력형(단답, 장문)→ answer 값 수집 및 리스트 표시 |
| **최종 표시**           | 선택지형→ 백분율 막대그래프<br>자유입력형→ 텍스트 리스트                                                                |

---

## 💡 알고리즘 의사코드

```
GetStatistics(formId):
    form = Forms.findOne(id: formId)
    responses = FormResponses.find(formId: formId)

    statistics = []

    FOR EACH question IN form.questions:
        questionAnswers = responses에서 해당 question의 답변들 수집

        IF question.type IN [MULTIPLE_CHOICE, CHECKBOXES, DROPDOWN]:
            # ✅ 선택지형 → selectedOptions 사용
            optionCounts = {}
            FOR EACH answer IN questionAnswers:
                FOR EACH option IN answer.selectedOptions:
                    optionCounts[option] += 1

            optionStatistics = []
            FOR EACH option IN question.options:
                count = optionCounts.get(option.label, 0)
                percentage = (count / totalResponses) * 100
                optionStatistics.append({
                    optionLabel: option.label,
                    count: count,
                    percentage: percentage
                })

            statistics.append({
                questionId: question.id,
                questionTitle: question.title,
                optionStatistics: optionStatistics
            })

        ELSE:
            # ✅ 자유입력형 → answer 사용
            textAnswers = []
            FOR EACH answer IN questionAnswers:
                IF answer.answer IS NOT EMPTY:
                    textAnswers.append(answer.answer)

            statistics.append({
                questionId: question.id,
                questionTitle: question.title,
                textAnswers: textAnswers
            })

    RETURN statistics
```

이렇게 **Form의 구조(선택지 목록)**와 **FormResponse의 응답 데이터(answer, selectedOptions)**를 결합하여 통계를 표시합니다!
