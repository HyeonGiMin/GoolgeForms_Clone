using GoogleFormsClone.API.Configuration;
using GoogleFormsClone.API.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace GoogleFormsClone.API.Services;

public class FormsService
{
    private readonly IMongoCollection<Form> _formsCollection;

    public FormsService(IOptions<MongoDbSettings> mongoDbSettings)
    {
        var mongoClient = new MongoClient(mongoDbSettings.Value.ConnectionString);
        var mongoDatabase = mongoClient.GetDatabase(mongoDbSettings.Value.DatabaseName);
        _formsCollection = mongoDatabase.GetCollection<Form>(mongoDbSettings.Value.FormsCollectionName);
    }

    public async Task<List<Form>> GetAsync() =>
        await _formsCollection.Find(_ => true).ToListAsync();

    public async Task<Form?> GetAsync(string id) =>
        await _formsCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task CreateAsync(Form newForm) =>
        await _formsCollection.InsertOneAsync(newForm);

    public async Task UpdateAsync(string id, Form updatedForm)
    {
        updatedForm.UpdatedAt = DateTime.UtcNow;
        await _formsCollection.ReplaceOneAsync(x => x.Id == id, updatedForm);
    }

    public async Task RemoveAsync(string id) =>
        await _formsCollection.DeleteOneAsync(x => x.Id == id);
}
