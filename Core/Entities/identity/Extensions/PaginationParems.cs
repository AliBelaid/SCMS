using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Core.Entities.identity.Extensions {
    public class PaginationParems {
 
        private const int MaxPageSize = 50;
        public int PageIndex { get; set; } = 1;
              private int _pageSize = 10;

        public int PageSize {
            get => _pageSize;
            set => _pageSize = (value > MaxPageSize) ? MaxPageSize : value;

        }
        
        
  
    }
}