using GoogleFormsClone.API.Configuration;
using GoogleFormsClone.API.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace GoogleFormsClone.API.Services;

public class ResponsesService
{
    private readonly IMongoCollection<FormResponse> _responsesCollection;

    public ResponsesService(IOptions<MongoDbSettings> mongoDbSettings)
    {
        var mongoClient = new MongoClient(mongoDbSettings.Value.ConnectionString);
        var mongoDatabase = mongoClient.GetDatabase(mongoDbSettings.Value.DatabaseName);
        _responsesCollection = mongoDatabase.GetCollection<FormResponse>(mongoDbSettings.Value.ResponsesCollectionName);
    }

    public async Task<List<FormResponse>> GetAsync() =>
        await _responsesCollection.Find(_ => true).ToListAsync();

    public async Task<FormResponse?> GetAsync(string id) =>
        await _responsesCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task<List<FormResponse>> GetByFormIdAsync(string formId) =>
        await _responsesCollection.Find(x => x.FormId == formId).ToListAsync();

    public async Task CreateAsync(FormResponse newResponse) =>
        await _responsesCollection.InsertOneAsync(newResponse);

    public async Task RemoveAsync(string id) =>
        await _responsesCollection.DeleteOneAsync(x => x.Id == id);
}
