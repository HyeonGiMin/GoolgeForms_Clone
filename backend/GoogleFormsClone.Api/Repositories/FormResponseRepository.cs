using GoogleFormsClone.Api.Domain;
using GoogleFormsClone.Api.Persistence;
using MongoDB.Driver;

namespace GoogleFormsClone.Api.Repositories;

public class MongoFormResponseRepository : IFormResponseRepository
{
    private readonly IMongoCollection<FormResponse> _responsesCollection;

    public MongoFormResponseRepository(MongoDbContext context)
    {
        _responsesCollection = context.GetCollection<FormResponse>("responses");
    }

    public async Task<FormResponse> CreateAsync(FormResponse response)
    {
        await _responsesCollection.InsertOneAsync(response);
        return response;
    }

    public async Task<List<FormResponse>> GetByFormIdAsync(string formId)
    {
        return await _responsesCollection
            .Find(r => r.FormId == formId)
            .SortByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<FormResponse?> GetByIdAsync(string id)
    {
        return await _responsesCollection
            .Find(r => r.Id == id)
            .FirstOrDefaultAsync();
    }

    public async Task<int> GetResponseCountAsync(string formId)
    {
        return (int)await _responsesCollection
            .CountDocumentsAsync(r => r.FormId == formId);
    }

    public async Task DeleteAsync(string id)
    {
        await _responsesCollection.DeleteOneAsync(r => r.Id == id);
    }

    public async Task DeleteByFormIdAsync(string formId)
    {
        await _responsesCollection.DeleteManyAsync(r => r.FormId == formId);
    }
}

public class InMemoryFormResponseRepository : IFormResponseRepository
{
    private readonly List<FormResponse> _responses = new();

    public Task<FormResponse> CreateAsync(FormResponse response)
    {
        _responses.Add(response);
        return Task.FromResult(response);
    }

    public Task<List<FormResponse>> GetByFormIdAsync(string formId)
    {
        var results = _responses
            .Where(r => r.FormId == formId)
            .OrderByDescending(r => r.CreatedAt)
            .ToList();
        return Task.FromResult(results);
    }

    public Task<FormResponse?> GetByIdAsync(string id)
    {
        var response = _responses.FirstOrDefault(r => r.Id == id);
        return Task.FromResult(response);
    }

    public Task<int> GetResponseCountAsync(string formId)
    {
        var count = _responses.Count(r => r.FormId == formId);
        return Task.FromResult(count);
    }

    public Task DeleteAsync(string id)
    {
        _responses.RemoveAll(r => r.Id == id);
        return Task.CompletedTask;
    }

    public Task DeleteByFormIdAsync(string formId)
    {
        _responses.RemoveAll(r => r.FormId == formId);
        return Task.CompletedTask;
    }
}
