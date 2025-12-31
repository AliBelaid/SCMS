using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using API.Helpers;
using AutoMapper;
using Core.Dtos.DocumentManagement;
using Core.Entities.DocumentManagement;
using Core.Interfaces;
using Infrastructure.Identity;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
        private readonly AppIdentityDbContext _context;
        private readonly IMapper _mapper;

        public OrdersController(
            IOrderPermissionService permissionService,
            IOrderExpirationService expirationService,
            IOrderActivityLogService activityLogService,
            IOrderHistoryLifecycleService historyService,
            AppIdentityDbContext context,
            IMapper mapper)
        {
            _permissionService = permissionService;
            _expirationService = expirationService;
            _activityLogService = activityLogService;
            _historyService = historyService;
            _context = context;
            _mapper = mapper;
        }

        private int GetCurrentUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }

        // ==================== Get All Orders ====================

        /// <summary>
        /// Get all orders (non-archived by default)
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAllOrders([FromQuery] bool includeArchived = false)
        {
            try
            {
                var userId = GetCurrentUserId();
                var query = _context.Orders
                    .Include(o => o.Department)
                    .Include(o => o.Subject)
                    .Include(o => o.CreatedBy)
                    .Include(o => o.AssignedTo)
                    .AsQueryable();

                // Filter out archived orders unless explicitly requested
                if (!includeArchived)
                {
                    query = query.Where(o => !o.IsArchived);
                }

                var orders = await query
                    .Include(o => o.Attachments)
                    .OrderByDescending(o => o.CreatedAt)
                    .Select(o => new
                    {
                        id = o.Id,
                        referenceNumber = o.ReferenceNumber,
                        title = o.Title,
                        description = o.Description,
                        type = o.Type.ToString(),
                        departmentId = o.DepartmentId,
                        departmentName = o.Department != null ? o.Department.NameAr : null,
                        subjectId = o.SubjectId,
                        subjectName = o.Subject != null ? o.Subject.NameAr : null,
                        status = o.Status.ToString(),
                        priority = o.Priority.ToString(),
                        createdAt = o.CreatedAt,
                        updatedAt = o.UpdatedAt,
                        createdById = o.CreatedById,
                        createdByName = o.CreatedBy != null ? o.CreatedBy.CodeUser : null,
                        assignedToId = o.AssignedToId,
                        assignedToName = o.AssignedTo != null ? o.AssignedTo.CodeUser : null,
                        dueDate = o.DueDate,
                        completedAt = o.CompletedAt,
                        expirationDate = o.ExpirationDate,
                        isExpired = o.IsExpired,
                        isArchived = o.IsArchived,
                        archivedAt = o.ArchivedAt,
                        isPublic = o.IsPublic,
                        notes = o.Notes,
                        attachmentsCount = o.Attachments.Count(a => !a.IsDeleted)
                    })
                    .ToListAsync();

                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while retrieving orders", message = ex.Message });
            }
        }

        // ==================== Create Order ====================

        /// <summary>
        /// Create a new order with permissions and attachments
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<object>> CreateOrder([FromBody] CreateOrderDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                {
                    return Unauthorized(new { error = "User not authenticated" });
                }

                // Validate department and subject
                if (!int.TryParse(dto.DepartmentId, out int departmentId))
                {
                    return BadRequest(new { error = "Invalid department ID" });
                }

                if (!int.TryParse(dto.SubjectId, out int subjectId))
                {
                    return BadRequest(new { error = "Invalid subject ID" });
                }

                var department = await _context.Departments.FindAsync(departmentId);
                if (department == null)
                {
                    return NotFound(new { error = "Department not found" });
                }

                var subject = await _context.Subjects.FindAsync(subjectId);
                if (subject == null)
                {
                    return NotFound(new { error = "Subject not found" });
                }

                // Parse enums
                OrderType orderType;
                if (dto.Type?.ToLower() == "incoming")
                    orderType = OrderType.Incoming;
                else if (dto.Type?.ToLower() == "outgoing")
                    orderType = OrderType.Outgoing;
                else
                    return BadRequest(new { error = "Invalid order type. Must be 'incoming' or 'outgoing'" });

                OrderStatus orderStatus;
                switch (dto.Status?.ToLower())
                {
                    case "pending":
                        orderStatus = OrderStatus.Pending;
                        break;
                    case "in-progress":
                        orderStatus = OrderStatus.InProgress;
                        break;
                    case "completed":
                        orderStatus = OrderStatus.Completed;
                        break;
                    case "archived":
                        orderStatus = OrderStatus.Archived;
                        break;
                    case "cancelled":
                        orderStatus = OrderStatus.Cancelled;
                        break;
                    default:
                        return BadRequest(new { error = "Invalid order status" });
                }

                OrderPriority orderPriority;
                switch (dto.Priority?.ToLower())
                {
                    case "low":
                        orderPriority = OrderPriority.Low;
                        break;
                    case "medium":
                        orderPriority = OrderPriority.Medium;
                        break;
                    case "high":
                        orderPriority = OrderPriority.High;
                        break;
                    case "urgent":
                        orderPriority = OrderPriority.Urgent;
                        break;
                    default:
                        return BadRequest(new { error = "Invalid order priority" });
                }

                // Create order
                var order = new Order
                {
                    ReferenceNumber = dto.ReferenceNumber ?? GenerateReferenceNumber(department.Code, subject.Code, orderType),
                    Type = orderType,
                    DepartmentId = departmentId,
                    SubjectId = subjectId,
                    Title = dto.Title,
                    Description = dto.Description,
                    Status = orderStatus,
                    Priority = orderPriority,
                    DueDate = dto.DueDate,
                    ExpirationDate = dto.ExpirationDate,
                    Notes = dto.Notes,
                    IsPublic = dto.IsPublic,
                    CreatedById = userId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                // Add attachments if provided
                if (dto.AttachmentIds != null && dto.AttachmentIds.Count > 0)
                {
                    foreach (var attachmentId in dto.AttachmentIds)
                    {
                        var document = await _context.Documents.FindAsync(attachmentId);
                        if (document != null)
                        {
                            var orderAttachment = new OrderAttachment
                            {
                                OrderId = order.Id,
                                DocumentId = attachmentId, // Store reference to original document
                                FileName = document.FileName,
                                FilePath = document.FilePath,
                                FileType = document.FileType,
                                FileSize = document.FileSize,
                                UploadedById = userId,
                                UploadedAt = DateTime.UtcNow
                            };
                            _context.OrderAttachments.Add(orderAttachment);
                        }
                    }
                }

                // Add user permissions
                if (dto.UserPermissions != null && dto.UserPermissions.Count > 0)
                {
                    foreach (var permDto in dto.UserPermissions)
                    {
                        var permission = new OrderPermission
                        {
                            OrderId = order.Id,
                            UserId = permDto.UserId,
                            PermissionType = PermissionType.View, // Default, will be set based on flags
                            GrantedById = userId,
                            GrantedAt = DateTime.UtcNow,
                            ExpiresAt = permDto.ExpiresAt,
                            Notes = permDto.Notes,
                            IsActive = true
                        };

                        // Set permission types based on flags
                        var permissionTypes = new List<PermissionType>();
                        if (permDto.CanView) permissionTypes.Add(PermissionType.View);
                        if (permDto.CanEdit) permissionTypes.Add(PermissionType.Edit);
                        if (permDto.CanDelete) permissionTypes.Add(PermissionType.Delete);
                        if (permDto.CanShare) permissionTypes.Add(PermissionType.Share);
                        if (permDto.CanDownload) permissionTypes.Add(PermissionType.Download);
                        if (permDto.CanPrint) permissionTypes.Add(PermissionType.Print);
                        if (permDto.CanComment) permissionTypes.Add(PermissionType.Comment);
                        if (permDto.CanApprove) permissionTypes.Add(PermissionType.Approve);

                        // Create separate permission records for each type
                        foreach (var permType in permissionTypes)
                        {
                            var perm = new OrderPermission
                            {
                                OrderId = order.Id,
                                UserId = permDto.UserId,
                                PermissionType = permType,
                                GrantedById = userId,
                                GrantedAt = DateTime.UtcNow,
                                ExpiresAt = permDto.ExpiresAt,
                                Notes = permDto.Notes,
                                IsActive = true
                            };
                            _context.OrderPermissions.Add(perm);
                        }
                    }
                }

                // Add department accesses
                if (dto.DepartmentAccesses != null && dto.DepartmentAccesses.Count > 0)
                {
                    foreach (var deptAccessDto in dto.DepartmentAccesses)
                    {
                        if (!int.TryParse(deptAccessDto.DepartmentId, out int deptId))
                            continue;

                        // Map AccessLevel to boolean flags
                        var deptAccess = new OrderDepartmentAccess
                        {
                            OrderId = order.Id,
                            DepartmentId = deptId,
                            GrantedById = userId,
                            GrantedAt = DateTime.UtcNow,
                            CanView = deptAccessDto.AccessLevel >= 1, // ViewOnly = 1
                            CanEdit = deptAccessDto.AccessLevel >= 2, // Edit = 2
                            CanDownload = deptAccessDto.AccessLevel >= 2,
                            CanShare = deptAccessDto.AccessLevel >= 3, // Full = 3
                            Notes = deptAccessDto.Notes
                        };
                        _context.DepartmentAccesses.Add(deptAccess);
                    }
                }

                // Add user exceptions
                if (dto.UserExceptions != null && dto.UserExceptions.Count > 0)
                {
                    foreach (var excDto in dto.UserExceptions)
                    {
                        var exception = new OrderUserException
                        {
                            OrderId = order.Id,
                            UserId = excDto.UserId,
                            Reason = excDto.Reason,
                            CreatedById = userId,
                            CreatedAt = DateTime.UtcNow,
                            ExpiresAt = excDto.ExpiresAt,
                            IsActive = true
                        };
                        _context.UserExceptions.Add(exception);
                    }
                }

                // Add history entry
                _context.OrderHistories.Add(new OrderHistory
                {
                    OrderId = order.Id,
                    Action = OrderAction.Created,
                    Description = "تم إنشاء المعاملة مع جميع الصلاحيات والمرفقات",
                    PerformedById = userId
                });

                await _context.SaveChangesAsync();

                // Return created order
                return CreatedAtAction(nameof(GetOrderById), new { id = order.Id }, new
                {
                    id = order.Id,
                    referenceNumber = order.ReferenceNumber,
                    title = order.Title,
                    message = "Order created successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while creating the order", message = ex.Message });
            }
        }

        private string GenerateReferenceNumber(string deptCode, string subjectCode, OrderType type)
        {
            var year = DateTime.UtcNow.Year;
            var month = DateTime.UtcNow.Month.ToString("D2");
            var day = DateTime.UtcNow.Day.ToString("D2");
            var prefix = type == OrderType.Incoming ? "IN" : "OUT";
            var randomNum = new Random().Next(1000, 9999);
            return $"{deptCode}-{subjectCode}-{prefix}-{year}{month}{day}-{randomNum}";
        }

        /// <summary>
        /// Get order by ID with all details including permissions and attachments
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetOrderById(int id)
        {
            try
            {
                var userId = GetCurrentUserId();

                var order = await _context.Orders
                    .Include(o => o.Department)
                    .Include(o => o.Subject)
                    .Include(o => o.CreatedBy)
                    .Include(o => o.AssignedTo)
                    .Include(o => o.Attachments)
                    .Include(o => o.Permissions)
                        .ThenInclude(p => p.User)
                    .Include(o => o.DepartmentAccesses)
                        .ThenInclude(da => da.Department)
                    .Include(o => o.UserExceptions)
                        .ThenInclude(ue => ue.User)
                    .FirstOrDefaultAsync(o => o.Id == id);

                if (order == null)
                {
                    return NotFound(new { error = "Order not found" });
                }

                // Check permissions
                var permissions = await _permissionService.GetEffectivePermissionsAsync(id, userId);
                if (!permissions.CanView && !User.IsInRole("Admin"))
                {
                    return Forbid("You don't have permission to view this order");
                }

                // Build response
                var result = new
                {
                    id = order.Id.ToString(),
                    referenceNumber = order.ReferenceNumber,
                    type = order.Type.ToString().ToLower(),
                    departmentId = order.DepartmentId.ToString(),
                    departmentCode = order.Department?.Code,
                    departmentNameAr = order.Department?.NameAr,
                    subjectId = order.SubjectId.ToString(),
                    subjectCode = order.Subject?.Code,
                    subjectNameAr = order.Subject?.NameAr,
                    title = order.Title,
                    description = order.Description,
                    status = order.Status.ToString().ToLower(),
                    priority = order.Priority.ToString().ToLower(),
                    createdAt = order.CreatedAt,
                    updatedAt = order.UpdatedAt,
                    createdBy = order.CreatedBy?.CodeUser,
                    createdByName = order.CreatedBy?.CodeUser,
                    assignedToId = order.AssignedToId,
                    assignedToName = order.AssignedTo?.CodeUser,
                    dueDate = order.DueDate,
                    expirationDate = order.ExpirationDate,
                    isExpired = order.IsExpired,
                    isArchived = order.IsArchived,
                    isPublic = order.IsPublic,
                    notes = order.Notes,
                    attachments = order.Attachments
                        .Where(a => !a.IsDeleted)
                        .Select(a =>
                        {
                            var dto = _mapper.Map<OrderAttachmentDto>(a);
                            dto.CanView = IsViewableFileType(a.FileType, a.FileName);
                            dto.CanDownload = true;
                            
                            // Convert FilePath to relative path (remove full Windows path, keep only relative to wwwroot)
                            var relativeFilePath = ConvertToRelativePath(a.FilePath);
                            
                            return new
                            {
                                id = dto.Id,
                                documentId = dto.DocumentId,
                                fileName = dto.FileName,
                                fileType = dto.FileType,
                                fileSize = dto.FileSize,
                                uploadedAt = dto.UploadedAt,
                                uploadedById = dto.UploadedById,
                                filePath = relativeFilePath, // Return relative path
                                fileUrl = dto.FileUrl,
                                canView = dto.CanView,
                                canDownload = dto.CanDownload
                            };
                        }).ToList(),
                    permissions = order.Permissions
                        .Where(p => p.IsActive && (!p.ExpiresAt.HasValue || p.ExpiresAt.Value > DateTime.UtcNow))
                        .GroupBy(p => p.UserId)
                        .Select(g => new
                        {
                            userId = g.Key,
                            userCode = g.First().User?.CodeUser,
                            userEmail = g.First().User?.Email,
                            canView = g.Any(p => p.PermissionType == PermissionType.View),
                            canEdit = g.Any(p => p.PermissionType == PermissionType.Edit),
                            canDelete = g.Any(p => p.PermissionType == PermissionType.Delete),
                            canShare = g.Any(p => p.PermissionType == PermissionType.Share),
                            canDownload = g.Any(p => p.PermissionType == PermissionType.Download),
                            canPrint = g.Any(p => p.PermissionType == PermissionType.Print),
                            canComment = g.Any(p => p.PermissionType == PermissionType.Comment),
                            canApprove = g.Any(p => p.PermissionType == PermissionType.Approve),
                            grantedAt = g.First().GrantedAt,
                            expiresAt = g.First().ExpiresAt
                        }).ToList(),
                    departmentAccesses = order.DepartmentAccesses
                        .Select(da => new
                        {
                            departmentId = da.DepartmentId.ToString(),
                            departmentNameAr = da.Department?.NameAr,
                            canView = da.CanView,
                            canEdit = da.CanEdit,
                            canDownload = da.CanDownload,
                            canShare = da.CanShare,
                            grantedAt = da.GrantedAt,
                            notes = da.Notes
                        }).ToList(),
                    userExceptions = order.UserExceptions
                        .Where(ue => ue.IsActive && (!ue.ExpiresAt.HasValue || ue.ExpiresAt.Value > DateTime.UtcNow))
                        .Select(ue => new
                        {
                            userId = ue.UserId,
                            userCode = ue.User?.CodeUser,
                            reason = ue.Reason,
                            createdAt = ue.CreatedAt,
                            expiresAt = ue.ExpiresAt
                        }).ToList()
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while retrieving the order", message = ex.Message });
            }
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

        [HttpGet("permissions/available-users")]
        public async Task<ActionResult<List<object>>> GetAvailableUsers()
        {
            try
            {
                var users = await _context.Users
                    .Where(u => u.IsActive)
                    .Select(u => new
                    {
                        id = u.Id,
                        code = u.CodeUser,
                        email = u.Email,
                        name = u.CodeUser // Using CodeUser as name
                    })
                    .OrderBy(u => u.code)
                    .ToListAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

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

        // ==================== Attachment Serving ====================

        [HttpGet("attachments/{attachmentId}/serve")]
        public async Task<IActionResult> ServeOrderAttachment(int attachmentId, [FromQuery] bool download = false)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                {
                    return Unauthorized(new { error = "User not authenticated" });
                }

                // Get attachment with order
                var attachment = await _context.OrderAttachments
                    .Include(a => a.Order)
                    .FirstOrDefaultAsync(a => a.Id == attachmentId && !a.IsDeleted);

                if (attachment == null)
                {
                    return NotFound(new { error = "Attachment not found" });
                }

                // Check permissions
                var permissions = await _permissionService.GetEffectivePermissionsAsync(attachment.OrderId, userId);
                
                // For viewing, user needs canView or canDownload permission
                // For downloading, user needs canDownload permission
                if (download && !permissions.CanDownload && !permissions.IsOwner && !User.IsInRole("Admin"))
                {
                    return Forbid("ليس لديك صلاحية لتحميل هذا الملف");
                }

                if (!download && !permissions.CanView && !permissions.CanDownload && !permissions.IsOwner && !User.IsInRole("Admin"))
                {
                    return Forbid("ليس لديك صلاحية لعرض هذا الملف");
                }

                // Check if file exists
                if (!System.IO.File.Exists(attachment.FilePath))
                {
                    return NotFound(new { error = "File not found on disk", filePath = attachment.FilePath });
                }

                // Determine content type
                var contentType = GetContentType(attachment.FileType, attachment.FileName);

                // Read file
                var fileBytes = await System.IO.File.ReadAllBytesAsync(attachment.FilePath);

                // Set headers
                var safeFileName = SanitizeFileName(attachment.FileName);
                
                // For images and PDFs, allow inline viewing unless download is explicitly requested
                var isViewable = IsViewableFileType(attachment.FileType, attachment.FileName);
                var disposition = (isViewable && !download) ? "inline" : "attachment";
                
                Response.Headers["Content-Disposition"] = $"{disposition}; filename=\"{safeFileName}\"";
                Response.Headers["Cache-Control"] = "private, max-age=3600";
                Response.Headers["X-Content-Type-Options"] = "nosniff";

                return File(fileBytes, contentType, attachment.FileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while serving the attachment", message = ex.Message });
            }
        }

        private string GetContentType(string fileType, string fileName)
        {
            // Try to get content type from file type first
            if (!string.IsNullOrEmpty(fileType))
            {
                var lower = fileType.ToLower();
                if (lower == "pdf") return "application/pdf";
                if (lower == "image" || lower.StartsWith("image/")) return GetImageContentType(fileName);
                if (lower == "document" || lower == "doc" || lower == "docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                if (lower == "excel" || lower == "xls" || lower == "xlsx") return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            }

            // Fallback to extension
            var extension = System.IO.Path.GetExtension(fileName).ToLowerInvariant();
            return extension switch
            {
                ".pdf" => "application/pdf",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".bmp" => "image/bmp",
                ".svg" => "image/svg+xml",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".xls" => "application/vnd.ms-excel",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".ppt" => "application/vnd.ms-powerpoint",
                ".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                ".txt" => "text/plain",
                ".zip" => "application/zip",
                ".rar" => "application/x-rar-compressed",
                _ => "application/octet-stream"
            };
        }

        private string GetImageContentType(string fileName)
        {
            var extension = System.IO.Path.GetExtension(fileName).ToLowerInvariant();
            return extension switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".bmp" => "image/bmp",
                ".svg" => "image/svg+xml",
                ".webp" => "image/webp",
                _ => "image/jpeg"
            };
        }

        private bool IsViewableFileType(string fileType, string? fileName = null)
        {
            // Check by file type first
            if (!string.IsNullOrEmpty(fileType))
            {
                var lower = fileType.ToLower();
                if (lower == "pdf") return true;
                if (lower == "image" || lower.StartsWith("image/")) return true;
            }

            // Check by file extension if fileType doesn't match
            if (!string.IsNullOrEmpty(fileName))
            {
                var extension = System.IO.Path.GetExtension(fileName).ToLowerInvariant();
                // PDF files
                if (extension == ".pdf") return true;
                // Image files
                if (extension == ".jpg" || extension == ".jpeg" || extension == ".png" || 
                    extension == ".gif" || extension == ".bmp" || extension == ".svg" || 
                    extension == ".webp") return true;
            }

            // Also check if fileType is just an extension (like ".png")
            if (!string.IsNullOrEmpty(fileType) && fileType.StartsWith("."))
            {
                var ext = fileType.ToLowerInvariant();
                if (ext == ".pdf") return true;
                if (ext == ".jpg" || ext == ".jpeg" || ext == ".png" || 
                    ext == ".gif" || ext == ".bmp" || ext == ".svg" || 
                    ext == ".webp") return true;
            }

            return false;
        }

        private string SanitizeFileName(string fileName)
        {
            // Remove or replace non-ASCII characters for the header
            return new string(fileName.Select(c => c < 128 ? c : '_').ToArray());
        }

        private string ConvertToRelativePath(string fullPath)
        {
            if (string.IsNullOrEmpty(fullPath))
                return string.Empty;

            // If already a relative path (starts with FileStorage or wwwroot), normalize it
            if (fullPath.StartsWith("FileStorage", StringComparison.OrdinalIgnoreCase))
            {
                return fullPath.Replace('\\', '/');
            }

            // Extract relative path from full Windows path
            // Look for "FileStorage" in the path (this is the folder we want to keep)
            var fileStoragePos = fullPath.IndexOf("FileStorage", StringComparison.OrdinalIgnoreCase);
            if (fileStoragePos >= 0)
            {
                var relativePart = fullPath.Substring(fileStoragePos);
                // Normalize path separators to forward slashes
                return relativePart.Replace('\\', '/');
            }

            // If FileStorage not found, try to extract from wwwroot
            var wwwrootPos = fullPath.IndexOf("wwwroot", StringComparison.OrdinalIgnoreCase);
            if (wwwrootPos >= 0)
            {
                var relativePart = fullPath.Substring(wwwrootPos + "wwwroot".Length);
                // Normalize path separators
                relativePart = relativePart.TrimStart('\\', '/').Replace('\\', '/');
                return relativePart;
            }

            // Fallback: return as is if we can't determine relative path
            return fullPath;
        }
    }
}

