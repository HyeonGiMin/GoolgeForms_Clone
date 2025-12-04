// FormsController.cs - 설문 폼 조회/생성을 위한 기본 API 컨트롤러
using GoogleFormsClone.Api.Dtos;
using GoogleFormsClone.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GoogleFormsClone.Api.Controllers;

[ApiController]
[Route("api/forms")]
public class FormsController(IFormService formService) : ControllerBase
{
    private readonly IFormService _formService = formService;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<FormSummaryDto>>> GetForms(CancellationToken cancellationToken)
    {
        var forms = await _formService.GetAllAsync(cancellationToken);
        return Ok(forms);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<FormSummaryDto>> GetFormById(Guid id, CancellationToken cancellationToken)
    {
        var form = await _formService.GetByIdAsync(id, cancellationToken);

        if (form is null)
        {
            return NotFound();
        }

        return Ok(form);
    }

    [HttpPost]
    public async Task<ActionResult<FormSummaryDto>> CreateForm([FromBody] CreateFormRequestDto request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            ModelState.AddModelError(nameof(request.Title), "Title은 필수 값입니다.");
            return ValidationProblem(ModelState);
        }

        var created = await _formService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetFormById), new { id = created.Id }, created);
    }
}


