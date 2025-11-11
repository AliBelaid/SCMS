using System.Collections.Generic;

namespace Core.Entities.DocumentManagement
{
    public class Department : BaseEntity
    {
        public string Code { get; set; }
        public string NameAr { get; set; }
        public string NameEn { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; } = true;
        public string CreatedBy { get; set; }

        public ICollection<Subject> Subjects { get; set; } = new List<Subject>();
    }
}

