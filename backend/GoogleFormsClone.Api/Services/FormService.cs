// FormService.cs - 설문 폼 관련 비즈니스 로직 구현
using GoogleFormsClone.Api.Domain;
using GoogleFormsClone.Api.Dtos;
using GoogleFormsClone.Api.Repositories;

namespace GoogleFormsClone.Api.Services;

public class FormService(IFormRepository formRepository) : IFormService
{
    private readonly IFormRepository _formRepository = formRepository;

    public async Task<IReadOnlyList<FormSummaryDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var forms = await _formRepository.GetAllAsync(cancellationToken);

        return forms
            .Select(f => new FormSummaryDto(f.Id.ToString(), f.Title, f.Description, f.CreatedAtUtc))
            .ToList();
    }

    public async Task<FormDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var form = await _formRepository.GetByIdAsync(id, cancellationToken);

        if (form is null)
            return null;

        var questionDtos = form.Questions
            .Select(q => new QuestionDto(
                q.Id,
                q.Title,
                q.Type.ToString(),
                q.Required,
                q.Options
                    .Select(o => new QuestionOptionDto(o.Id, o.Label))
                    .ToList()
            ))
            .ToList();

        return new FormDetailDto(
            form.Id.ToString(),
            form.Title,
            form.Description,
            form.ConfirmationMessage,
            form.ShowProgressBar,
            form.CreatedAtUtc,
            form.UpdatedAtUtc,
            questionDtos,
            form.AlertKeywords
        );
    }

    public async Task<FormSummaryDto> CreateAsync(CreateFormRequestDto request, CancellationToken cancellationToken = default)
    {
        var form = new Form
        {
            Title = request.Title,
            Description = request.Description,
            AlertKeywords = request.AlertKeywords?.ToList() ?? [],
            Questions = request.Questions
                .Select(q => new Question
                {
                    Title = q.Title,
                    Type = Enum.TryParse<QuestionType>(q.Type, ignoreCase: true, out var parsedType)
                        ? parsedType
                        : QuestionType.SHORT_TEXT,
                    Required = q.Required,
                    Options = q.Options
                        .Select(label => new QuestionOption { Label = label })
                        .ToList()
                })
                .ToList()
        };

        var saved = await _formRepository.AddAsync(form, cancellationToken);

        return new FormSummaryDto(saved.Id.ToString(), saved.Title, saved.Description, saved.CreatedAtUtc);
    }

    public async Task<FormDetailDto?> UpdateAsync(Guid id, UpdateFormRequestDto request, CancellationToken cancellationToken = default)
    {
        var existing = await _formRepository.GetByIdAsync(id, cancellationToken);

        if (existing is null)
            return null;

        // 기존 폼 업데이트
        existing.Title = request.Title;
        existing.Description = request.Description;
        existing.ConfirmationMessage = request.ConfirmationMessage;
        existing.ShowProgressBar = request.ShowProgressBar;
        existing.AlertKeywords = request.AlertKeywords?.ToList() ?? [];
        existing.Questions = request.Questions
            .Select(q => new Question
            {
                Title = q.Title,
                Type = Enum.TryParse<QuestionType>(q.Type, ignoreCase: true, out var parsedType)
                    ? parsedType
                    : QuestionType.SHORT_TEXT,
                Required = q.Required,
                Options = q.Options
                    .Select(label => new QuestionOption { Label = label })
                    .ToList()
            })
            .ToList();

        var updated = await _formRepository.UpdateAsync(existing, cancellationToken);

        if (updated is null)
            return null;

        var questionDtos = updated.Questions
            .Select(q => new QuestionDto(
                q.Id,
                q.Title,
                q.Type.ToString(),
                q.Required,
                q.Options
                    .Select(o => new QuestionOptionDto(o.Id, o.Label))
                    .ToList()
            ))
            .ToList();

        return new FormDetailDto(
            updated.Id.ToString(),
            updated.Title,
            updated.Description,
            updated.ConfirmationMessage,
            updated.ShowProgressBar,
            updated.CreatedAtUtc,
            updated.UpdatedAtUtc,
            questionDtos,
            updated.AlertKeywords
        );
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _formRepository.DeleteAsync(id, cancellationToken);
    }
}


