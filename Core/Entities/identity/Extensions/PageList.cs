using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Core.Entities.identity.Extensions
{
    public class PageList<T>   :List<T>    {
        public PageList(int PageNumber, int pageSize, int count, IEnumerable<T> items)
        {
            CurrentPage = PageNumber;
            PageSize = pageSize;
            TotalCount = count;
            TotalPages= (int) Math.Ceiling(count/(double) pageSize);
            AddRange(items);
        }

        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
    public int TotalPages { get; set; }
        public IReadOnlyList<T> item { get; set; }

        public static async Task<PageList<T>> CreateAsync(IQueryable<T> souers , int pageNumber,int pageSize) {

   var count = await souers.CountAsync();
   var items = await souers.Skip((pageNumber-1)*pageSize).Take(pageSize).ToListAsync();

   return new PageList<T>(pageNumber,pageSize ,count,items);
        }
         
    }
}