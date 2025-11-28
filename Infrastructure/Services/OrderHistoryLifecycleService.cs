using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Entities.DocumentManagement;
using Core.Interfaces;
using Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services
{
    /// <summary>
    /// Concrete implementation for managing order history lifecycle concerns
    /// </summary>
    public class OrderHistoryLifecycleService : IOrderHistoryLifecycleService
    {
        private readonly AppIdentityDbContext _context;
        private readonly ILogger<OrderHistoryLifecycleService> _logger;

        public OrderHistoryLifecycleService(
            AppIdentityDbContext context,
            ILogger<OrderHistoryLifecycleService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task DeleteOldHistoryAsync(int monthsToKeep = 3)
        {
            var cutoff = DateTime.UtcNow.AddMonths(-Math.Abs(monthsToKeep));

            var oldEntries = await _context.OrderHistories
                .Where(h => h.PerformedAt < cutoff)
                .ToListAsync();

            if (!oldEntries.Any())
            {
                return;
            }

            _context.OrderHistories.RemoveRange(oldEntries);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Removed {Count} order history entries older than {Months} months",
                oldEntries.Count,
                monthsToKeep);
        }

        public async Task<int> GetHistoryCountAsync(int orderId)
        {
            return await _context.OrderHistories
                .Where(h => h.OrderId == orderId)
                .CountAsync();
        }

        public async Task<List<OrderHistory>> GetOrderHistoryAsync(int orderId, int pageNumber = 1, int pageSize = 50)
        {
            if (pageNumber < 1)
            {
                pageNumber = 1;
            }

            if (pageSize < 1)
            {
                pageSize = 50;
            }

            return await _context.OrderHistories
                .Where(h => h.OrderId == orderId)
                .Include(h => h.PerformedBy)
                .OrderByDescending(h => h.PerformedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }
    }
}

