// IFormRepository.cs - 설문 폼 저장소 인터페이스
using GoogleFormsClone.Api.Domain;

namespace GoogleFormsClone.Api.Repositories;

public interface IFormRepository
{
    Task<IReadOnlyList<Form>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Form?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Form> AddAsync(Form form, CancellationToken cancellationToken = default);
}


