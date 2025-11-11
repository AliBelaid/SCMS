// using System;
// using System.Collections.Generic;
// using System.IO;
// using System.Linq;
// using System.Threading.Tasks;
// using Microsoft.AspNetCore.Hosting;
// using Microsoft.AspNetCore.Http;
// using Microsoft.Extensions.Hosting;

// namespace API.Helpers
// {
//     public   class AddFileDtata
//     {
//         private readonly IWebHostEnvironment webHostEnvironment;
//         private readonly HttpContextAccessor httpContextAccessor;

//         public   AddFileDtata(IWebHostEnvironment webHostEnvironment ,HttpContextAccessor httpContextAccessor)
//         {
//             this.webHostEnvironment = webHostEnvironment;
//             this.httpContextAccessor = httpContextAccessor;
//         }
//  public   async Task<string> SaveFileAsync(IFormFile file)
// {
//     if (file == null || file.Length <= 0)
//     {
//         return null;
//     }

//     var uploadsFolder = Path.Combine(webHostEnvironment.WebRootPath, "uploads"); // Assuming "uploads" is the folder name under "wwwroot"
//     var fileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(file.FileName);
//     var filePath = Path.Combine(uploadsFolder, fileName);

//     using (var stream = new FileStream(filePath, FileMode.Create))
//     {
//         await file.CopyToAsync(stream);
//     }

//     return fileName;
// }

   


// public string GetFileUrl(string filePath)
// {
//     if (string.IsNullOrEmpty(filePath))
//     {
//         return null;
//     }

//     string baseUrl = httpContextAccessor.HttpContext.Request.Scheme + "://" +
//                      httpContextAccessor.HttpContext.Request.Host;
//     string fileUrl = baseUrl + "/uploads/" + filePath; // Assuming "uploads" is the folder name under "wwwroot"
//     return fileUrl;
// }



// }}