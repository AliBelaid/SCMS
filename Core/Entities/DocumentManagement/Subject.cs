namespace Core.Entities.DocumentManagement
{
    public class Subject : BaseEntity
    {
        public string Code { get; set; }
        public string NameAr { get; set; }
        public string NameEn { get; set; }
        public int DepartmentId { get; set; }
        public Department Department { get; set; }
        public string IncomingPrefix { get; set; }
        public string OutgoingPrefix { get; set; }
        public bool IsActive { get; set; } = true;
        public string CreatedBy { get; set; }
    }
}

