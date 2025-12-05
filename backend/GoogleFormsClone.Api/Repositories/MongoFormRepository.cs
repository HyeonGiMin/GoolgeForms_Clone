// MongoFormRepository.cs - MongoDB 컬렉션을 직접 사용하는 Form 저장소 구현
using GoogleFormsClone.Api.Domain;
using GoogleFormsClone.Api.Persistence;
using MongoDB.Driver;

namespace GoogleFormsClone.Api.Repositories;

public class MongoFormRepository : IFormRepository
{
    private readonly IMongoCollection<Form> _collection;

    public MongoFormRepository(MongoDbContext context)
    {
        _collection = context.GetCollection<Form>("forms");
    }

    public async Task<IReadOnlyList<Form>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var cursor = await _collection
            .FindAsync(FilterDefinition<Form>.Empty, cancellationToken: cancellationToken);

        var list = await cursor.ToListAsync(cancellationToken);

        return list
            .OrderByDescending(f => f.CreatedAtUtc)
            .ToList();
    }

    public async Task<Form?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var cursor = await _collection.FindAsync(f => f.Id == id, cancellationToken: cancellationToken);
        return await cursor.FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Form> AddAsync(Form form, CancellationToken cancellationToken = default)
    {
        await _collection.InsertOneAsync(form, cancellationToken: cancellationToken);
        return form;
    }

    public async Task<Form?> UpdateAsync(Form form, CancellationToken cancellationToken = default)
    {
        form.UpdatedAtUtc = DateTime.UtcNow;

        var result = await _collection.ReplaceOneAsync(
            f => f.Id == form.Id,
            form,
            cancellationToken: cancellationToken
        );

        return result.ModifiedCount > 0 ? form : null;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _collection.DeleteOneAsync(
            f => f.Id == id,
            cancellationToken: cancellationToken
        );

        return result.DeletedCount > 0;
    }
}


