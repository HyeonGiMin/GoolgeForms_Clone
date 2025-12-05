namespace GoogleFormsClone.Api.Dtos;

/// <summary>
/// 응답 생성 요청 DTO
/// </summary>
public record CreateFormResponseRequest(
    List<SubmitAnswerDto> Answers
);

/// <summary>
/// 응답 제출 시 각 질문의 답변
/// </summary>
public record SubmitAnswerDto(
    string QuestionId,
    string? Answer = null,
    List<string>? SelectedOptions = null
);

/// <summary>
/// 응답 조회 DTO
/// </summary>
public record FormResponseDto(
    string Id,
    string FormId,
    DateTime CreatedAt,
    List<ResponseAnswerDto> Answers
);

/// <summary>
/// 응답 내 각 질문의 답변 조회 DTO
/// </summary>
public record ResponseAnswerDto(
    string QuestionId,
    string QuestionTitle,
    string QuestionType,
    string Answer,
    List<string> SelectedOptions
);

/// <summary>
/// 응답 통계 데이터 (객관식 등의 경우)
/// </summary>
public record OptionStatisticsDto(
    string OptionLabel,
    int Count,
    double Percentage
);

/// <summary>
/// 질문별 응답 통계
/// </summary>
public record QuestionStatisticsDto(
    string QuestionId,
    string QuestionTitle,
    string QuestionType,
    int ResponseCount,
    List<OptionStatisticsDto>? OptionStatistics = null,
    List<string>? TextAnswers = null
);
