// Question.cs - 설문 폼 내 질문 및 옵션 도메인 엔티티
namespace GoogleFormsClone.Api.Domain;

public enum QuestionType
{
    SHORT_TEXT,
    LONG_TEXT,
    SINGLE_CHOICE,
    MULTIPLE_CHOICE,
    CHECKBOXES,
    DROPDOWN,
    DATE,
    TIME
}

public class Question
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string Title { get; set; } = string.Empty;

    public QuestionType Type { get; set; } = QuestionType.SHORT_TEXT;

    public bool Required { get; set; }

    public List<QuestionOption> Options { get; set; } = [];
}

public class QuestionOption
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string Label { get; set; } = string.Empty;
}


