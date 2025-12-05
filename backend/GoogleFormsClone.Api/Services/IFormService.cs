// IFormService.cs - 설문 폼 비즈니스 로직 인터페이스
using GoogleFormsClone.Api.Dtos;

namespace GoogleFormsClone.Api.Services;

public interface IFormService
{
    Task<IReadOnlyList<FormSummaryDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<FormDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<FormSummaryDto> CreateAsync(CreateFormRequestDto request, CancellationToken cancellationToken = default);
    Task<FormDetailDto?> UpdateAsync(Guid id, UpdateFormRequestDto request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}


