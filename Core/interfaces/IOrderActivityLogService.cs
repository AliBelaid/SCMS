using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Core.Dtos.DocumentManagement;

namespace Core.Interfaces
{
    public interface IOrderActivityLogService
    {
        Task LogAsync(OrderActivityLogDto logEntry, CancellationToken cancellationToken = default);
        Task<List<OrderActivityLogDto>> GetLogsForOrderAsync(int orderId, int pageSize = 100, CancellationToken cancellationToken = default);
        Task<int> CleanupOldLogsAsync(TimeSpan retention, CancellationToken cancellationToken = default);
    }
}

