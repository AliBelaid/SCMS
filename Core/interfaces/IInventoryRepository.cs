using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Entities.Inventory;

namespace Core.interfaces
{
    public interface IInventoryRepository
    {
        Task<IEnumerable<InventoryItem>> GetAllInventoryItemsAsync();
        Task<InventoryItem> GetInventoryItemByIdAsync(int id);
        Task<InventoryItem> AddInventoryItemAsync(InventoryItem item);
        Task<bool> UpdateInventoryItemAsync(InventoryItem item);
        Task<bool> DeleteInventoryItemAsync(int id);
        
        Task<IEnumerable<InventoryTransaction>> GetItemTransactionsAsync(int itemId);
        Task<InventoryTransaction> AddTransactionAsync(InventoryTransaction transaction);
        
        Task<IEnumerable<InventoryItem>> GetLowStockItemsAsync();
        Task<IEnumerable<InventoryItem>> GetExpiredItemsAsync();
    }
} 