using Core.Entities.Identity;

namespace API.Dtos
{
    public class UpdateUserDto
    {
        public required string Id { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? DisplayName { get; set; }
        public UserType? UserType { get; set; }
    }
} 