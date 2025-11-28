using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Dtos.DocumentManagement;
using Core.Entities.DocumentManagement;
using Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace Infrastructure.Services
{
    public interface IOrderExpirationService
    {
        Task<bool> SetExpirationDateAsync(int orderId, int userId, DateTime expirationDate);
        Task<bool> RemoveExpirationDateAsync(int orderId, int userId);
        Task<List<Order>> GetExpiredOrdersAsync();
        Task<List<Order>> GetOrdersNearExpirationAsync(int days = 7);
        Task<List<ExpirationWarning>> GetExpirationWarningsAsync();
        Task<int> ArchiveExpiredOrdersAsync(int archivedById);
        Task<bool> ArchiveOrderAsync(int orderId, int archivedById, string reason);
        Task<List<ArchivedOrderDto>> GetArchivedOrdersAsync();
        Task<bool> RestoreArchivedOrderAsync(int archivedOrderId, int restoredById);
        Task<bool> PermanentlyDeleteArchivedOrderAsync(int archivedOrderId);
    }

    public class OrderExpirationService : IOrderExpirationService
    {
        private readonly AppIdentityDbContext _context;

        public OrderExpirationService(AppIdentityDbContext context)
        {
            _context = context;
        }

        public async Task<bool> SetExpirationDateAsync(int orderId, int userId, DateTime expirationDate)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
            {
                return false;
            }

            var oldDate = order.ExpirationDate;
            order.ExpirationDate = expirationDate;
            order.UpdatedAt = DateTime.UtcNow;
            order.UpdatedById = userId;

            AddHistoryEntry(orderId, userId, OrderAction.ExpirationSet,
                $"تم تحديد تاريخ الانتهاء {expirationDate:yyyy-MM-dd}",
                oldDate?.ToString("yyyy-MM-dd"),
                expirationDate.ToString("yyyy-MM-dd"));

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveExpirationDateAsync(int orderId, int userId)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
            {
                return false;
            }

            var oldDate = order.ExpirationDate;
            order.ExpirationDate = null;
            order.UpdatedAt = DateTime.UtcNow;
            order.UpdatedById = userId;

            AddHistoryEntry(orderId, userId, OrderAction.ExpirationRemoved,
                "تم إلغاء تاريخ الانتهاء",
                oldDate?.ToString("yyyy-MM-dd"),
                null);

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Order>> GetExpiredOrdersAsync()
        {
            var now = DateTime.UtcNow;
            return await _context.Orders
                .Where(o => !o.IsArchived && o.ExpirationDate.HasValue && o.ExpirationDate.Value < now)
                .Include(o => o.Department)
                .Include(o => o.Subject)
                .Include(o => o.CreatedBy)
                .ToListAsync();
        }

        public async Task<List<Order>> GetOrdersNearExpirationAsync(int days = 7)
        {
            var now = DateTime.UtcNow;
            var threshold = now.AddDays(days);

            return await _context.Orders
                .Where(o => !o.IsArchived && o.ExpirationDate.HasValue &&
                            o.ExpirationDate.Value > now && o.ExpirationDate.Value <= threshold)
                .Include(o => o.Department)
                .Include(o => o.Subject)
                .Include(o => o.CreatedBy)
                .OrderBy(o => o.ExpirationDate)
                .ToListAsync();
        }

        public async Task<List<ExpirationWarning>> GetExpirationWarningsAsync()
        {
            var orders = await GetOrdersNearExpirationAsync(14);

            var warnings = orders.Select(order => new ExpirationWarning
            {
                OrderId = order.Id,
                ReferenceNumber = order.ReferenceNumber,
                Title = order.Title,
                ExpirationDate = order.ExpirationDate!.Value,
                DaysUntilExpiration = (order.ExpirationDate.Value - DateTime.UtcNow).Days,
                Priority = order.Priority.ToString()
            })
            .OrderBy(w => w.DaysUntilExpiration)
            .ToList();

            return warnings;
        }

        public async Task<int> ArchiveExpiredOrdersAsync(int archivedById)
        {
            var expiredOrders = await GetExpiredOrdersAsync();
            var count = 0;

            foreach (var order in expiredOrders)
            {
                if (await ArchiveOrderAsync(order.Id, archivedById, "انتهاء صلاحية المعاملة تلقائياً"))
                {
                    count++;
                }
            }

            return count;
        }

        public async Task<bool> ArchiveOrderAsync(int orderId, int archivedById, string reason)
        {
            var order = await _context.Orders
                .Include(o => o.Department)
                .Include(o => o.Subject)
                .Include(o => o.CreatedBy)
                .Include(o => o.Attachments)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null || order.IsArchived)
            {
                return false;
            }

            var archivedOrder = new ArchivedOrder
            {
                OriginalOrderId = order.Id,
                ReferenceNumber = order.ReferenceNumber,
                Title = order.Title,
                Description = order.Description,
                Type = order.Type,
                Status = order.Status,
                Priority = order.Priority,
                DepartmentId = order.DepartmentId,
                DepartmentName = order.Department?.NameAr ?? order.Department?.NameEn,
                SubjectId = order.SubjectId,
                SubjectName = order.Subject?.NameAr ?? order.Subject?.NameEn,
                OriginalCreatedAt = order.CreatedAt,
                OriginalUpdatedAt = order.UpdatedAt,
                CompletedAt = order.CompletedAt,
                ExpirationDate = order.ExpirationDate ?? DateTime.UtcNow,
                ArchivedById = archivedById,
                ArchiveReason = reason,
                OriginalCreatedById = order.CreatedById,
                OriginalCreatedByName = order.CreatedBy?.UserName ?? order.CreatedById.ToString(),
                Notes = order.Notes,
                SerializedOrderData = JsonConvert.SerializeObject(new
                {
                    order.Id,
                    order.ReferenceNumber,
                    order.Title,
                    order.Description,
                    order.Type,
                    order.DepartmentId,
                    order.SubjectId,
                    order.Status,
                    order.Priority,
                    order.CreatedAt,
                    order.UpdatedAt,
                    order.DueDate,
                    order.CompletedAt,
                    order.Notes,
                    order.IsPublic
                }),
                AttachmentsInfo = order.Attachments != null && order.Attachments.Any()
                    ? JsonConvert.SerializeObject(order.Attachments.Select(a => new
                    {
                        a.FileName,
                        a.FileType,
                        a.FilePath,
                        a.FileSize
                    }))
                    : null,
                CanBeRestored = true
            };

            _context.ArchivedOrders.Add(archivedOrder);

            order.IsArchived = true;
            order.ArchivedAt = DateTime.UtcNow;
            order.ArchivedById = archivedById;
            order.ArchiveReason = reason;
            order.UpdatedAt = DateTime.UtcNow;
            order.UpdatedById = archivedById;

            AddHistoryEntry(orderId, archivedById, OrderAction.Archived,
                $"تم أرشفة المعاملة: {reason}");

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<ArchivedOrderDto>> GetArchivedOrdersAsync()
        {
            return await _context.ArchivedOrders
                .Include(ao => ao.ArchivedBy)
                .OrderByDescending(ao => ao.ArchivedAt)
                .Select(ao => new ArchivedOrderDto
                {
                    Id = ao.Id,
                    OriginalOrderId = ao.OriginalOrderId,
                    ReferenceNumber = ao.ReferenceNumber,
                    Title = ao.Title,
                    Description = ao.Description,
                    DepartmentName = ao.DepartmentName,
                    SubjectName = ao.SubjectName,
                    Priority = ao.Priority.ToString(),
                    Status = ao.Status.ToString(),
                    ArchivedAt = ao.ArchivedAt,
                    ExpirationDate = ao.ExpirationDate,
                    ArchiveReason = ao.ArchiveReason,
                    ArchivedByName = ao.ArchivedBy != null ? ao.ArchivedBy.UserName : null,
                    CanBeRestored = ao.CanBeRestored
                })
                .ToListAsync();
        }

        public async Task<bool> RestoreArchivedOrderAsync(int archivedOrderId, int restoredById)
        {
            var archivedOrder = await _context.ArchivedOrders.FindAsync(archivedOrderId);
            if (archivedOrder == null || !archivedOrder.CanBeRestored)
            {
                return false;
            }

            var order = await _context.Orders.FindAsync(archivedOrder.OriginalOrderId);
            if (order == null)
            {
                return false;
            }

            order.IsArchived = false;
            order.ArchivedAt = null;
            order.ArchivedById = null;
            order.ArchiveReason = null;
            order.UpdatedAt = DateTime.UtcNow;
            order.UpdatedById = restoredById;

            AddHistoryEntry(order.Id, restoredById, OrderAction.Restored,
                "تم استرجاع المعاملة من الأرشيف");

            _context.ArchivedOrders.Remove(archivedOrder);

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> PermanentlyDeleteArchivedOrderAsync(int archivedOrderId)
        {
            var archivedOrder = await _context.ArchivedOrders.FindAsync(archivedOrderId);
            if (archivedOrder == null)
            {
                return false;
            }

            var order = await _context.Orders
                .Include(o => o.Attachments)
                .Include(o => o.History)
                .Include(o => o.Permissions)
                .Include(o => o.DepartmentAccesses)
                .Include(o => o.UserExceptions)
                .FirstOrDefaultAsync(o => o.Id == archivedOrder.OriginalOrderId);

            if (order != null)
            {
                _context.OrderAttachments.RemoveRange(order.Attachments);
                _context.OrderHistories.RemoveRange(order.History);
                _context.OrderPermissions.RemoveRange(order.Permissions);
                _context.DepartmentAccesses.RemoveRange(order.DepartmentAccesses);
                _context.UserExceptions.RemoveRange(order.UserExceptions);
                _context.Orders.Remove(order);
            }

            _context.ArchivedOrders.Remove(archivedOrder);

            await _context.SaveChangesAsync();
            return true;
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
    }
}

