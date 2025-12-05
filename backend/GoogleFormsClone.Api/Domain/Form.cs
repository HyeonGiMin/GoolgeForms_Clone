// Form.cs - 설문 폼 도메인 엔티티 (MongoDB 컬렉션과 매핑)
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace GoogleFormsClone.Api.Domain;

public class Form
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? ConfirmationMessage { get; set; }

    public bool ShowProgressBar { get; set; } = false;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAtUtc { get; set; }

    public List<Question> Questions { get; set; } = [];
}

