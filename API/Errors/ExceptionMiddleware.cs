using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace API.Errors {
    public class ExceptionMiddleware {
        private readonly ILogger<ExceptionMiddleware> _logger;
        private readonly IHostEnvironment _env;
        private readonly RequestDelegate _next;

        public ExceptionMiddleware (RequestDelegate next, ILogger<ExceptionMiddleware> logger,
            IHostEnvironment env) {
            _logger = logger;
            _next = next;
            _env = env;
         

        }

        public async Task InvokeAsync (HttpContext context) {
             try {
                 await _next(context);
            } catch (Exception ex) {
                 _logger.LogError(ex,ex.Message);
                   context.Response.ContentType="application/json";
                   context.Response.StatusCode=(int) HttpStatusCode.InternalServerError;
                   var response = _env.IsDevelopment() ?
                   new ApiException((int)HttpStatusCode.InternalServerError,ex.Message,ex.StackTrace.ToString())
                   : new ApiException((int)HttpStatusCode.InternalServerError);
var option = new JsonSerializerOptions {
PropertyNamingPolicy = JsonNamingPolicy.CamelCase
};
                   var json = JsonSerializer.Serialize(response,option);
                   await context.Response.WriteAsync(json);
            }  
        }

    }
}