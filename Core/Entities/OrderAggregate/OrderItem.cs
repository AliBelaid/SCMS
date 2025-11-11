using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Core.Entities.OrderAggregate
{
    public class OrderItem:BaseEntity
    {
        public OrderItem()
        {
            
        }
        public OrderItem(ProductItemOrdered itemOrdered, decimal price, decimal quantity)
        {
            ItemOrdered = itemOrdered;
            Price = price;
            Quantity = quantity;
        }

        public   ProductItemOrdered ItemOrdered { get; set; }
        public decimal  Price{ get; set; }
        public decimal Quantity { get; set; }
        
        
        
        
        
        
    }
}