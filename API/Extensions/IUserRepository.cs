using System.Collections.Generic;
using System.Threading.Tasks;
using API.Dtos;
using API.Helpers;
using Core.Entities.Identity;

namespace API.Extensions {
    public interface IUserRepository  {
        void Update(AppUser User);
        Task<bool> SaveAllAsync();
        Task<IEnumerable<AppUser>> GetUsersAsync();
        Task<AppUser> GetUserByIdAsync(int id);
        Task<AppUser> GetUserByNameAsync(string UserName);
        Task<PageList<Member>> GetMembersAsync(UserParams userParams);
        void Add(AppUser User);
        void Delete(int id);
    }
}