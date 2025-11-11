using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Core.Entities.OrderAggregate
{
    public class Order:BaseEntity
    {

        public Order()
        {
            
        }
        public Order( IReadOnlyList<OrderItem> orderItems,
        string buyerEmail,
         Address shipAddress, 
        DelivaryMethod delivaryMethod, 
                decimal subtotal ,string paymentIntentId)
        {
            BuyerEmail = buyerEmail;
       
            ShipAddress = shipAddress;
            DelivaryMethod = delivaryMethod;
            OrderItems = orderItems;
            Subtotal = subtotal;
            PaymentIntentId=paymentIntentId;
         
        }
       
        public string BuyerEmail { get; set; }

       public DateTimeOffset OrderDate { get; set; } = DateTimeOffset.Now;

       public Address ShipAddress {get;set;}
      public DelivaryMethod  DelivaryMethod { get; set; }
        public IReadOnlyList<OrderItem> OrderItems { get; set; }
        public decimal Subtotal { get; set; }
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public string PaymentIntentId { get; set; }
         
        public decimal GetTotal(){
            return Subtotal +DelivaryMethod.Price;
        }
        
        
      
        
    }
}