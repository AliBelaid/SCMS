using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Core.Entities.DocumentManagement;
using Infrastructure.Identity;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;

namespace API.Helpers
{
    /// <summary>
    /// Action filter that captures every order-related interaction and stores an audit trail entry.
    /// </summary>
    public class LogOrderActivity : IAsyncActionFilter
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var resultContext = await next();

            if (!resultContext.HttpContext.User.Identity?.IsAuthenticated ?? true)
            {
                return;
            }

            try
            {
                var dbContext = resultContext.HttpContext.RequestServices.GetService<AppIdentityDbContext>();
                if (dbContext == null)
                {
                    return;
                }

                var orderId = ResolveOrderId(context);
                if (orderId == 0)
                {
                    return;
                }

                var userIdValue = resultContext.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdValue, out var userId))
                {
                    return;
                }

                var httpMethod = resultContext.HttpContext.Request.Method;
                var path = resultContext.HttpContext.Request.Path.Value ?? string.Empty;
                var action = DetermineAction(httpMethod, path);

                if (action == null)
                {
                    return;
                }

                var historyEntry = new OrderHistory
                {
                    OrderId = orderId,
                    Action = action.Value,
                    Description = GenerateDescription(action.Value),
                    PerformedById = userId,
                    PerformedAt = DateTime.UtcNow,
                    Notes = $"IP: {resultContext.HttpContext.Connection.RemoteIpAddress}"
                };

                dbContext.OrderHistories.Add(historyEntry);
                await dbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error logging order activity: {ex.Message}");
            }
        }

        private static int ResolveOrderId(ActionExecutingContext context)
        {
            if (context.RouteData.Values.TryGetValue("orderId", out var orderIdValue) &&
                int.TryParse(orderIdValue?.ToString(), out var orderId))
            {
                return orderId;
            }

            if (context.ActionArguments.TryGetValue("orderId", out var actionValue) &&
                int.TryParse(actionValue?.ToString(), out var actionOrderId))
            {
                return actionOrderId;
            }

            return 0;
        }

        private static OrderAction? DetermineAction(string method, string path)
        {
            var normalizedPath = path.ToLowerInvariant();

            if (normalizedPath.Contains("/permissions/user") && method == "POST")
                return OrderAction.PermissionGranted;

            if (normalizedPath.Contains("/permissions/user") && method == "DELETE")
                return OrderAction.PermissionRevoked;

            if (normalizedPath.Contains("/permissions/department") && method == "POST")
                return OrderAction.DepartmentAccessGranted;

            if (normalizedPath.Contains("/permissions/department") && method == "DELETE")
                return OrderAction.DepartmentAccessRevoked;

            if (normalizedPath.Contains("/permissions/user-exception") && method == "POST")
                return OrderAction.UserExceptionAdded;

            if (normalizedPath.Contains("/permissions/user-exception") && method == "DELETE")
                return OrderAction.UserExceptionRemoved;

            if (normalizedPath.Contains("/expiration") && method == "PUT")
                return OrderAction.ExpirationSet;

            if (normalizedPath.Contains("/expiration") && method == "DELETE")
                return OrderAction.ExpirationRemoved;

            if (normalizedPath.Contains("/archive") && method == "POST")
                return OrderAction.Archived;

            if (normalizedPath.Contains("/restore") && method == "POST")
                return OrderAction.Restored;

            if (normalizedPath.Contains("/permanent") && method == "DELETE")
                return OrderAction.Deleted;

            if (method == "DELETE")
                return OrderAction.Deleted;

            if (method == "POST" && !normalizedPath.Contains("/permissions"))
                return OrderAction.Created;

            if (method == "PUT" || method == "PATCH")
                return OrderAction.Updated;

            return null;
        }

        private static string GenerateDescription(OrderAction action)
        {
            return action switch
            {
                OrderAction.Created => "تم إنشاء المعاملة",
                OrderAction.Updated => "تم تحديث المعاملة",
                OrderAction.PermissionGranted => "تم منح صلاحيات لمستخدم",
                OrderAction.PermissionRevoked => "تم إلغاء صلاحيات مستخدم",
                OrderAction.DepartmentAccessGranted => "تم منح وصول لإدارة",
                OrderAction.DepartmentAccessRevoked => "تم إلغاء وصول لإدارة",
                OrderAction.UserExceptionAdded => "تم استثناء مستخدم",
                OrderAction.UserExceptionRemoved => "تم إلغاء استثناء مستخدم",
                OrderAction.ExpirationSet => "تم تحديد تاريخ انتهاء",
                OrderAction.ExpirationRemoved => "تم إلغاء تاريخ الانتهاء",
                OrderAction.Archived => "تم أرشفة المعاملة",
                OrderAction.Restored => "تم استرجاع المعاملة",
                OrderAction.Deleted => "تم حذف المعاملة",
                OrderAction.AttachmentAdded => "تم إضافة مرفق",
                OrderAction.AttachmentRemoved => "تم حذف مرفق",
                OrderAction.StatusChanged => "تم تغيير حالة المعاملة",
                OrderAction.PriorityChanged => "تم تغيير أولوية المعاملة",
                OrderAction.Assigned => "تم تعيين المعاملة",
                _ => "تم تنفيذ إجراء على المعاملة"
            };
        }
    }
}

