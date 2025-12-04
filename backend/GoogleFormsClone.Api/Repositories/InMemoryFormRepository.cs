// InMemoryFormRepository.cs - 개발 초기용 인메모리 구현체
using GoogleFormsClone.Api.Domain;

namespace GoogleFormsClone.Api.Repositories;

public class InMemoryFormRepository : IFormRepository
{
    private readonly List<Form> _forms = new();

    public Task<IReadOnlyList<Form>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        IReadOnlyList<Form> result = _forms
            .OrderByDescending(f => f.CreatedAtUtc)
            .ToList();

        return Task.FromResult(result);
    }

    public Task<Form?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var form = _forms.FirstOrDefault(f => f.Id == id);
        return Task.FromResult(form);
    }

    public Task<Form> AddAsync(Form form, CancellationToken cancellationToken = default)
    {
        _forms.Add(form);
        return Task.FromResult(form);
    }
}


