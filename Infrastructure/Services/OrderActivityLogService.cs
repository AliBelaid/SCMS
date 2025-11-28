using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Core.Dtos.DocumentManagement;
using Core.Entities.DocumentManagement;
using Core.Interfaces;
using Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services
{
    public class OrderActivityLogService : IOrderActivityLogService
    {
        private readonly AppIdentityDbContext _context;

        public OrderActivityLogService(AppIdentityDbContext context)
        {
            _context = context;
        }

        public async Task LogAsync(OrderActivityLogDto logEntry, CancellationToken cancellationToken = default)
        {
            if (logEntry == null)
            {
                throw new ArgumentNullException(nameof(logEntry));
            }

            var entity = new OrderActivityLog
            {
                OrderId = logEntry.OrderId,
                UserId = logEntry.UserId,
                UserName = logEntry.UserName ?? "Unknown",
                UserCode = logEntry.UserCode,
                ControllerName = logEntry.ControllerName ?? "Unknown",
                ActionName = logEntry.ActionName ?? "Unknown",
                HttpMethod = logEntry.HttpMethod ?? "GET",
                Path = logEntry.Path ?? string.Empty,
                QueryString = logEntry.QueryString,
                IsSuccess = logEntry.IsSuccess,
                StatusCode = logEntry.StatusCode,
                Summary = logEntry.Summary,
                PayloadSnapshot = logEntry.PayloadSnapshot,
                IpAddress = logEntry.IpAddress,
                UserAgent = logEntry.UserAgent,
                OccurredAt = logEntry.OccurredAt == default ? DateTime.UtcNow : logEntry.OccurredAt
            };

            await _context.OrderActivityLogs.AddAsync(entity, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<List<OrderActivityLogDto>> GetLogsForOrderAsync(int orderId, int pageSize = 100, CancellationToken cancellationToken = default)
        {
            return await _context.OrderActivityLogs
                .AsNoTracking()
                .Where(l => l.OrderId == orderId)
                .OrderByDescending(l => l.OccurredAt)
                .Take(Math.Max(1, pageSize))
                .Select(l => new OrderActivityLogDto
                {
                    Id = l.Id,
                    OrderId = l.OrderId,
                    UserId = l.UserId,
                    UserName = l.UserName,
                    UserCode = l.UserCode,
                    ControllerName = l.ControllerName,
                    ActionName = l.ActionName,
                    HttpMethod = l.HttpMethod,
                    Path = l.Path,
                    QueryString = l.QueryString,
                    IsSuccess = l.IsSuccess,
                    StatusCode = l.StatusCode,
                    Summary = l.Summary,
                    PayloadSnapshot = l.PayloadSnapshot,
                    IpAddress = l.IpAddress,
                    UserAgent = l.UserAgent,
                    OccurredAt = l.OccurredAt
                })
                .ToListAsync(cancellationToken);
        }

        public async Task<int> CleanupOldLogsAsync(TimeSpan retention, CancellationToken cancellationToken = default)
        {
            var retentionWindow = retention <= TimeSpan.Zero ? TimeSpan.FromDays(90) : retention;
            var cutoff = DateTime.UtcNow.Subtract(retentionWindow);

            var outdatedLogs = await _context.OrderActivityLogs
                .Where(l => l.OccurredAt < cutoff)
                .ToListAsync(cancellationToken);

            if (outdatedLogs.Count == 0)
            {
                return 0;
            }

            _context.OrderActivityLogs.RemoveRange(outdatedLogs);
            await _context.SaveChangesAsync(cancellationToken);
            return outdatedLogs.Count;
        }
    }
}

