using System;

namespace Core.Dtos.VisitorManagement
{
    public class VisitorDto
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string? NationalId { get; set; }
        public string? Phone { get; set; }
        public string? Company { get; set; }
        public string? MedicalNotes { get; set; }
        public string? PersonImageUrl { get; set; }
        public string? IdCardImageUrl { get; set; }
        public bool IsBlocked { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateVisitorDto
    {
        public string FullName { get; set; }
        public string? NationalId { get; set; }
        public string? Phone { get; set; }
        public string? Company { get; set; }
        public string? MedicalNotes { get; set; }
        public string? PersonImageUrl { get; set; }
        public string? IdCardImageUrl { get; set; }
    }

    public class BlockVisitorDto
    {
        public bool IsBlocked { get; set; }
        public string? BlockReason { get; set; }
    }

    public class VisitorDtoWithBase64 : VisitorDto
    {
        public string? PersonImageBase64 { get; set; }
        public string? IdCardImageBase64 { get; set; }
    }
}

