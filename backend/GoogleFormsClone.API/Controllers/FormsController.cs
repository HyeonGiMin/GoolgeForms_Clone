using GoogleFormsClone.API.Models;
using GoogleFormsClone.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace GoogleFormsClone.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FormsController : ControllerBase
{
    private readonly FormsService _formsService;

    public FormsController(FormsService formsService)
    {
        _formsService = formsService;
    }

    [HttpGet]
    public async Task<List<Form>> Get() =>
        await _formsService.GetAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Form>> Get(string id)
    {
        var form = await _formsService.GetAsync(id);

        if (form is null)
        {
            return NotFound();
        }

        return form;
    }

    [HttpPost]
    public async Task<IActionResult> Post(Form newForm)
    {
        await _formsService.CreateAsync(newForm);

        return CreatedAtAction(nameof(Get), new { id = newForm.Id }, newForm);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, Form updatedForm)
    {
        var form = await _formsService.GetAsync(id);

        if (form is null)
        {
            return NotFound();
        }

        updatedForm.Id = form.Id;

        await _formsService.UpdateAsync(id, updatedForm);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var form = await _formsService.GetAsync(id);

        if (form is null)
        {
            return NotFound();
        }

        await _formsService.RemoveAsync(id);

        return NoContent();
    }
}
