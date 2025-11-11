using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Core.Entities.Identity;
using Core.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructure.Services
{
    public class TokenService : ITokenService
    {
        private readonly SymmetricSecurityKey _key;
        private readonly IConfiguration _config; 
        private readonly UserManager<AppUser> _userManager;
        private readonly ILogger<TokenService>? _logger;

        public TokenService(IConfiguration config, UserManager<AppUser> userManager, ILogger<TokenService>? logger = null)
        {
            _config = config;
            _userManager = userManager;
            _logger = logger;
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Token:Key"]));
        }

        public async Task<string> CreateToken(AppUser user)
        {
            try
            {
                // Basic claims
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.UserName ?? "unknown"),
                    new Claim(ClaimTypes.Email, user.Email ?? "unknown@example.com"),
                };

                // Add role claims
                try
                {
                    var roles = await _userManager.GetRolesAsync(user);
                    claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Error retrieving user roles for token");
                }

                // Add optional claims if available
                if (!string.IsNullOrEmpty(user.PhoneNumber))
                {
                    claims.Add(new Claim(ClaimTypes.MobilePhone, user.PhoneNumber));
                }

                var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);

                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(claims),
                    Expires = DateTime.UtcNow.AddDays(7),
                    SigningCredentials = creds,
                    Issuer = _config["Token:Issuer"]
                };

                var tokenHandler = new JwtSecurityTokenHandler();
                var token = tokenHandler.CreateToken(tokenDescriptor);

                _logger?.LogInformation($"Token generated for user {user.Id} with {claims.Count} claims");
                
                return tokenHandler.WriteToken(token);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error creating authentication token");
                throw;
            }
        }
    }
}
