// using System;
// using System.Collections.Generic;
// using System.Diagnostics.Contracts;
// using System.IO;
// using System.Linq;
// using System.Threading.Tasks;
// using AutoMapper;
// using Core.SiteOpt;
// using Microsoft.AspNetCore.Http;
// using Contract = Core.SiteOpt.Contract;

// namespace API.Helpers
// {
   

     

// public class ConvertIFileReslove : IValueResolver<Core.SiteOpt.Contract, ContractToReturn, IFormFile>
// {
//     public IFormFile Resolve(Core.SiteOpt.Contract source, ContractToReturn destination, IFormFile destMember, ResolutionContext context)
//     {
//         return ConvertByteArrayToFormFile(source.ContractFile, "ContractFile");
//     }




//   public IFormFile ConvertByteArrayToFormFile(byte[] byteArray, string fileName)
// {
//     if (byteArray != null && byteArray.Length > 0)
//     {
//         var stream = new MemoryStream(byteArray);
//         return new FormFile(stream, 0, byteArray.Length, fileName, fileName);     
     
//     }
//     return null;
// }



// }

// public class OwnerFileByteArrayToFormFileResolver : IValueResolver<Contract, ContractToReturn, IFormFile>
// {
//     public IFormFile Resolve(Core.SiteOpt.Contract source, ContractToReturn destination, IFormFile destMember, ResolutionContext context)
//     {
//         return ConvertByteArrayToFormFile(source.Owner.OwnerFile, "OwnerFile");
//     }
//       public IFormFile ConvertByteArrayToFormFile(byte[] byteArray, string fileName)
// {
//     if (byteArray != null && byteArray.Length > 0)
//     {
//         var stream = new MemoryStream(byteArray);
//         return new FormFile(stream, 0, byteArray.Length, fileName, fileName);
//     }
//     return null;
// }

// }
    
// }