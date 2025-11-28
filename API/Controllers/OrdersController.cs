using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using API.Helpers;
using Core.Dtos.DocumentManagement;
using Core.Entities.DocumentManagement;
using Core.Interfaces;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [ServiceFilter(typeof(LogUserActivity))]
    [ServiceFilter(typeof(LogOrderActivity))]
    public class OrdersController : BaseController
    {
        private readonly IOrderPermissionService _permissionService;
        private readonly IOrderExpirationService _expirationService;
        private readonly IOrderActivityLogService _activityLogService;
        private readonly IOrderHistoryLifecycleService _historyService;

        public OrdersController(
            IOrderPermissionService permissionService,
            IOrderExpirationService expirationService,
            IOrderActivityLogService activityLogService,
            IOrderHistoryLifecycleService historyService)
        {
            _permissionService = permissionService;
            _expirationService = expirationService;
            _activityLogService = activityLogService;
            _historyService = historyService;
        }

        private int GetCurrentUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }

        // ==================== Order History ====================

        [HttpGet("{orderId}/history")]
        public async Task<ActionResult> GetOrderHistory(int orderId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 50)
        {
            try
            {
                var userId = GetCurrentUserId();

                var permissions = await _permissionService.GetEffectivePermissionsAsync(orderId, userId);
                if (!permissions.CanView && !User.IsInRole("Admin"))
                {
                    return Forbid("ليس لديك صلاحية لعرض سجل هذه المعاملة");
                }

                var history = await _historyService.GetOrderHistoryAsync(orderId, pageNumber, pageSize);
                var totalCount = await _historyService.GetHistoryCountAsync(orderId);

                return Ok(new
                {
                    history,
                    totalCount,
                    pageNumber,
                    pageSize,
                    totalPages = (int)Math.Ceiling(totalCount / (double)Math.Max(pageSize, 1))
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // ==================== Permission Management ====================

        [HttpGet("{orderId}/permissions/my")]
        public async Task<ActionResult<EffectivePermissions>> GetMyPermissions(int orderId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var permissions = await _permissionService.GetEffectivePermissionsAsync(orderId, userId);
                return Ok(permissions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("{orderId}/permissions/user")]
        public async Task<ActionResult> GrantUserPermission(int orderId, [FromBody] GrantUserPermissionDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();

                // Check if current user can manage permissions (must be owner or admin)
                var permissions = await _permissionService.GetEffectivePermissionsAsync(orderId, userId);
                if (!permissions.IsOwner && !User.IsInRole("Admin"))
                {
                    return Forbid("فقط مالك المعاملة أو المسؤول يمكنه منح الصلاحيات");
                }

                var success = await _permissionService.GrantUserPermissionAsync(orderId, userId, dto);
                if (!success)
                    return BadRequest("فشل منح الصلاحيات");

                return Ok(new { message = "تم منح الصلاحيات بنجاح" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpDelete("{orderId}/permissions/user/{targetUserId}")]
        public async Task<ActionResult> RevokeUserPermission(int orderId, int targetUserId)
        {
            try
            {
                var userId = GetCurrentUserId();

                var permissions = await _permissionService.GetEffectivePermissionsAsync(orderId, userId);
                if (!permissions.IsOwner && !User.IsInRole("Admin"))
                {
                    return Forbid("فقط مالك المعاملة أو المسؤول يمكنه إلغاء الصلاحيات");
                }

                var success = await _permissionService.RevokeUserPermissionAsync(orderId, targetUserId);
                if (!success)
                    return BadRequest("فشل إلغاء الصلاحيات");

                return Ok(new { message = "تم إلغاء الصلاحيات بنجاح" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPut("{orderId}/permissions/user/{targetUserId}")]
        public async Task<ActionResult> UpdateUserPermission(int orderId, int targetUserId, [FromBody] GrantUserPermissionDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();

                var permissions = await _permissionService.GetEffectivePermissionsAsync(orderId, userId);
                if (!permissions.IsOwner && !User.IsInRole("Admin"))
                {
                    return Forbid("فقط مالك المعاملة أو المسؤول يمكنه تحديث الصلاحيات");
                }

                dto.UserId = targetUserId;
                var success = await _permissionService.UpdateUserPermissionAsync(orderId, targetUserId, dto);
                if (!success)
                    return BadRequest("فشل تحديث الصلاحيات");

                return Ok(new { message = "تم تحديث الصلاحيات بنجاح" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("{orderId}/permissions/users")]
        public async Task<ActionResult<List<UserPermissionDto>>> GetOrderUserPermissions(int orderId)
        {
            try
            {
                var userId = GetCurrentUserId();

                // Only owner or admin can view permissions
                var permissions = await _permissionService.GetEffectivePermissionsAsync(orderId, userId);
                if (!permissions.IsOwner && !User.IsInRole("Admin"))
                {
                    return Forbid("فقط مالك المعاملة أو المسؤول يمكنه عرض الصلاحيات");
                }

                var userPermissions = await _permissionService.GetOrderUserPermissionsAsync(orderId);
                return Ok(userPermissions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // ==================== Department Access ====================

        [HttpPost("{orderId}/permissions/department")]
        public async Task<ActionResult> GrantDepartmentAccess(int orderId, [FromBody] GrantDepartmentAccessDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();

                var permissions = await _permissionService.GetEffectivePermissionsAsync(orderId, userId);
                if (!permissions.IsOwner && !User.IsInRole("Admin"))
                {
                    return Forbid("فقط مالك المعاملة أو المسؤول يمكنه منح وصول الإدارات");
                }

                var success = await _permissionService.GrantDepartmentAccessAsync(orderId, userId, dto);
                if (!success)
                    return BadRequest("فشل منح وصول الإدارة");

                return Ok(new { message = "تم منح وصول الإدارة بنجاح" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpDelete("{orderId}/permissions/department/{departmentId}")]
        public async Task<ActionResult> RevokeDepartmentAccess(int orderId, int departmentId)
        {
            try
            {
                var userId = GetCurrentUserId();

                var permissions = await _permissionService.GetEffectivePermissionsAsync(orderId, userId);
                if (!permissions.IsOwner && !User.IsInRole("Admin"))
                {
                    return Forbid("فقط مالك المعاملة أو المسؤول يمكنه إلغاء وصول الإدارات");
                }

                var success = await _permissionService.RevokeDepartmentAccessAsync(orderId, departmentId);
                if (!success)
                    return BadRequest("فشل إلغاء وصول الإدارة");

                return Ok(new { message = "تم إلغاء وصول الإدارة بنجاح" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("{orderId}/permissions/departments")]
        public async Task<ActionResult<List<DepartmentAccessDto>>> GetOrderDepartmentAccesses(int orderId)
        {
            try
            {
                var userId = GetCurrentUserId();

                var permissions = await _permissionService.GetEffectivePermissionsAsync(orderId, userId);
                if (!permissions.IsOwner && !User.IsInRole("Admin"))
                {
                    return Forbid("فقط مالك المعاملة أو المسؤول يمكنه عرض وصول الإدارات");
                }

                var departmentAccesses = await _permissionService.GetOrderDepartmentAccessesAsync(orderId);
                return Ok(departmentAccesses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // ==================== User Exceptions ====================

        [HttpPost("{orderId}/permissions/user-exception")]
        public async Task<ActionResult> AddUserException(int orderId, [FromBody] AddUserExceptionDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();

                var permissions = await _permissionService.GetEffectivePermissionsAsync(orderId, userId);
                if (!permissions.IsOwner && !User.IsInRole("Admin"))
                {
                    return Forbid("فقط مالك المعاملة أو المسؤول يمكنه استثناء المستخدمين");
                }

                var success = await _permissionService.AddUserExceptionAsync(orderId, userId, dto);
                if (!success)
                    return BadRequest("فشل استثناء المستخدم");

                return Ok(new { message = "تم استثناء المستخدم بنجاح" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpDelete("{orderId}/permissions/user-exception/{targetUserId}")]
        public async Task<ActionResult> RemoveUserException(int orderId, int targetUserId)
        {
            try
            {
                var userId = GetCurrentUserId();

                var permissions = await _permissionService.GetEffectivePermissionsAsync(orderId, userId);
                if (!permissions.IsOwner && !User.IsInRole("Admin"))
                {
                    return Forbid("فقط مالك المعاملة أو المسؤول يمكنه إلغاء استثناء المستخدمين");
                }

                var success = await _permissionService.RemoveUserExceptionAsync(orderId, targetUserId);
                if (!success)
                    return BadRequest("فشل إلغاء استثناء المستخدم");

                return Ok(new { message = "تم إلغاء استثناء المستخدم بنجاح" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("{orderId}/permissions/user-exceptions")]
        public async Task<ActionResult<List<UserExceptionDto>>> GetOrderUserExceptions(int orderId)
        {
            try
            {
                var userId = GetCurrentUserId();

                var permissions = await _permissionService.GetEffectivePermissionsAsync(orderId, userId);
                if (!permissions.IsOwner && !User.IsInRole("Admin"))
                {
                    return Forbid("فقط مالك المعاملة أو المسؤول يمكنه عرض المستخدمين المستثنين");
                }

                var userExceptions = await _permissionService.GetOrderUserExceptionsAsync(orderId);
                return Ok(userExceptions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // ==================== Expiration Management ====================

        [HttpPut("{orderId}/expiration")]
        public async Task<ActionResult> SetExpirationDate(int orderId, [FromBody] SetExpirationDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();

                var permissions = await _permissionService.GetEffectivePermissionsAsync(orderId, userId);
                if (!permissions.IsOwner && !User.IsInRole("Admin"))
                {
                    return Forbid("فقط مالك المعاملة أو المسؤول يمكنه تحديد تاريخ الانتهاء");
                }

                var success = await _expirationService.SetExpirationDateAsync(orderId, userId, dto.ExpirationDate);
                if (!success)
                    return BadRequest("فشل تحديد تاريخ الانتهاء");

                return Ok(new { message = "تم تحديد تاريخ الانتهاء بنجاح" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpDelete("{orderId}/expiration")]
        public async Task<ActionResult> RemoveExpirationDate(int orderId)
        {
            try
            {
                var userId = GetCurrentUserId();

                var permissions = await _permissionService.GetEffectivePermissionsAsync(orderId, userId);
                if (!permissions.IsOwner && !User.IsInRole("Admin"))
                {
                    return Forbid("فقط مالك المعاملة أو المسؤول يمكنه إلغاء تاريخ الانتهاء");
                }

                var success = await _expirationService.RemoveExpirationDateAsync(orderId, userId);
                if (!success)
                    return BadRequest("فشل إلغاء تاريخ الانتهاء");

                return Ok(new { message = "تم إلغاء تاريخ الانتهاء بنجاح" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("expired")]
        public async Task<ActionResult<List<Order>>> GetExpiredOrders()
        {
            try
            {
                if (!User.IsInRole("Admin"))
                {
                    return Forbid("فقط المسؤول يمكنه عرض المعاملات المنتهية");
                }

                var orders = await _expirationService.GetExpiredOrdersAsync();
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("near-expiration")]
        public async Task<ActionResult<List<Order>>> GetOrdersNearExpiration([FromQuery] int days = 7)
        {
            try
            {
                var orders = await _expirationService.GetOrdersNearExpirationAsync(days);

                // Filter to only show orders user has access to
                var userId = GetCurrentUserId();
                var accessibleOrders = new List<Order>();

                foreach (var order in orders)
                {
                    if (await _permissionService.CanUserAccessOrderAsync(order.Id, userId))
                    {
                        accessibleOrders.Add(order);
                    }
                }

                return Ok(accessibleOrders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("expiration-warnings")]
        public async Task<ActionResult<List<ExpirationWarning>>> GetExpirationWarnings()
        {
            try
            {
                var warnings = await _expirationService.GetExpirationWarningsAsync();
                return Ok(warnings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("archive-expired")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> ArchiveExpiredOrders()
        {
            try
            {
                var userId = GetCurrentUserId();
                var count = await _expirationService.ArchiveExpiredOrdersAsync(userId);
                return Ok(new { message = $"تم أرشفة {count} معاملة منتهية", count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // ==================== Archive Management ====================

        [HttpPost("{orderId}/archive")]
        public async Task<ActionResult> ArchiveOrder(int orderId, [FromBody] ArchiveOrderDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();

                var permissions = await _permissionService.GetEffectivePermissionsAsync(orderId, userId);
                if (!permissions.IsOwner && !User.IsInRole("Admin"))
                {
                    return Forbid("فقط مالك المعاملة أو المسؤول يمكنه أرشفة المعاملة");
                }

                var success = await _expirationService.ArchiveOrderAsync(orderId, userId, dto.Reason);
                if (!success)
                    return BadRequest("فشل أرشفة المعاملة");

                return Ok(new { message = "تم أرشفة المعاملة بنجاح" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("archived")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<ArchivedOrderDto>>> GetArchivedOrders()
        {
            try
            {
                var archivedOrders = await _expirationService.GetArchivedOrdersAsync();
                return Ok(archivedOrders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("archived/{archivedOrderId}/restore")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> RestoreArchivedOrder(int archivedOrderId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var success = await _expirationService.RestoreArchivedOrderAsync(archivedOrderId, userId);
                if (!success)
                    return BadRequest("فشل استرجاع المعاملة");

                return Ok(new { message = "تم استرجاع المعاملة بنجاح" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpDelete("archived/{archivedOrderId}/permanent")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> PermanentlyDeleteArchivedOrder(int archivedOrderId)
        {
            try
            {
                var success = await _expirationService.PermanentlyDeleteArchivedOrderAsync(archivedOrderId);
                if (!success)
                    return BadRequest("فشل حذف المعاملة نهائياً");

                return Ok(new { message = "تم حذف المعاملة نهائياً بنجاح" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // ==================== Delete Order (Owner Only) ====================

        [HttpDelete("{orderId}")]
        public async Task<ActionResult> DeleteOrder(int orderId)
        {
            try
            {
                var userId = GetCurrentUserId();

                // Only owner can delete
                var canDelete = await _permissionService.CanUserDeleteOrderAsync(orderId, userId);
                if (!canDelete)
                {
                    return Forbid("فقط مالك المعاملة يمكنه حذفها");
                }

                // Archive first instead of direct delete
                var success = await _expirationService.ArchiveOrderAsync(orderId, userId, "حذف المعاملة من قبل المالك");
                if (!success)
                    return BadRequest("فشل حذف المعاملة");

                return Ok(new { message = "تم حذف المعاملة (نقلها للأرشيف) بنجاح" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // ==================== Activity Logs ====================

        [HttpGet("{orderId}/activity")]
        public async Task<ActionResult<List<OrderActivityLogDto>>> GetOrderActivity(int orderId, [FromQuery] int pageSize = 100)
        {
            try
            {
                var userId = GetCurrentUserId();
                var permissions = await _permissionService.GetEffectivePermissionsAsync(orderId, userId);
                if (!permissions.IsOwner && !User.IsInRole("Admin"))
                {
                    return Forbid("فقط مالك المعاملة أو المسؤول يمكنه عرض سجل النشاط");
                }

                var logs = await _activityLogService.GetLogsForOrderAsync(orderId, Math.Clamp(pageSize, 25, 500));
                return Ok(logs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}

