using System;
using System.Collections.Generic;
using System.Linq;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using API.Extensions;
using Core.Dtos.DocumentManagement;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;

namespace API.Helpers
{
    public class LogUserActivity : IAsyncActionFilter
    {
        private const int MaxPayloadLength = 4000;

        private readonly API.Extensions.IUserRepository _userRepository;
        private readonly IOrderActivityLogService _activityLogService;
        private readonly ILogger<LogUserActivity> _logger;

        public LogUserActivity(
            API.Extensions.IUserRepository userRepository,
            IOrderActivityLogService activityLogService,
            ILogger<LogUserActivity> logger)
        {
            _userRepository = userRepository;
            _activityLogService = activityLogService;
            _logger = logger;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var executedContext = await next();

            var principal = executedContext.HttpContext.User;
            if (principal?.Identity == null || !principal.Identity.IsAuthenticated)
            {
                return;
            }

            var userIdValue = principal.RetrieveUseeByIdPrincipal();
            if (!int.TryParse(userIdValue, out var userId))
            {
                return;
            }

            try
            {
                var user = await _userRepository.GetUserByIdAsync(userId);
                if (user != null)
                {
                    user.LastActive = DateTime.UtcNow;
                    _userRepository.Update(user);
                    await _userRepository.SaveAllAsync();
                }

                await LogOrderActivityAsync(context, executedContext, user?.UserName ?? principal.Identity?.Name ?? "Unknown", user?.CodeUser, userId);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to log user activity for user {UserId}", userId);
            }
        }

        private async Task LogOrderActivityAsync(ActionExecutingContext context, ActionExecutedContext executedContext, string userName, string? userCode, int userId)
        {
            try
            {
                var httpContext = executedContext.HttpContext;
                var controllerDescriptor = context.ActionDescriptor as ControllerActionDescriptor;
                var orderId = ResolveOrderId(httpContext, context);

                var logEntry = new OrderActivityLogDto
                {
                    OrderId = orderId,
                    UserId = userId,
                    UserName = userName,
                    UserCode = userCode,
                    ControllerName = controllerDescriptor?.ControllerName ?? "Unknown",
                    ActionName = controllerDescriptor?.ActionName ?? "Unknown",
                    HttpMethod = httpContext.Request.Method,
                    Path = httpContext.Request.Path,
                    QueryString = httpContext.Request.QueryString.HasValue ? httpContext.Request.QueryString.Value : null,
                    IsSuccess = executedContext.Exception == null,
                    StatusCode = httpContext.Response?.StatusCode,
                    Summary = BuildSummary(controllerDescriptor, orderId),
                    PayloadSnapshot = SerializePayload(context.ActionArguments),
                    IpAddress = httpContext.Connection.RemoteIpAddress?.ToString(),
                    UserAgent = httpContext.Request.Headers["User-Agent"].ToString(),
                    OccurredAt = DateTime.UtcNow
                };

                await _activityLogService.LogAsync(logEntry, httpContext.RequestAborted);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to persist order activity log entry for user {UserId}", userId);
            }
        }

        private static int? ResolveOrderId(Microsoft.AspNetCore.Http.HttpContext httpContext, ActionExecutingContext actionContext)
        {
            if (httpContext.Request.RouteValues.TryGetValue("orderId", out var orderIdValue) &&
                int.TryParse(orderIdValue?.ToString(), out var orderId))
            {
                return orderId;
            }

            if (httpContext.Request.RouteValues.TryGetValue("id", out var idValue) &&
                int.TryParse(idValue?.ToString(), out var id))
            {
                return id;
            }

            if (actionContext.ActionArguments.TryGetValue("orderId", out var argumentOrderId) &&
                argumentOrderId is int argumentInt)
            {
                return argumentInt;
            }

            return null;
        }

        private static string? BuildSummary(ControllerActionDescriptor? descriptor, int? orderId)
        {
            if (descriptor == null)
            {
                return orderId.HasValue ? $"OrderId: {orderId}" : null;
            }

            var summary = $"{descriptor.ControllerName}.{descriptor.ActionName}";
            return orderId.HasValue ? $"{summary} (OrderId: {orderId})" : summary;
        }

        private static string? SerializePayload(IDictionary<string, object?> actionArguments)
        {
            if (actionArguments == null || actionArguments.Count == 0)
            {
                return null;
            }

            try
            {
                var json = JsonSerializer.Serialize(actionArguments, new JsonSerializerOptions
                {
                    WriteIndented = false,
                    DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
                    MaxDepth = 3
                });

                if (json.Length <= MaxPayloadLength)
                {
                    return json;
                }

                return json.Substring(0, MaxPayloadLength) + "...";
            }
            catch
            {
                return "Payload serialization failed";
            }
        }
    }
}