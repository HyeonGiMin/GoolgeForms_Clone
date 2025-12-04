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
            .Select(f => new FormSummaryDto(f.Id, f.Title, f.Description, f.CreatedAtUtc))
            .ToList();
    }

    public async Task<FormSummaryDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var form = await _formRepository.GetByIdAsync(id, cancellationToken);

        return form is null
            ? null
            : new FormSummaryDto(form.Id, form.Title, form.Description, form.CreatedAtUtc);
    }

    public async Task<FormSummaryDto> CreateAsync(CreateFormRequestDto request, CancellationToken cancellationToken = default)
    {
        var form = new Form
        {
            Title = request.Title,
            Description = request.Description,
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

        return new FormSummaryDto(saved.Id, saved.Title, saved.Description, saved.CreatedAtUtc);
    }
}


