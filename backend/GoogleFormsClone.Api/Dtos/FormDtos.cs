// FormDtos.cs - 설문 폼 관련 요청/응답 DTO 정의
namespace GoogleFormsClone.Api.Dtos;

public record FormSummaryDto(
    string Id,
    string Title,
    string? Description,
    DateTime CreatedAtUtc
);

public record FormDetailDto(
    string Id,
    string Title,
    string? Description,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    IReadOnlyList<QuestionDto> Questions
);

public record QuestionOptionDto(
    string Id,
    string Label
);

public record QuestionDto(
    string Id,
    string Title,
    string Type,
    bool Required,
    IReadOnlyList<QuestionOptionDto> Options
);

public record CreateQuestionRequestDto(
    string Title,
    string Type,
    bool Required,
    IReadOnlyList<string> Options
);

public record UpdateQuestionRequestDto(
    string Title,
    string Type,
    bool Required,
    IReadOnlyList<string> Options
);

public record CreateFormRequestDto(
    string Title,
    string? Description,
    IReadOnlyList<CreateQuestionRequestDto> Questions
);

public record UpdateFormRequestDto(
    string Title,
    string? Description,
    IReadOnlyList<UpdateQuestionRequestDto> Questions
);

