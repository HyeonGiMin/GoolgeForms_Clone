using GoogleFormsClone.Api.Dtos;
using GoogleFormsClone.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GoogleFormsClone.Api.Controllers;

[ApiController]
[Route("api/forms")]
public class FormResponsesController : ControllerBase
{
    private readonly IFormResponseService _responseService;
    private readonly ILogger<FormResponsesController> _logger;

    public FormResponsesController(
        IFormResponseService responseService,
        ILogger<FormResponsesController> logger)
    {
        _responseService = responseService;
        _logger = logger;
    }

    /// <summary>
    /// 특정 폼에 대한 응답 제출
    /// </summary>
    [HttpPost("{id:guid}/responses")]
    public async Task<ActionResult<FormResponseDto>> SubmitResponse(
        Guid id,
        CreateFormResponseRequest request)
    {
        try
        {
            var response = await _responseService.SubmitResponseAsync(id.ToString(), request);
            return CreatedAtAction(nameof(GetResponse), new { formId = id, responseId = response.Id }, response);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"응답 제출 실패: {ex.Message}");
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "응답 제출 중 오류 발생");
            return StatusCode(500, new { message = "응답 제출 중 오류가 발생했습니다." });
        }
    }

    /// <summary>
    /// 특정 폼의 모든 응답 조회
    /// </summary>
    [HttpGet("{id:guid}/responses")]
    public async Task<ActionResult<List<FormResponseDto>>> GetResponses(Guid id)
    {
        try
        {
            var responses = await _responseService.GetResponsesAsync(id.ToString());
            return Ok(responses);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "응답 조회 중 오류 발생");
            return StatusCode(500, new { message = "응답 조회 중 오류가 발생했습니다." });
        }
    }

    /// <summary>
    /// 특정 응답 조회
    /// </summary>
    [HttpGet("{formId:guid}/responses/{responseId}")]
    public async Task<ActionResult<FormResponseDto>> GetResponse(Guid formId, string responseId)
    {
        try
        {
            var response = await _responseService.GetResponseAsync(responseId);
            if (response == null)
                return NotFound();
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "응답 조회 중 오류 발생");
            return StatusCode(500, new { message = "응답 조회 중 오류가 발생했습니다." });
        }
    }

    /// <summary>
    /// 특정 폼의 응답 통계 조회
    /// </summary>
    [HttpGet("{id:guid}/statistics")]
    public async Task<ActionResult<List<QuestionStatisticsDto>>> GetStatistics(Guid id)
    {
        try
        {
            var statistics = await _responseService.GetStatisticsAsync(id.ToString());
            return Ok(statistics);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"통계 조회 실패: {ex.Message}");
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "통계 조회 중 오류 발생");
            return StatusCode(500, new { message = "통계 조회 중 오류가 발생했습니다." });
        }
    }

    /// <summary>
    /// 특정 응답 삭제
    /// </summary>
    [HttpDelete("{formId:guid}/responses/{responseId}")]
    public async Task<IActionResult> DeleteResponse(Guid formId, string responseId)
    {
        try
        {
            await _responseService.DeleteResponseAsync(responseId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "응답 삭제 중 오류 발생");
            return StatusCode(500, new { message = "응답 삭제 중 오류가 발생했습니다." });
        }
    }
}
