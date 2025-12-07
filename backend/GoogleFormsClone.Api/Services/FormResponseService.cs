using GoogleFormsClone.Api.Domain;
using GoogleFormsClone.Api.Dtos;
using GoogleFormsClone.Api.Repositories;

namespace GoogleFormsClone.Api.Services;

public interface IFormResponseService
{
    Task<FormResponseDto> SubmitResponseAsync(string formId, CreateFormResponseRequest request);
    Task<List<FormResponseDto>> GetResponsesAsync(string formId);
    Task<FormResponseDto?> GetResponseAsync(string id);
    Task<List<QuestionStatisticsDto>> GetStatisticsAsync(string formId);
    Task DeleteResponseAsync(string id);
    Task DeleteFormResponsesAsync(string formId);
}

public class FormResponseService : IFormResponseService
{
    private readonly IFormResponseRepository _responseRepository;
    private readonly IFormRepository _formRepository;

    public FormResponseService(
        IFormResponseRepository responseRepository,
        IFormRepository formRepository)
    {
        _responseRepository = responseRepository;
        _formRepository = formRepository;
    }

    public async Task<FormResponseDto> SubmitResponseAsync(string formId, CreateFormResponseRequest request)
    {
        // 폼 존재 확인
        var form = await _formRepository.GetByIdAsync(Guid.Parse(formId));
        if (form == null)
            throw new InvalidOperationException("Form not found");

        var response = new FormResponse
        {
            Id = Guid.NewGuid().ToString(),
            FormId = formId,
            CreatedAt = DateTime.UtcNow,
            Answers = request.Answers.Select(a =>
            {
                var question = form.Questions.FirstOrDefault(q => q.Id.ToString() == a.QuestionId);
                return new ResponseAnswer
                {
                    QuestionId = a.QuestionId,
                    QuestionTitle = question?.Title ?? "Unknown Question",
                    QuestionType = question?.Type.ToString() ?? "UNKNOWN",
                    Answer = a.Answer ?? string.Empty,
                    SelectedOptions = a.SelectedOptions ?? new List<string>()
                };
            }).ToList()
        };

        var created = await _responseRepository.CreateAsync(response);
        return MapToDto(created);
    }

    public async Task<List<FormResponseDto>> GetResponsesAsync(string formId)
    {
        var responses = await _responseRepository.GetByFormIdAsync(formId);
        return responses.Select(MapToDto).ToList();
    }

    public async Task<FormResponseDto?> GetResponseAsync(string id)
    {
        var response = await _responseRepository.GetByIdAsync(id);
        return response == null ? null : MapToDto(response);
    }

    public async Task<List<QuestionStatisticsDto>> GetStatisticsAsync(string formId)
    {
        var form = await _formRepository.GetByIdAsync(Guid.Parse(formId));
        if (form == null)
            throw new InvalidOperationException("Form not found");

        var responses = await _responseRepository.GetByFormIdAsync(formId);

        var statistics = new List<QuestionStatisticsDto>();

        foreach (var question in form.Questions)
        {
            var questionResponses = responses
                .SelectMany(r => r.Answers)
                .Where(a => a.QuestionId == question.Id.ToString())
                .ToList();

            var stat = new QuestionStatisticsDto(
                QuestionId: question.Id.ToString(),
                QuestionTitle: question.Title,
                QuestionType: question.Type.ToString(),
                ResponseCount: responses.Count,
                OptionStatistics: GetOptionStatistics(question, questionResponses),
                TextAnswers: GetTextAnswers(question, questionResponses)
            );

            statistics.Add(stat);
        }

        return statistics;
    }

    public async Task DeleteResponseAsync(string id)
    {
        await _responseRepository.DeleteAsync(id);
    }

    public async Task DeleteFormResponsesAsync(string formId)
    {
        await _responseRepository.DeleteByFormIdAsync(formId);
    }

    private FormResponseDto MapToDto(FormResponse response)
    {
        return new FormResponseDto(
            Id: response.Id,
            FormId: response.FormId,
            CreatedAt: response.CreatedAt,
            Answers: response.Answers.Select(a => new ResponseAnswerDto(
                QuestionId: a.QuestionId,
                QuestionTitle: a.QuestionTitle,
                QuestionType: a.QuestionType,
                Answer: a.Answer,
                SelectedOptions: a.SelectedOptions
            )).ToList()
        );
    }

    private List<OptionStatisticsDto>? GetOptionStatistics(Question question, List<ResponseAnswer> answers)
    {
        if (!IsOptionType(question.Type))
            return null;

        var optionCounts = new Dictionary<string, int>();
        var totalCount = 0;

        foreach (var answer in answers)
        {
            if (answer.SelectedOptions.Count > 0)
            {
                foreach (var option in answer.SelectedOptions)
                {
                    if (!optionCounts.ContainsKey(option))
                        optionCounts[option] = 0;
                    optionCounts[option]++;
                    totalCount++;
                }
            }
        }

        if (totalCount == 0)
            return question.Options.Select(o => new OptionStatisticsDto(
                OptionLabel: o.Label,
                Count: 0,
                Percentage: 0
            )).ToList();

        return question.Options.Select(o =>
        {
            var count = optionCounts.TryGetValue(o.Label, out var c) ? c : 0;
            var percentage = totalCount > 0 ? (count * 100.0) / totalCount : 0;
            return new OptionStatisticsDto(
                OptionLabel: o.Label,
                Count: count,
                Percentage: percentage
            );
        }).ToList();
    }

    private List<string>? GetTextAnswers(Question question, List<ResponseAnswer> answers)
    {
        if (IsOptionType(question.Type))
            return null;

        return answers
            .Where(a => !string.IsNullOrEmpty(a.Answer))
            .Select(a => a.Answer)
            .ToList();
    }

    private bool IsOptionType(QuestionType type)
    {
        return type == QuestionType.SINGLE_CHOICE ||
               type == QuestionType.MULTIPLE_CHOICE ||
               type == QuestionType.CHECKBOXES ||
               type == QuestionType.DROPDOWN;
    }
}
