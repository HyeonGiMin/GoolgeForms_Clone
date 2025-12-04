using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace GoogleFormsClone.API.Models;

public class Form
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("title")]
    public string Title { get; set; } = string.Empty;

    [BsonElement("description")]
    public string? Description { get; set; }

    [BsonElement("questions")]
    public List<Question> Questions { get; set; } = new();

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("isAcceptingResponses")]
    public bool IsAcceptingResponses { get; set; } = true;
}

public class Question
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("type")]
    public QuestionType Type { get; set; }

    [BsonElement("title")]
    public string Title { get; set; } = string.Empty;

    [BsonElement("description")]
    public string? Description { get; set; }

    [BsonElement("required")]
    public bool Required { get; set; } = false;

    [BsonElement("options")]
    public List<string>? Options { get; set; }
}

public enum QuestionType
{
    ShortAnswer,
    Paragraph,
    MultipleChoice,
    Checkboxes,
    Dropdown,
    LinearScale,
    Date,
    Time
}
