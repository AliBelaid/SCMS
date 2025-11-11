using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Dtos;
using API.Extensions;
using API.Helpers;
using AutoMapper;
using Core.Entities.Identity;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;

namespace API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : BaseController {

        private readonly IMapper _mapper;
        private readonly API.Extensions.IUserRepository _userRepository;
        private readonly UserManager<AppUser> _userManager;
        private readonly ITokenService _tokenService;
      
        public UserController(API.Extensions.IUserRepository userRepository, 
                            UserManager<AppUser> userManager,
                            ITokenService tokenService,
                            IMapper mapper) 
        {
            _userRepository = userRepository;
            _userManager = userManager;
            _tokenService = tokenService;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Member>>> GetUsers([FromQuery]UserParams userParams)
        {
            var user = await _userManager.FindByEmailFromClaimsPrincipal(HttpContext.User);
            userParams.CurrentUserName = user.CodeUser;
            
            var users = await _userRepository.GetMembersAsync(userParams);
           
            Response.AddPaginationHeader(users.PageSize, users.CurrentPage, users.TotalCount, users.TotalPages);
            return Ok(users);
        }

        [Authorize]
        [HttpGet("GetCurrent")]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            var userDto = await _userManager.FindByEmailFromClaimsPrincipal(this.User);
            var user = await _userRepository.GetUserByIdAsync(userDto.Id);

            var userToSend = _mapper.Map<UserDto>(user);
            userToSend.Token = await _tokenService.CreateToken(user);
            return userToSend;
        }
       
        [HttpGet("{username}", Name ="GetUser")]
        public async Task<ActionResult<UserDto>> GetUserByName(string username)
        {      
            var user = await _userRepository.GetUserByNameAsync(username);
            var userToSend = _mapper.Map<UserDto>(user);
            userToSend.Token = await _tokenService.CreateToken(user);
            return userToSend;
        }

        [HttpPut]
        public async Task<ActionResult> UpdateUser(MemberUpdateDto memberUpdateDto)
        {
            var user = await _userManager.FindByEmailFromClaimsPrincipal(HttpContext.User);
            
            _mapper.Map(memberUpdateDto, user);
            _userRepository.Update(user);
            
            if (await _userRepository.SaveAllAsync())
                return NoContent();

            return BadRequest("Failed to update user");
        }

        // [HttpPost ("add-photo")]
        // public async Task<ActionResult<PhotoDto>> AddPhoto (IFormFile file) {
        //     var user = await _userManger.FindByUserClaimsWithAddressAsync (HttpContext.User);
        //     var result = await _repoPhoto.AddPhotoAsync (file);
        //     if (result.Error != null) {
        //          return BadRequest(result.Error.Message);
        //     }
        //     var photo = new Photo {
        //         Url = result.SecureUrl.AbsoluteUri,
        //         PublicId = result.PublicId
        //     };
        //     if(user.Photos !=null) {

           
        //    if(user.Photos.Count() ==0 ) {
        //         photo.IsMain =true;
        //     } else {
        //         photo.IsMain =false;
        //     }
        //     }
          
        //     user.Photos.Add(photo);
        //     if(await _userProduct.SaveAllAsync()) {
        //         return CreatedAtRoute("GetUser", new{ username=user.UserName},_mapper.Map<PhotoDto>(photo));
        //     }
        //     return BadRequest("Problem adding photo");
        // }
        //

         

    }
}