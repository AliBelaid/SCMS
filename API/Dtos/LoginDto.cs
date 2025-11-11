using System.ComponentModel.DataAnnotations;

namespace API.Dtos
{
    public class LoginDto
    {
        [Required]
        public string Code { get; set; }
        
        [Required]
        public string Password { get; set; }
    }
}