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

    public Task<Form?> UpdateAsync(Form form, CancellationToken cancellationToken = default)
    {
        var existing = _forms.FirstOrDefault(f => f.Id == form.Id);

        if (existing is null)
            return Task.FromResult<Form?>(null);

        form.UpdatedAtUtc = DateTime.UtcNow;

        var index = _forms.IndexOf(existing);
        _forms[index] = form;

        return Task.FromResult<Form?>(form);
    }

    public Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var form = _forms.FirstOrDefault(f => f.Id == id);

        if (form is null)
            return Task.FromResult(false);

        _forms.Remove(form);
        return Task.FromResult(true);
    }
}


