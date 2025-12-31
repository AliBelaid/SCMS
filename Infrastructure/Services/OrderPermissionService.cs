using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Dtos.DocumentManagement;
using Core.Entities.DocumentManagement;
using Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services
{
    public interface IOrderPermissionService
    {
        Task<EffectivePermissions> GetEffectivePermissionsAsync(int orderId, int userId);
        Task<bool> GrantUserPermissionAsync(int orderId, int grantedById, GrantUserPermissionDto dto);
        Task<bool> RevokeUserPermissionAsync(int orderId, int targetUserId);
        Task<bool> UpdateUserPermissionAsync(int orderId, int targetUserId, GrantUserPermissionDto dto);
        Task<List<UserPermissionDto>> GetOrderUserPermissionsAsync(int orderId);
        Task<bool> GrantDepartmentAccessAsync(int orderId, int grantedById, GrantDepartmentAccessDto dto);
        Task<bool> RevokeDepartmentAccessAsync(int orderId, int departmentId);
        Task<List<DepartmentAccessDto>> GetOrderDepartmentAccessesAsync(int orderId);
        Task<bool> AddUserExceptionAsync(int orderId, int createdById, AddUserExceptionDto dto);
        Task<bool> RemoveUserExceptionAsync(int orderId, int targetUserId);
        Task<List<UserExceptionDto>> GetOrderUserExceptionsAsync(int orderId);
        Task<bool> CanUserAccessOrderAsync(int orderId, int userId);
        Task<bool> CanUserDeleteOrderAsync(int orderId, int userId);
    }

    public class OrderPermissionService : IOrderPermissionService
    {
        private readonly AppIdentityDbContext _context;

        public OrderPermissionService(AppIdentityDbContext context)
        {
            _context = context;
        }

        public async Task<EffectivePermissions> GetEffectivePermissionsAsync(int orderId, int userId)
        {
            var order = await _context.Orders
                .Include(o => o.Permissions)
                    .ThenInclude(p => p.User)
                .Include(o => o.DepartmentAccesses)
                .Include(o => o.UserExceptions)
                .AsNoTracking()
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                return new EffectivePermissions();
            }

            var user = await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return new EffectivePermissions();
            }

            var now = DateTime.UtcNow;
            var isOwner = order.CreatedById == userId;
            var isAdmin = user.UserRoles?.Any(ur => string.Equals(ur.Role?.Name, "Admin", StringComparison.OrdinalIgnoreCase)) ?? false;

            // Check explicit user exceptions (deny list)
            var hasBlockingException = order.UserExceptions?.Any(e =>
                e.UserId == userId &&
                e.IsActive &&
                (!e.ExpiresAt.HasValue || e.ExpiresAt.Value > now)) ?? false;

            if (hasBlockingException && !isAdmin && !isOwner)
            {
                return new EffectivePermissions
                {
                    IsOwner = isOwner,
                    IsAdmin = isAdmin,
                    GrantedPermissions = new List<string>()
                };
            }

            var userPermissionTypes = order.Permissions?
                .Where(p => p.UserId == userId && p.IsActive && (!p.ExpiresAt.HasValue || p.ExpiresAt.Value > now))
                .Select(p => p.PermissionType)
                .ToList() ?? new List<PermissionType>();

            var departmentIdsForUser = await _context.DepartmentUsers
                .Where(du => du.UserId == userId && du.IsActive)
                .Select(du => du.DepartmentId)
                .ToListAsync();

            var departmentPermissions = order.DepartmentAccesses?
                .Where(a => departmentIdsForUser.Contains(a.DepartmentId))
                .ToList() ?? new List<OrderDepartmentAccess>();

            bool HasPermission(PermissionType type) => userPermissionTypes.Contains(type);

            bool DepartmentAllows(Func<OrderDepartmentAccess, bool> predicate) =>
                departmentPermissions.Any(predicate);

            var permissions = new EffectivePermissions
            {
                IsOwner = isOwner,
                IsAdmin = isAdmin
            };

            permissions.CanView =
                isOwner ||
                isAdmin ||
                order.IsPublic ||
                HasPermission(PermissionType.View) ||
                HasPermission(PermissionType.Edit) ||
                HasPermission(PermissionType.Delete) ||
                DepartmentAllows(a => a.CanView || a.CanEdit || a.CanShare);

            permissions.CanEdit =
                isOwner ||
                isAdmin ||
                HasPermission(PermissionType.Edit) ||
                DepartmentAllows(a => a.CanEdit);

            permissions.CanDelete =
                isOwner ||
                isAdmin ||
                HasPermission(PermissionType.Delete);

            permissions.CanShare =
                isOwner ||
                isAdmin ||
                HasPermission(PermissionType.Share) ||
                DepartmentAllows(a => a.CanShare);

            permissions.CanDownload =
                isOwner ||
                isAdmin ||
                HasPermission(PermissionType.Download) ||
                DepartmentAllows(a => a.CanDownload);

            permissions.CanApprove =
                isOwner ||
                isAdmin ||
                HasPermission(PermissionType.Approve);

            permissions.CanComment =
                isOwner ||
                isAdmin ||
                HasPermission(PermissionType.Comment);

            var granted = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            if (isOwner) granted.Add("Owner");
            if (isAdmin) granted.Add("Admin");
            foreach (var perm in userPermissionTypes)
            {
                granted.Add(perm.ToString());
            }

            if (departmentPermissions.Any())
            {
                granted.Add("DepartmentAccess");
            }

            if (order.IsPublic)
            {
                granted.Add("Public");
            }

            permissions.GrantedPermissions = granted.ToList();

            return permissions;
        }

        public async Task<bool> GrantUserPermissionAsync(int orderId, int grantedById, GrantUserPermissionDto dto)
        {
            var order = await _context.Orders
                .Include(o => o.Permissions)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                return false;
            }

            ApplyUserPermissionChanges(order, grantedById, dto);

            order.UpdatedAt = DateTime.UtcNow;
            order.UpdatedById = grantedById;

            var summary = BuildUserPermissionsSummary(dto);
            AddHistoryEntry(orderId, grantedById, OrderAction.PermissionGranted,
                $"تم تحديث صلاحيات المستخدم {dto.UserId}: {summary}", null, summary);

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RevokeUserPermissionAsync(int orderId, int targetUserId)
        {
            var permissions = await _context.OrderPermissions
                .Where(p => p.OrderId == orderId && p.UserId == targetUserId && p.IsActive)
                .ToListAsync();

            if (!permissions.Any())
            {
                return false;
            }

            foreach (var permission in permissions)
            {
                permission.IsActive = false;
                permission.ExpiresAt = DateTime.UtcNow;
            }

            AddHistoryEntry(orderId, permissions.First().GrantedById, OrderAction.PermissionRevoked,
                $"تم إلغاء صلاحيات المستخدم {targetUserId}");

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateUserPermissionAsync(int orderId, int targetUserId, GrantUserPermissionDto dto)
        {
            var order = await _context.Orders
                .Include(o => o.Permissions)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                return false;
            }

            dto.UserId = targetUserId;
            var existingPermission = order.Permissions.FirstOrDefault(p => p.UserId == targetUserId);
            var grantedById = existingPermission?.GrantedById ?? dto.UserId;

            ApplyUserPermissionChanges(order, grantedById, dto);

            order.UpdatedAt = DateTime.UtcNow;
            order.UpdatedById = grantedById;

            var summary = BuildUserPermissionsSummary(dto);
            AddHistoryEntry(orderId, grantedById, OrderAction.PermissionGranted,
                $"تحديث صلاحيات المستخدم {targetUserId}", null, summary);

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<UserPermissionDto>> GetOrderUserPermissionsAsync(int orderId)
        {
            var permissions = await _context.OrderPermissions
                .Include(p => p.User)
                .Include(p => p.GrantedBy)
                .Where(p => p.OrderId == orderId)
                .ToListAsync();

            var now = DateTime.UtcNow;

            return permissions
                .GroupBy(p => p.UserId)
                .Select(group =>
                {
                    bool HasActivePermission(PermissionType type) => group.Any(p => p.PermissionType == type && p.IsActive);
                    DateTime grantedAt = group.Max(p => p.GrantedAt);
                    var activePermissions = group.Where(p => p.IsActive).ToList();

                    return new UserPermissionDto
                    {
                        UserId = group.Key,
                        UserCode = group.First().User?.UserName,
                        UserEmail = group.First().User?.Email,
                        UserName = group.First().User?.UserName,
                        Email = group.First().User?.Email,
                        CanView = HasActivePermission(PermissionType.View),
                        CanEdit = HasActivePermission(PermissionType.Edit),
                        CanDelete = HasActivePermission(PermissionType.Delete),
                        CanShare = HasActivePermission(PermissionType.Share),
                        CanDownload = HasActivePermission(PermissionType.Download),
                        CanPrint = HasActivePermission(PermissionType.Print),
                        CanComment = HasActivePermission(PermissionType.Comment),
                        CanApprove = HasActivePermission(PermissionType.Approve),
                        GrantedAt = grantedAt,
                        ExpiresAt = activePermissions
                            .Where(p => p.ExpiresAt.HasValue)
                            .OrderBy(p => p.ExpiresAt)
                            .Select(p => (DateTime?)p.ExpiresAt)
                            .FirstOrDefault(),
                        IsExpired = activePermissions.All(p => p.ExpiresAt.HasValue && p.ExpiresAt.Value < now) && activePermissions.Any(),
                        IsActive = activePermissions.Any(),
                        Notes = activePermissions.Select(p => p.Notes).FirstOrDefault(n => !string.IsNullOrWhiteSpace(n)),
                        GrantedByName = group.OrderByDescending(p => p.GrantedAt)
                            .Select(p => p.GrantedBy?.UserName)
                            .FirstOrDefault(name => !string.IsNullOrWhiteSpace(name))
                    };
                })
                .OrderByDescending(p => p.GrantedAt)
                .ToList();
        }

        public async Task<bool> GrantDepartmentAccessAsync(int orderId, int grantedById, GrantDepartmentAccessDto dto)
        {
            var order = await _context.Orders
                .Include(o => o.DepartmentAccesses)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                return false;
            }

            // Parse department ID from string to int
            if (!int.TryParse(dto.DepartmentId, out int departmentId))
            {
                return false;
            }

            var department = await _context.Departments.FindAsync(departmentId);
            if (department == null)
            {
                return false;
            }

            var access = order.DepartmentAccesses
                .FirstOrDefault(a => a.DepartmentId == departmentId);

            var (canView, canEdit, canDownload, canShare) = ResolveDepartmentAccessFlags(dto.AccessLevel);

            if (access == null)
            {
                access = new OrderDepartmentAccess
                {
                    OrderId = orderId,
                    DepartmentId = departmentId,
                    GrantedById = grantedById,
                    GrantedAt = DateTime.UtcNow,
                    CanView = canView,
                    CanEdit = canEdit,
                    CanDownload = canDownload,
                    CanShare = canShare,
                    Notes = dto.Notes
                };

                _context.DepartmentAccesses.Add(access);
            }
            else
            {
                access.CanView = canView;
                access.CanEdit = canEdit;
                access.CanDownload = canDownload;
                access.CanShare = canShare;
                access.Notes = dto.Notes;
                access.GrantedAt = DateTime.UtcNow;
                access.GrantedById = grantedById;
            }

            order.UpdatedAt = DateTime.UtcNow;
            order.UpdatedById = grantedById;

            var summary = GetAccessLevelLabel(dto.AccessLevel);
            AddHistoryEntry(orderId, grantedById, OrderAction.DepartmentAccessGranted,
                $"منح صلاحيات للقسم {department.NameAr ?? department.NameEn}",
                null,
                summary);

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RevokeDepartmentAccessAsync(int orderId, int departmentId)
        {
            var access = await _context.DepartmentAccesses
                .FirstOrDefaultAsync(a => a.OrderId == orderId && a.DepartmentId == departmentId);

            if (access == null)
            {
                return false;
            }

            _context.DepartmentAccesses.Remove(access);

            AddHistoryEntry(orderId, access.GrantedById, OrderAction.DepartmentAccessRevoked,
                $"إلغاء صلاحيات القسم {departmentId}");

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<DepartmentAccessDto>> GetOrderDepartmentAccessesAsync(int orderId)
        {
            var accesses = await _context.DepartmentAccesses
                .Include(a => a.Department)
                .Include(a => a.GrantedBy)
                .Where(a => a.OrderId == orderId)
                .OrderByDescending(a => a.GrantedAt)
                .ToListAsync();

            return accesses.Select(a =>
            {
                var accessLevel = DetermineAccessLevel(a);
                return new DepartmentAccessDto
                {
                    DepartmentId = a.DepartmentId,
                    DepartmentCode = a.Department?.Code,
                    DepartmentNameAr = a.Department?.NameAr,
                    DepartmentName = a.Department?.NameAr ?? a.Department?.NameEn,
                    AccessLevel = accessLevel,
                    AccessLevelName = GetAccessLevelLabel(accessLevel),
                    CanView = a.CanView,
                    CanEdit = a.CanEdit,
                    CanDownload = a.CanDownload,
                    CanShare = a.CanShare,
                    Notes = a.Notes,
                    GrantedAt = a.GrantedAt,
                    GrantedByName = a.GrantedBy?.UserName
                };
            }).ToList();
        }

        public async Task<bool> AddUserExceptionAsync(int orderId, int createdById, AddUserExceptionDto dto)
        {
            var order = await _context.Orders
                .Include(o => o.UserExceptions)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                return false;
            }

            var exception = order.UserExceptions
                .FirstOrDefault(e => e.UserId == dto.UserId);

            if (exception == null)
            {
                exception = new OrderUserException
                {
                    OrderId = orderId,
                    UserId = dto.UserId,
                    CreatedById = createdById,
                    CreatedAt = DateTime.UtcNow,
                    ExpiresAt = dto.ExpiresAt,
                    Reason = dto.Reason,
                    IsActive = true
                };

                _context.UserExceptions.Add(exception);
            }
            else
            {
                exception.IsActive = true;
                exception.CreatedAt = DateTime.UtcNow;
                exception.CreatedById = createdById;
                exception.ExpiresAt = dto.ExpiresAt;
                exception.Reason = dto.Reason;
            }

            AddHistoryEntry(orderId, createdById, OrderAction.UserExceptionAdded,
                $"تم استثناء المستخدم {dto.UserId} من المعاملة",
                null,
                dto.Reason);

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveUserExceptionAsync(int orderId, int targetUserId)
        {
            var exception = await _context.UserExceptions
                .FirstOrDefaultAsync(e => e.OrderId == orderId && e.UserId == targetUserId && e.IsActive);

            if (exception == null)
            {
                return false;
            }

            exception.IsActive = false;
            exception.ExpiresAt = DateTime.UtcNow;

            AddHistoryEntry(orderId, exception.CreatedById, OrderAction.UserExceptionRemoved,
                $"تم إلغاء استثناء المستخدم {targetUserId}");

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<UserExceptionDto>> GetOrderUserExceptionsAsync(int orderId)
        {
            return await _context.UserExceptions
                .Include(e => e.User)
                .Include(e => e.CreatedBy)
                .Where(e => e.OrderId == orderId)
                .OrderByDescending(e => e.CreatedAt)
                .Select(e => new UserExceptionDto
                {
                    UserId = e.UserId,
                    UserCode = e.User != null ? e.User.UserName : null,
                    UserEmail = e.User != null ? e.User.Email : null,
                    UserName = e.User != null ? e.User.UserName : null,
                    Email = e.User != null ? e.User.Email : null,
                    Reason = e.Reason,
                    AddedAt = e.CreatedAt,
                    CreatedAt = e.CreatedAt,
                    ExpiresAt = e.ExpiresAt,
                    IsExpired = e.ExpiresAt.HasValue && e.ExpiresAt.Value < DateTime.UtcNow,
                    IsActive = e.IsActive,
                    AddedByName = e.CreatedBy != null ? e.CreatedBy.UserName : null
                })
                .ToListAsync();
        }

        public async Task<bool> CanUserAccessOrderAsync(int orderId, int userId)
        {
            var permissions = await GetEffectivePermissionsAsync(orderId, userId);
            return permissions.IsAdmin
                || permissions.IsOwner
                || permissions.CanView
                || permissions.CanEdit;
        }

        public async Task<bool> CanUserDeleteOrderAsync(int orderId, int userId)
        {
            var permissions = await GetEffectivePermissionsAsync(orderId, userId);
            return permissions.IsAdmin || permissions.IsOwner || permissions.CanDelete;
        }

        private void ApplyUserPermissionChanges(Order order, int grantedById, GrantUserPermissionDto dto)
        {
            var permissionCollection = order.Permissions ??= new List<OrderPermission>();

            var requestedPermissions = ExtractPermissionTypes(dto);
            var existingPermissions = permissionCollection
                .Where(p => p.UserId == dto.UserId)
                .ToList();

            foreach (var type in requestedPermissions)
            {
                var permission = existingPermissions.FirstOrDefault(p => p.PermissionType == type);
                if (permission == null)
                {
                    permission = new OrderPermission
                    {
                        OrderId = order.Id,
                        UserId = dto.UserId,
                        PermissionType = type,
                        GrantedById = grantedById,
                        GrantedAt = DateTime.UtcNow,
                        ExpiresAt = dto.ExpiresAt,
                        IsActive = true,
                        Notes = dto.Notes
                    };

                    _context.OrderPermissions.Add(permission);
                    permissionCollection.Add(permission);
                }
                else
                {
                    permission.IsActive = true;
                    permission.GrantedAt = DateTime.UtcNow;
                    permission.GrantedById = grantedById;
                    permission.ExpiresAt = dto.ExpiresAt;
                    permission.Notes = dto.Notes;
                }
            }

            foreach (var permission in existingPermissions.Where(p => !requestedPermissions.Contains(p.PermissionType)))
            {
                permission.IsActive = false;
                permission.ExpiresAt = DateTime.UtcNow;
            }
        }

        private static List<PermissionType> ExtractPermissionTypes(GrantUserPermissionDto dto)
        {
            var permissions = new List<PermissionType>();

            if (dto.CanView) permissions.Add(PermissionType.View);
            if (dto.CanEdit) permissions.Add(PermissionType.Edit);
            if (dto.CanDelete) permissions.Add(PermissionType.Delete);
            if (dto.CanShare) permissions.Add(PermissionType.Share);
            if (dto.CanDownload) permissions.Add(PermissionType.Download);
            if (dto.CanPrint) permissions.Add(PermissionType.Print);
            if (dto.CanComment) permissions.Add(PermissionType.Comment);
            if (dto.CanApprove) permissions.Add(PermissionType.Approve);

            return permissions;
        }

        private static (bool canView, bool canEdit, bool canDownload, bool canShare) ResolveDepartmentAccessFlags(int accessLevel)
        {
            return accessLevel switch
            {
                >= 3 => (true, true, true, true),
                2 => (true, true, false, false),
                _ => (true, false, false, false)
            };
        }

        private static int DetermineAccessLevel(OrderDepartmentAccess access)
        {
            if (access.CanShare && access.CanDownload && access.CanEdit)
            {
                return 3;
            }

            if (access.CanEdit)
            {
                return 2;
            }

            return 1;
        }

        private static string GetAccessLevelLabel(int level)
        {
            return level switch
            {
                3 => "كامل",
                2 => "تعديل",
                _ => "عرض فقط"
            };
        }

        private void AddHistoryEntry(int orderId, int performedById, OrderAction action, string description, string? oldValue = null, string? newValue = null)
        {
            _context.OrderHistories.Add(new OrderHistory
            {
                OrderId = orderId,
                Action = action,
                Description = description,
                OldValue = oldValue,
                NewValue = newValue,
                PerformedById = performedById
            });
        }

        private static string BuildUserPermissionsSummary(GrantUserPermissionDto dto)
        {
            var summaryParts = new List<string>();
            if (dto.CanView) summaryParts.Add("عرض");
            if (dto.CanEdit) summaryParts.Add("تعديل");
            if (dto.CanDelete) summaryParts.Add("حذف");
            if (dto.CanShare) summaryParts.Add("مشاركة");
            if (dto.CanDownload) summaryParts.Add("تحميل");
            if (dto.CanPrint) summaryParts.Add("طباعة");
            if (dto.CanComment) summaryParts.Add("تعليق");
            if (dto.CanApprove) summaryParts.Add("اعتماد");

            return summaryParts.Count == 0 ? "لا توجد صلاحيات" : string.Join(", ", summaryParts);
        }
    }
}

