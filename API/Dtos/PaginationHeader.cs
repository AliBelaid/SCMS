using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Dtos
{
    public class PaginationHeader
    {
 
       
   

        public PaginationHeader(int itemPerPage, int currentPage, int totalItems, int totalPages)
        {
            ItemPerPage = itemPerPage;
            CurrentPage = currentPage;
            TotalItems = totalItems;
            TotalPages = totalPages;
        }

        public int ItemPerPage { get; set; }
        public int CurrentPage { get; set; }
        public int TotalItems { get; set; }
        public int TotalPages { get; set; }
        
         
    }
}