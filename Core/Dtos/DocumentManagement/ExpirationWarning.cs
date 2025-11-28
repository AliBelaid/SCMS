using System;

namespace Core.Dtos.DocumentManagement
{
    public class ExpirationWarning
    {
        public int OrderId { get; set; }
        public string ReferenceNumber { get; set; }
        public string Title { get; set; }
        public DateTime ExpirationDate { get; set; }
        public int DaysUntilExpiration { get; set; }
        public string Priority { get; set; }
    }
}

