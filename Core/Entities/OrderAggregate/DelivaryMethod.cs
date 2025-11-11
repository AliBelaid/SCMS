using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Core.Entities.OrderAggregate {
    public class DelivaryMethod : BaseEntity {
        public string ShortName { get; set; }
        public string DelivaryTime { get; set; }
        public string Description { get; set; }

        public decimal Price { get; set; }

    }
}