using System.Linq;
using API.Dtos;
using API.Helpers;
using AutoMapper;
using Core.Dtos.DocumentViewer;
using Core.Dtos.VisitorManagement;
using Core.Entities;
using Core.Entities.Identity;
using Core.Entities.DocumentViewer;
using Core.Entities.VisitorManagement;
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
        .ForMember(d => d.Role, o => o.MapFrom(s => s.UserRoles.FirstOrDefault() != null && s.UserRoles.FirstOrDefault().Role != null ? s.UserRoles.FirstOrDefault().Role.Name : "Member"));
      
      CreateMap<CreateUserDto, AppUser>()
        .ForMember(d => d.UserName, o => o.MapFrom(s => s.Code))
        .ForMember(d => d.Country, o => o.MapFrom(s => s.Country));
      
      CreateMap<Core.Dtos.DocumentViewer.UpdateUserDto, AppUser>();

      // Visitor Management Mappings
      CreateMap<Visitor, VisitorDto>()
        .ForMember(d => d.PersonImageUrl, o => o.MapFrom<VisitorPersonImageUrlResolver>())
        .ForMember(d => d.IdCardImageUrl, o => o.MapFrom<VisitorIdCardImageUrlResolver>());

      CreateMap<Visit, VisitDto>()
        .ForMember(d => d.CarImageUrl, o => o.MapFrom<VisitCarImageUrlResolver>());

      // Employee Mappings
      CreateMap<Employee, EmployeeDto>()
        .ForMember(d => d.DepartmentName, o => o.MapFrom(s => s.Department != null ? s.Department.Name : null))
        .ForMember(d => d.CardImageUrl, o => o.MapFrom<EmployeeCardImageUrlResolver>())
        .ForMember(d => d.FaceImageUrl, o => o.MapFrom<EmployeeFaceImageUrlResolver>());

      CreateMap<EmployeeAttendance, EmployeeAttendanceDto>()
        .ForMember(d => d.EmployeeName, o => o.MapFrom(s => s.Employee.EmployeeName))
        .ForMember(d => d.EmployeeEmployeeId, o => o.MapFrom(s => s.Employee.EmployeeId))
        .ForMember(d => d.DepartmentName, o => o.MapFrom(s => s.Employee.Department != null ? s.Employee.Department.Name : null));

      // Document Management - Order Attachment Mappings
      CreateMap<Core.Entities.DocumentManagement.OrderAttachment, Core.Dtos.DocumentManagement.OrderAttachmentDto>()
        .ForMember(d => d.Id, o => o.MapFrom(s => s.Id.ToString()))
        .ForMember(d => d.FileUrl, o => o.MapFrom<OrderAttachmentFileUrlResolver>())
        .ForMember(d => d.CanView, o => o.Ignore()) // Will be set manually
        .ForMember(d => d.CanDownload, o => o.Ignore()); // Will be set manually
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