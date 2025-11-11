using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Dtos;
using AutoMapper;
using Core.Entities;
using Core.Entities.Identity;
using Core.Entities.OrderAggregate;
using Microsoft.Extensions.Configuration;
using Microsoft.ReportingServices.ReportProcessing.ReportObjectModel;

namespace API.Helpers {
    public class UserUrlMianResolver : IValueResolver<AppUser, UserDto, string> {
        private readonly IConfiguration _config;

        public UserUrlMianResolver (IConfiguration config) {
            _config = config;
        }
        public string? Resolve (AppUser source, UserDto destination, string destMember, ResolutionContext context) {

            // if (!string.IsNullOrEmpty (source.PathImage)) {
            //     return _config["ApiUrl"] + source.PathImage;
            // }
            return null;
        }
    }
}