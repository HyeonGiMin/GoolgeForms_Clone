// .env 파일 로드 (개발 환경)
DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS 설정: 개발용 프론트엔드(origin) 허용
const string CorsPolicy = "FrontendPolicy";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: CorsPolicy, policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:15010",
                "http://localhost:15010"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// MongoDB 컨텍스트 및 Repository DI 등록
builder.Services.AddSingleton<GoogleFormsClone.Api.Persistence.MongoDbContext>();
builder.Services.AddScoped<GoogleFormsClone.Api.Repositories.IFormRepository, GoogleFormsClone.Api.Repositories.MongoFormRepository>();
builder.Services.AddScoped<GoogleFormsClone.Api.Services.IFormService, GoogleFormsClone.Api.Services.FormService>();

var app = builder.Build();

// MongoDB 연결 확인
var logger = app.Services.GetRequiredService<ILogger<Program>>();
try
{
    var mongoContext = app.Services.GetRequiredService<GoogleFormsClone.Api.Persistence.MongoDbContext>();
    var isConnected = await mongoContext.TestConnectionAsync();

    if (isConnected)
    {
        logger.LogInformation("✅ MongoDB 연결 성공");
    }
    else
    {
        logger.LogWarning("⚠️ MongoDB 연결 실패 - 서비스는 시작되지만 데이터베이스 작업이 실패할 수 있습니다.");
    }
}
catch (Exception ex)
{
    logger.LogError(ex, "❌ MongoDB 연결 확인 중 오류 발생");
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors(CorsPolicy);
app.MapControllers();

app.Run();
