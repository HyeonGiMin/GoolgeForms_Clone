using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace GoogleFormsClone.API.Models;

public class FormResponse
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("formId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string FormId { get; set; } = string.Empty;

    [BsonElement("answers")]
    public List<Answer> Answers { get; set; } = new();

    [BsonElement("submittedAt")]
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
}

public class Answer
{
    [BsonElement("questionId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string QuestionId { get; set; } = string.Empty;

    [BsonElement("value")]
    public object? Value { get; set; }
}
