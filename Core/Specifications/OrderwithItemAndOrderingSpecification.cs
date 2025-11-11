using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Core.Entities.OrderAggregate;

namespace Core.Specifications
{
    public class OrderwithItemAndOrderingSpecification : BaseSpecifications<Order>
    {
        public OrderwithItemAndOrderingSpecification(string email): base(o=> o.BuyerEmail  
        ==email)
        {

            AddInclude( i=>i.OrderItems);
         AddInclude( i=>i.DelivaryMethod);
AddOrderByDescending(o=>o.OrderDate);
         
         
        }

        public OrderwithItemAndOrderingSpecification(int id,string email) : base(p=>p.Id==id && p.BuyerEmail==email)
        {
     AddInclude( i=>i.OrderItems);
         AddInclude( i=>i.DelivaryMethod);

        }
    }
}