using GoogleFormsClone.Api.Domain;

namespace GoogleFormsClone.Api.Repositories;

public interface IFormResponseRepository
{
    Task<FormResponse> CreateAsync(FormResponse response);
    Task<List<FormResponse>> GetByFormIdAsync(string formId);
    Task<FormResponse?> GetByIdAsync(string id);
    Task<int> GetResponseCountAsync(string formId);
    Task DeleteAsync(string id);
    Task DeleteByFormIdAsync(string formId);
}
