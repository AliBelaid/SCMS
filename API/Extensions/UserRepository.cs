using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Dtos;
using API.Helpers;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Core.Entities;
using Core.Entities.Identity;
using Core.Interfaces;
using Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Extensions
{
    public class UserRepository : API.Extensions.IUserRepository, Core.Interfaces.IUserRepository
    {
        private readonly AppIdentityDbContext _ctx;
        private readonly IMapper _mapper;

        public UserRepository(AppIdentityDbContext ctx, IMapper mapper)
        {
            _ctx = ctx;
            _mapper = mapper;
        }

        // Implementation for Core.Interfaces.IUserRepository - explicit implementation
        async Task<IEnumerable<User>> Core.Interfaces.IUserRepository.GetUsersAsync()
        {
            // Map AppUsers to User entities as needed
            var appUsers = await _ctx.Users.ToListAsync();
            return appUsers.Select(u => new User
            {
                Id = u.Id,
                Email = u.Email,
                UserName = u.UserName,
                PhoneNumber = u.PhoneNumber,
                        Code = u.CodeUser,
                UpdatedAt = u.LastActive
            }).ToList();
        }

        async Task<User> Core.Interfaces.IUserRepository.GetUserByIdAsync(int id)
        {
            var appUser = await _ctx.Users.FindAsync(id);
            if (appUser == null) return null;

            return new User
            {
                Id = appUser.Id,
                Email = appUser.Email,
                UserName = appUser.UserName,
                PhoneNumber = appUser.PhoneNumber,
                Code = appUser.CodeUser,
                UpdatedAt = appUser.LastActive
            };
        }

        async Task<User> Core.Interfaces.IUserRepository.GetUserByEmailAsync(string email)
        {
            var appUser = await _ctx.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (appUser == null) return null;

            return new User
            {
                Id = appUser.Id,
                Email = appUser.Email,
                UserName = appUser.UserName,
                PhoneNumber = appUser.PhoneNumber,
                Code = appUser.CodeUser,
                UpdatedAt = appUser.LastActive
            };
        }

        async Task<User> Core.Interfaces.IUserRepository.AddUserAsync(User user)
        {
            // This method is not fully implemented as it would need to create an AppUser
            // We'll just return the user for now
            return user;
        }

        async Task<User> Core.Interfaces.IUserRepository.UpdateUserAsync(User user)
        {
            // This method is not fully implemented
            // We'll just return the user for now
            return user;
        }

        async Task<bool> Core.Interfaces.IUserRepository.DeleteUserAsync(User user)
        {
            // This method is not fully implemented
            return true;
        }

        // Original IUserRepository implementation for API.Extensions.IUserRepository
        public void Add(AppUser User)
        {
            _ctx.Users.Add(User);
        }

        public void Delete(int id)
        {
            var user = _ctx.Users.Find(id);
            if (user != null)
            {
                _ctx.Users.Remove(user);
            }
        }

        public async Task<PageList<Member>> GetMembersAsync(UserParams userParams)
        {
            var query = _ctx.Users.Include(p => p.UserRoles).ThenInclude(i => i.Role)
                .AsQueryable();
                
            query = query.Where(i => i.UserName != userParams.CurrentUserName);
            
            query = userParams.OrderBy switch
            {
                "created" => query.OrderByDescending(i => i.LastActive),
                _ => query.OrderByDescending(i => i.LastActive),
            };

            return await PageList<Member>.CreateAsync(
                query.ProjectTo<Member>(_mapper.ConfigurationProvider).AsNoTracking(), 
                userParams.PageIndex, 
                userParams.PageSize);
        }

        public async Task<AppUser> GetUserByIdAsync(int id)
        {
            return await _ctx.Users.FindAsync(id);
        }

        public async Task<AppUser> GetUserByNameAsync(string UserName)
        {
            return await _ctx.Users
                .Include(p => p.UserRoles)
                .ThenInclude(i => i.Role)
                .SingleOrDefaultAsync(x => x.UserName == UserName);
        }

        public async Task<IEnumerable<AppUser>> GetUsersAsync()
        {
            return await _ctx.Users
                .Include(p => p.UserRoles)
                .ThenInclude(i => i.Role)
                .ToListAsync();
        }

        public async Task<bool> SaveAllAsync()
        {
            return await _ctx.SaveChangesAsync() > 0;
        }

        public void Update(AppUser User)
        {
            _ctx.Entry(User).State = EntityState.Modified;
        }
    }
} 