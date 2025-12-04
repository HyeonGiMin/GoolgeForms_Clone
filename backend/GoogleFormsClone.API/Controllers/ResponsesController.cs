using GoogleFormsClone.API.Models;
using GoogleFormsClone.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace GoogleFormsClone.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResponsesController : ControllerBase
{
    private readonly ResponsesService _responsesService;

    public ResponsesController(ResponsesService responsesService)
    {
        _responsesService = responsesService;
    }

    [HttpGet]
    public async Task<List<FormResponse>> Get() =>
        await _responsesService.GetAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<FormResponse>> Get(string id)
    {
        var response = await _responsesService.GetAsync(id);

        if (response is null)
        {
            return NotFound();
        }

        return response;
    }

    [HttpGet("form/{formId}")]
    public async Task<List<FormResponse>> GetByFormId(string formId) =>
        await _responsesService.GetByFormIdAsync(formId);

    [HttpPost]
    public async Task<IActionResult> Post(FormResponse newResponse)
    {
        await _responsesService.CreateAsync(newResponse);

        return CreatedAtAction(nameof(Get), new { id = newResponse.Id }, newResponse);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var response = await _responsesService.GetAsync(id);

        if (response is null)
        {
            return NotFound();
        }

        await _responsesService.RemoveAsync(id);

        return NoContent();
    }
}
