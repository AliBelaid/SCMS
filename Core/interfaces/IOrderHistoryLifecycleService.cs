using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Entities.DocumentManagement;

namespace Core.Interfaces
{
    /// <summary>
    /// Abstraction for working with order history lifecycle operations
    /// </summary>
    public interface IOrderHistoryLifecycleService
    {
        /// <summary>
        /// Delete history entries older than the configured retention window
        /// </summary>
        /// <param name="monthsToKeep">Retention window in months (defaults to 3)</param>
        Task DeleteOldHistoryAsync(int monthsToKeep = 3);

        /// <summary>
        /// Returns the total number of history entries for a specific order
        /// </summary>
        Task<int> GetHistoryCountAsync(int orderId);

        /// <summary>
        /// Returns paginated history entries for a specific order ordered by newest first
        /// </summary>
        Task<List<OrderHistory>> GetOrderHistoryAsync(int orderId, int pageNumber = 1, int pageSize = 50);
    }
}

