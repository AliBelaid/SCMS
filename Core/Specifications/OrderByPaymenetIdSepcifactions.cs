using Core.Entities.OrderAggregate;

namespace Core.Specifications
{
    public class OrderByPaymenetIdSepcifactions:BaseSpecifications<Order>
    {
        public OrderByPaymenetIdSepcifactions(string PaymentId) :base(x=>x.PaymentIntentId ==PaymentId)
        {
            
        }
    } 

     
}