namespace GoogleFormsClone.API.Configuration;

public class MongoDbSettings
{
    public string ConnectionString { get; set; } = string.Empty;
    public string DatabaseName { get; set; } = string.Empty;
    public string FormsCollectionName { get; set; } = "forms";
    public string ResponsesCollectionName { get; set; } = "responses";
}
