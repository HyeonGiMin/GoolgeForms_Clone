namespace GoogleFormsClone.Api.Domain;

/// <summary>
/// 설문 응답 엔티티
/// </summary>
public class FormResponse
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string FormId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<ResponseAnswer> Answers { get; set; } = new();
}

/// <summary>
/// 설문 응답 내 각 질문의 답변
/// </summary>
public class ResponseAnswer
{
    public string QuestionId { get; set; } = string.Empty;
    public string QuestionTitle { get; set; } = string.Empty;
    public string QuestionType { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;

    /// <summary>
    /// 객관식/체크박스/드롭다운인 경우 선택된 옵션들 (쉼표로 구분)
    /// </summary>
    public List<string> SelectedOptions { get; set; } = new();
}
