using System.Linq;
using API.Dtos;
using Core.Dtos.DocumentViewer;
using AutoMapper;
using Core.Entities;
using Core.Entities.Identity;
using Core.Entities.DocumentViewer;
using Microsoft.Extensions.Configuration;

namespace API.Helpers
{
  public class MappingProfiles : Profile
  {
    public MappingProfiles()
    {


   
 

      CreateMap<Core.Dtos.DocumentViewer.UpdateUserDto, AppUser>()
        .ForMember(d => d.Id, o => o.Ignore()) // Don't map Id
        .ForMember(d => d.UserRoles, o => o.Ignore());

 
      // Document Viewer Mappings
      CreateMap<Document, DocumentDto>()
        .ForMember(d => d.FileSizeFormatted, o => o.MapFrom(s => FormatFileSize(s.FileSize)));
      
      CreateMap<CreateDocumentDto, Document>();
      CreateMap<UpdateDocumentDto, Document>();
      
      CreateMap<AppUser, Core.Dtos.DocumentViewer.UserDto>()
        .ForMember(d => d.Code, o => o.MapFrom(s => s.CodeUser))
        .ForMember(d => d.Description, o => o.MapFrom(s => s.CodeUser))
        .ForMember(d => d.Country, o => o.MapFrom(s => s.Country))
        .ForMember(d => d.Role, o => o.MapFrom(s => s.UserRoles.FirstOrDefault() != null ? s.UserRoles.FirstOrDefault().Role.Name : "Member"));
      
      CreateMap<CreateUserDto, AppUser>()
        .ForMember(d => d.UserName, o => o.MapFrom(s => s.Code))
        .ForMember(d => d.Country, o => o.MapFrom(s => s.Country));
      
      CreateMap<Core.Dtos.DocumentViewer.UpdateUserDto, AppUser>();
    }
    
    private string FormatFileSize(long bytes)
    {
      if (bytes < 1024) return $"{bytes} B";
      if (bytes < 1024 * 1024) return $"{bytes / 1024.0:F1} KB";
      if (bytes < 1024 * 1024 * 1024) return $"{bytes / (1024.0 * 1024.0):F1} MB";
      return $"{bytes / (1024.0 * 1024.0 * 1024.0):F1} GB";
    }
  }
}