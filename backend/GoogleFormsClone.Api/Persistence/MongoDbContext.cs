// MongoDbContext.cs - MongoDB 연결 및 데이터베이스/컬렉션 액세스를 제공
using MongoDB.Driver;

namespace GoogleFormsClone.Api.Persistence;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;
    private readonly IMongoClient _client;

    public MongoDbContext(IConfiguration configuration)
    {
        // 환경 변수 우선, 없으면 appsettings.json 사용
        var connectionString = Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING")
                              ?? configuration.GetSection("MongoDb").GetValue<string>("ConnectionString")
                              ?? throw new InvalidOperationException("MongoDB 연결 문자열이 필요합니다. MONGODB_CONNECTION_STRING 환경 변수 또는 appsettings.json 설정을 확인하세요.");

        var databaseName = Environment.GetEnvironmentVariable("MONGODB_DATABASE_NAME")
                           ?? configuration.GetSection("MongoDb").GetValue<string>("DatabaseName")
                           ?? throw new InvalidOperationException("MongoDB 데이터베이스 이름이 필요합니다. MONGODB_DATABASE_NAME 환경 변수 또는 appsettings.json 설정을 확인하세요.");

        _client = new MongoClient(connectionString);
        _database = _client.GetDatabase(databaseName);
    }

    public IMongoCollection<TDocument> GetCollection<TDocument>(string name)
    {
        return _database.GetCollection<TDocument>(name);
    }

    /// <summary>
    /// MongoDB 연결 상태를 확인합니다.
    /// </summary>
    public async Task<bool> TestConnectionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            await _database.RunCommandAsync<MongoDB.Bson.BsonDocument>(
                new MongoDB.Bson.BsonDocument("ping", 1),
                cancellationToken: cancellationToken
            );
            return true;
        }
        catch
        {
            return false;
        }
    }
}


