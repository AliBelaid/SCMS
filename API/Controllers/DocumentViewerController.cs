using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Core.Dtos.DocumentViewer;
using Core.Entities.DocumentViewer;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentViewerController : BaseController
    {
        private readonly IDocumentService _documentService;
        private readonly IMapper _mapper;

        public DocumentViewerController(IDocumentService documentService, IMapper mapper)
        {
            _documentService = documentService;
            _mapper = mapper;
        }

        [HttpPost("upload")]
        [Authorize]
        public async Task<ActionResult<DocumentDto>> UploadDocument([FromForm] IFormFile file, [FromForm] string? description, [FromForm] string? tags, [FromForm] string? category, [FromForm] string? excludedUsers)
        {
            try
            {
                Console.WriteLine($"DocumentViewerController.UploadDocument: Received request");
                Console.WriteLine($"DocumentViewerController.UploadDocument: File is null: {file == null}");
                Console.WriteLine($"DocumentViewerController.UploadDocument: File length: {file?.Length}");
                Console.WriteLine($"DocumentViewerController.UploadDocument: File name: {file?.FileName}");
                Console.WriteLine($"DocumentViewerController.UploadDocument: Description: {description}");
                Console.WriteLine($"DocumentViewerController.UploadDocument: Tags: {tags}");
                Console.WriteLine($"DocumentViewerController.UploadDocument: Category: {category}");
                Console.WriteLine($"DocumentViewerController.UploadDocument: ExcludedUsers: {excludedUsers}");
                
                // Check if file is provided
                if (file == null || file.Length == 0)
                {
                    Console.WriteLine($"DocumentViewerController.UploadDocument: File validation failed - file is null or empty");
                    return BadRequest(new { error = "No file provided or file is empty" });
                }

                // Check file size (300MB limit)
                const long maxFileSize = 300 * 1024 * 1024; // 300MB
                if (file.Length > maxFileSize)
                {
                    Console.WriteLine($"DocumentViewerController.UploadDocument: File size validation failed - size: {file.Length}");
                    return BadRequest(new { error = $"File size ({file.Length / 1024 / 1024}MB) exceeds the maximum allowed size of 300MB" });
                }

                // Debug authentication
                var claims = User.Claims.Select(c => $"{c.Type}: {c.Value}").ToList();
                Console.WriteLine($"DocumentViewerController.UploadDocument: User claims: {string.Join(", ", claims)}");
                
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                Console.WriteLine($"DocumentViewerController.UploadDocument: UserId: {userId}");
                
                if (userId == 0) return Unauthorized();

                // Check if user has upload permissions (Admin or Uploader role)
                var userRoles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
                Console.WriteLine($"DocumentViewerController.UploadDocument: User roles: {string.Join(", ", userRoles)}");
                
                if (!userRoles.Contains("Admin") && !userRoles.Contains("Uploader"))
                {
                    Console.WriteLine($"DocumentViewerController.UploadDocument: User does not have upload permissions");
                    return Forbid("You do not have permission to upload files. Only Admin and Uploader roles can upload files.");
                }

                var documentDto = new CreateDocumentDto
                {
                    FileName = file.FileName,
                    FileType = Path.GetExtension(file.FileName).ToLowerInvariant(),
                    FileSize = file.Length,
                    Description = description ?? string.Empty,
                    Tags = tags ?? string.Empty,
                    Category = category ?? "General",
                    ExcludedUsers = !string.IsNullOrEmpty(excludedUsers) ? excludedUsers.Split(',').Select(u => u.Trim()).ToList() : new List<string>()
                };

                Console.WriteLine($"DocumentViewerController.UploadDocument: Created document DTO: {documentDto.FileName}, Type: {documentDto.FileType}, Size: {documentDto.FileSize}");

                var document = await _documentService.UploadDocumentAsync(file, documentDto, userId);
                var documentDtoResult = _mapper.Map<DocumentDto>(document);
                
                Console.WriteLine($"DocumentViewerController.UploadDocument: Successfully uploaded document with ID: {document.Id}");
                return Ok(documentDtoResult);
            }
            catch (ArgumentException ex)
            {
                Console.WriteLine($"DocumentViewerController.UploadDocument: ArgumentException: {ex.Message}");
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DocumentViewerController.UploadDocument: Error: {ex.Message}");
                Console.WriteLine($"DocumentViewerController.UploadDocument: Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { error = "An error occurred while uploading the document" });
            }
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<DocumentDto>>> GetDocuments()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                Console.WriteLine($"DocumentViewerController.GetDocuments: UserId: {userId}");
                
                if (userId == 0) return Unauthorized();

                var documents = await _documentService.GetDocumentsForUserAsync(userId);
                Console.WriteLine($"DocumentViewerController.GetDocuments: Found {documents.Count()} documents");
                
                var documentDtos = _mapper.Map<IEnumerable<DocumentDto>>(documents);
                Console.WriteLine($"DocumentViewerController.GetDocuments: Mapped {documentDtos.Count()} DTOs");
                
                return Ok(documentDtos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DocumentViewerController.GetDocuments: Error: {ex.Message}");
                return StatusCode(500, new { error = "An error occurred while retrieving documents" });
            }
        }

        [HttpGet("all")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<DocumentDto>>> GetAllDocuments()
        {
            try
            {
                var documents = await _documentService.GetAllDocumentsAsync();
                var documentDtos = _mapper.Map<IEnumerable<DocumentDto>>(documents);
                
                return Ok(documentDtos);
            }
            catch (Exception)
            {
                return StatusCode(500, new { error = "An error occurred while retrieving documents" });
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<DocumentDto>> GetDocument(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                if (userId == 0) return Unauthorized();

                var document = await _documentService.GetDocumentByIdAsync(id);
                if (document == null) return NotFound();

                if (!await _documentService.UserHasAccessToDocumentAsync(userId, id))
                    return Forbid();

                var documentDto = _mapper.Map<DocumentDto>(document);
                return Ok(documentDto);
            }
            catch (Exception)
            {
                return StatusCode(500, new { error = "An error occurred while retrieving the document" });
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteDocument(int id)
        {
            try
            {
                Console.WriteLine($"DocumentViewerController.DeleteDocument: Attempting to delete document {id}");
                
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                Console.WriteLine($"DocumentViewerController.DeleteDocument: UserId: {userId}");
                
                if (userId == 0) return Unauthorized();

                var result = await _documentService.DeleteDocumentAsync(id, userId);
                Console.WriteLine($"DocumentViewerController.DeleteDocument: Delete result: {result}");
                
                if (!result) 
                {
                    Console.WriteLine($"DocumentViewerController.DeleteDocument: Delete failed - document not found or user lacks permission");
                    return NotFound();
                }

                Console.WriteLine($"DocumentViewerController.DeleteDocument: Document {id} deleted successfully");
                return Ok(new { message = "Document deleted successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DocumentViewerController.DeleteDocument: Error: {ex.Message}");
                Console.WriteLine($"DocumentViewerController.DeleteDocument: Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { error = "An error occurred while deleting the document" });
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<DocumentDto>> UpdateDocument(int id, [FromBody] UpdateDocumentDto updateDto)
        {
            try
            {
                var document = await _documentService.UpdateDocumentAsync(id, updateDto);
                if (document == null) return NotFound();

                var documentDto = _mapper.Map<DocumentDto>(document);
                return Ok(documentDto);
            }
            catch (Exception)
            {
                return StatusCode(500, new { error = "An error occurred while updating the document" });
            }
        }

        [HttpGet("{id}/download")]
        [Authorize]
        public async Task<IActionResult> DownloadDocument(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                if (userId == 0) return Unauthorized();

                var document = await _documentService.GetDocumentByIdAsync(id);
                if (document == null) return NotFound();

                if (!await _documentService.UserHasAccessToDocumentAsync(userId, id))
                    return Forbid();

                if (!System.IO.File.Exists(document.FilePath))
                    return NotFound(new { error = "File not found on disk" });

                var contentType = GetContentType(Path.GetExtension(document.FileName));
                var fileBytes = await System.IO.File.ReadAllBytesAsync(document.FilePath);
                
                // Handle non-ASCII characters in filename for Content-Disposition header
                var asciiFileName = new string(document.FileName.Select(c => c < 128 ? c : '_').ToArray());
                Response.Headers["Content-Disposition"] = $"attachment; filename=\"{asciiFileName}\"";
                Response.Headers["Cache-Control"] = "no-cache";
                
                return File(fileBytes, contentType, asciiFileName);
            }
            catch (Exception)
            {
                return StatusCode(500, new { error = "An error occurred while downloading the document" });
            }
        }

        [HttpGet("{id}/preview")]
        [Authorize]
        public async Task<ActionResult<string>> GetDocumentPreviewUrl(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                if (userId == 0) return Unauthorized();

                var previewUrl = await _documentService.GetDocumentPreviewUrlAsync(id, userId);
                if (previewUrl == null) return NotFound();

                return Ok(new { previewUrl });
            }
            catch (Exception)
            {
                return StatusCode(500, new { error = "An error occurred while getting the preview URL" });
            }
        }

        [HttpGet("{id}/serve")]
        [Authorize]
        public async Task<IActionResult> ServeDocument(int id)
        {
            try
            {
                Console.WriteLine($"DocumentViewerController.ServeDocument: Starting to serve document {id}");
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                Console.WriteLine($"DocumentViewerController.ServeDocument: UserId: {userId}");
                
                if (userId == 0) 
                {
                    Console.WriteLine($"DocumentViewerController.ServeDocument: No user ID found, returning unauthorized");
                    return Unauthorized();
                }

                Console.WriteLine($"DocumentViewerController.ServeDocument: Getting document by ID {id}");
                var document = await _documentService.GetDocumentByIdAsync(id);
                if (document == null) 
                {
                    Console.WriteLine($"DocumentViewerController.ServeDocument: Document {id} not found");
                    return NotFound(new { error = "Document not found", documentId = id });
                }
                
                Console.WriteLine($"DocumentViewerController.ServeDocument: Document found - FileName: {document.FileName}, FilePath: {document.FilePath}");

                // Check user access
                Console.WriteLine($"DocumentViewerController.ServeDocument: Checking user access for user {userId} to document {id}");
                if (!await _documentService.UserHasAccessToDocumentAsync(userId, id))
                {
                    Console.WriteLine($"DocumentViewerController.ServeDocument: User {userId} doesn't have access to document {id}");
                    return Forbid();
                }

                Console.WriteLine($"DocumentViewerController.ServeDocument: User has access, checking if file exists at path: {document.FilePath}");
                // Check if file exists
                if (!System.IO.File.Exists(document.FilePath))
                {
                    Console.WriteLine($"DocumentViewerController.ServeDocument: File not found at path: {document.FilePath}");
                    return NotFound(new { error = "File not found on disk", filePath = document.FilePath, documentId = id });
                }

                Console.WriteLine($"DocumentViewerController.ServeDocument: File exists, getting content type");
                var contentType = GetContentType(Path.GetExtension(document.FileName));
                Console.WriteLine($"DocumentViewerController.ServeDocument: Serving file with content type: {contentType}");

                Console.WriteLine($"DocumentViewerController.ServeDocument: Reading file bytes");
                var fileBytes = await System.IO.File.ReadAllBytesAsync(document.FilePath);
                Console.WriteLine($"DocumentViewerController.ServeDocument: File size: {fileBytes.Length} bytes");

                Console.WriteLine($"DocumentViewerController.ServeDocument: Setting response headers");
                // Handle non-ASCII characters in filename for Content-Disposition header
                var safeFileName = document.FileName;
                try
                {
                    // Remove or replace non-ASCII characters for the header
                    var asciiFileName = new string(document.FileName.Select(c => c < 128 ? c : '_').ToArray());
                    Response.Headers["Content-Disposition"] = $"inline; filename=\"{asciiFileName}\"";
                }
                catch
                {
                    // Fallback to a safe filename
                    Response.Headers["Content-Disposition"] = $"inline; filename=\"document.pdf\"";
                }
                Response.Headers["Cache-Control"] = "no-cache";
                
                Console.WriteLine($"DocumentViewerController.ServeDocument: Returning file response");
                return File(fileBytes, contentType, document.FileName);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DocumentViewerController.ServeDocument: Error: {ex.Message}");
                Console.WriteLine($"DocumentViewerController.ServeDocument: Stack trace: {ex.StackTrace}");
                Console.WriteLine($"DocumentViewerController.ServeDocument: Inner exception: {ex.InnerException?.Message}");
                return StatusCode(500, new { error = "An error occurred while serving the document", details = ex.Message, documentId = id });
            }
        }

        [HttpGet("{id}/preview-serve")]
        [Authorize]
        public async Task<IActionResult> ServeDocumentForPreview(int id, [FromQuery] string? token)
        {
            try
            {
                // For preview, we'll accept a simple token or check if user is authenticated
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                
                // If no user ID, try to validate token (simple implementation)
                if (userId == 0 && string.IsNullOrEmpty(token))
                {
                    return Unauthorized();
                }

                var document = await _documentService.GetDocumentByIdAsync(id);
                if (document == null) return NotFound();

                // For preview, we'll be more lenient with access
                if (userId != 0 && !await _documentService.UserHasAccessToDocumentAsync(userId, id))
                {
                    return Forbid();
                }

                // Check if file exists
                if (!System.IO.File.Exists(document.FilePath))
                {
                    return NotFound(new { error = "File not found on disk" });
                }

                // Get file info
                var fileInfo = new FileInfo(document.FilePath);
                var contentType = GetContentType(Path.GetExtension(document.FileName));

                // Return file as stream with CORS headers for preview
                var fileStream = System.IO.File.OpenRead(document.FilePath);
                Response.Headers["Access-Control-Allow-Origin"] = "*";
                Response.Headers["Access-Control-Allow-Methods"] = "GET";
                Response.Headers["Access-Control-Allow-Headers"] = "Content-Type";
                
                return File(fileStream, contentType, document.FileName);
            }
            catch (Exception)
            {
                return StatusCode(500, new { error = "An error occurred while serving the document for preview" });
            }
        }

        [HttpGet("{id}/convert-to-pdf")]
        [Authorize]
        public async Task<IActionResult> ConvertToPdf(int id)
        {
            try
            {
                Console.WriteLine($"DocumentViewerController.ConvertToPdf: Converting document {id} to PDF");
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                
                if (userId == 0) return Unauthorized();

                var document = await _documentService.GetDocumentByIdAsync(id);
                if (document == null) return NotFound();

                if (!await _documentService.UserHasAccessToDocumentAsync(userId, id))
                    return Forbid();

                if (!System.IO.File.Exists(document.FilePath))
                    return NotFound(new { error = "File not found on disk" });

                var fileExtension = Path.GetExtension(document.FileName).ToLowerInvariant();
                
                // Check if file is Word or Excel
                if (fileExtension != ".docx" && fileExtension != ".doc" && fileExtension != ".xlsx" && fileExtension != ".xls")
                {
                    return BadRequest(new { error = "File type not supported for conversion" });
                }

                // For now, return the original file with a note
                // In a production environment, you would use a library like Spire.Doc or Aspose
                // to convert Word/Excel to PDF
                var contentType = GetContentType(Path.GetExtension(document.FileName));
                var fileBytes = await System.IO.File.ReadAllBytesAsync(document.FilePath);
                
                // Return the original file with a note that conversion is not implemented
                var asciiFileName = new string(document.FileName.Select(c => c < 128 ? c : '_').ToArray());
                Response.Headers["Content-Disposition"] = $"inline; filename=\"{asciiFileName}\"";
                Response.Headers["Cache-Control"] = "no-cache";
                Response.Headers["X-Conversion-Note"] = "Original file returned - PDF conversion not implemented";
                
                Console.WriteLine($"DocumentViewerController.ConvertToPdf: Returning original file (conversion not implemented)");
                return File(fileBytes, contentType, asciiFileName);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DocumentViewerController.ConvertToPdf: Error: {ex.Message}");
                return StatusCode(500, new { error = "An error occurred while converting the document" });
            }
        }

        [HttpGet("test-auth")]
        [Authorize]
        public ActionResult<object> TestAuthentication()
        {
            var claims = User.Claims.Select(c => new { Type = c.Type, Value = c.Value }).ToList();
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            return Ok(new { 
                message = "Authentication test successful",
                userId = userId,
                claims = claims
            });
        }

        [HttpGet("debug-documents")]
        [Authorize]
        public async Task<ActionResult<object>> DebugDocuments()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var allDocuments = await _documentService.GetAllDocumentsAsync();
                var userDocuments = await _documentService.GetDocumentsForUserAsync(userId);
                
                return Ok(new { 
                    message = "Debug documents",
                    userId = userId,
                    totalDocuments = allDocuments.Count(),
                    userDocuments = userDocuments.Count(),
                    allDocuments = allDocuments.Select(d => new { 
                        id = d.Id, 
                        fileName = d.FileName, 
                        uploadedBy = d.UploadedBy,
                        excludedUsers = d.ExcludedUsers,
                        filePath = d.FilePath,
                        fileExists = System.IO.File.Exists(d.FilePath)
                    }).ToList()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("debug-document/{id}")]
        [Authorize]
        public async Task<ActionResult<object>> DebugDocument(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var document = await _documentService.GetDocumentByIdAsync(id);
                
                if (document == null)
                {
                    return NotFound(new { error = "Document not found" });
                }
                
                var hasAccess = await _documentService.UserHasAccessToDocumentAsync(userId, id);
                var fileExists = System.IO.File.Exists(document.FilePath);
                
                return Ok(new { 
                    message = "Debug document",
                    userId = userId,
                    document = new { 
                        id = document.Id, 
                        fileName = document.FileName, 
                        uploadedBy = document.UploadedBy,
                        excludedUsers = document.ExcludedUsers,
                        filePath = document.FilePath,
                        fileExists = fileExists,
                        fileSize = fileExists ? new FileInfo(document.FilePath).Length : 0
                    },
                    hasAccess = hasAccess
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("debug-document-19")]
        [Authorize]
        public async Task<ActionResult<object>> DebugDocument19()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var document = await _documentService.GetDocumentByIdAsync(19);
                
                if (document == null)
                {
                    return NotFound(new { error = "Document 19 not found", userId = userId });
                }
                
                var hasAccess = await _documentService.UserHasAccessToDocumentAsync(userId, 19);
                var fileExists = System.IO.File.Exists(document.FilePath);
                var fileInfo = fileExists ? new FileInfo(document.FilePath) : null;
                
                return Ok(new { 
                    message = "Debug document 19",
                    userId = userId,
                    document = new { 
                        id = document.Id, 
                        fileName = document.FileName, 
                        uploadedBy = document.UploadedBy,
                        excludedUsers = document.ExcludedUsers,
                        filePath = document.FilePath,
                        fileExists = fileExists,
                        fileSize = fileInfo?.Length ?? 0,
                        fileLastModified = fileInfo?.LastWriteTime
                    },
                    hasAccess = hasAccess,
                    userClaims = User.Claims.Select(c => new { c.Type, c.Value }).ToList()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [HttpPost("create-test-document")]
        [Authorize]
        public async Task<ActionResult<DocumentDto>> CreateTestDocument()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                if (userId == 0) return Unauthorized();

                // Create a test document
                var testDocumentDto = new CreateDocumentDto
                {
                    FileName = "test-document.txt",
                    FileType = "txt",
                    FileSize = 1024,
                    Description = "Test document for debugging",
                    Tags = "test,debug",
                    Category = "Test",
                    ExcludedUsers = new List<string>()
                };

                // Create a mock file
                var fileContent = "This is a test document for debugging purposes.";
                var fileBytes = System.Text.Encoding.UTF8.GetBytes(fileContent);
                var mockFile = new FormFile(
                    new MemoryStream(fileBytes), 
                    0, 
                    fileBytes.Length, 
                    "file", 
                    "test-document.txt"
                );

                var document = await _documentService.UploadDocumentAsync(mockFile, testDocumentDto, userId);
                var documentDto = _mapper.Map<DocumentDto>(document);
                
                return Ok(documentDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("create-test-file")]
        [Authorize]
        public async Task<ActionResult<DocumentDto>> CreateTestFile()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                if (userId == 0) return Unauthorized();

                // Create a test text file
                var testContent = "This is a test file for debugging purposes.\n\nIt contains multiple lines of text to test the file preview functionality.";
                var fileName = $"test-file-{DateTime.Now:yyyyMMdd-HHmmss}.txt";
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "FileStorage", "Documents", fileName);
                
                // Ensure directory exists
                var directory = Path.GetDirectoryName(filePath);
                if (!string.IsNullOrEmpty(directory))
                {
                    Directory.CreateDirectory(directory);
                }
                
                // Write test file
                await System.IO.File.WriteAllTextAsync(filePath, testContent);
                
                // Create document DTO
                var testDocumentDto = new CreateDocumentDto
                {
                    FileName = fileName,
                    FileType = ".txt",
                    FileSize = testContent.Length,
                    Description = "Test file for debugging",
                    Tags = "test,debug",
                    Category = "Test",
                    ExcludedUsers = new List<string>()
                };

                // Create a mock file
                var fileBytes = System.Text.Encoding.UTF8.GetBytes(testContent);
                var mockFile = new FormFile(
                    new MemoryStream(fileBytes), 
                    0, 
                    fileBytes.Length, 
                    "file", 
                    fileName
                );

                var document = await _documentService.UploadDocumentAsync(mockFile, testDocumentDto, userId);
                var documentDto = _mapper.Map<DocumentDto>(document);
                
                return Ok(new { 
                    message = "Test file created successfully",
                    document = documentDto,
                    filePath = filePath,
                    fileExists = System.IO.File.Exists(filePath)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [HttpPost("create-sample-documents")]
        [Authorize]
        public async Task<ActionResult<object>> CreateSampleDocuments()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                if (userId == 0) return Unauthorized();

                var createdDocuments = new List<object>();

                // Create sample documents with different access levels
                var sampleDocuments = new[]
                {
                    new { 
                        fileName = "public-document.txt", 
                        content = "This is a public document that everyone can access.",
                        excludedUsers = new List<string>(),
                        description = "Public Document"
                    },
                    new { 
                        fileName = "restricted-document.txt", 
                        content = "This is a restricted document with some users excluded.",
                        excludedUsers = new List<string> { "member1@example.com" },
                        description = "Restricted Document"
                    },
                    new { 
                        fileName = "admin-only-document.txt", 
                        content = "This document is for admin users only.",
                        excludedUsers = new List<string> { "member1@example.com", "member2@example.com", "member3@example.com" },
                        description = "Admin Only Document"
                    }
                };

                foreach (var sample in sampleDocuments)
                {
                    // Create file on disk
                    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "FileStorage", "Documents", sample.fileName);
                    var directory = Path.GetDirectoryName(filePath);
                if (!string.IsNullOrEmpty(directory))
                {
                    Directory.CreateDirectory(directory);
                }
                    await System.IO.File.WriteAllTextAsync(filePath, sample.content);

                    // Create document DTO
                    var documentDto = new CreateDocumentDto
                    {
                        FileName = sample.fileName,
                        FileType = ".txt",
                        FileSize = sample.content.Length,
                        Description = sample.description,
                        Tags = "sample,test",
                        Category = "Sample",
                        ExcludedUsers = sample.excludedUsers
                    };

                    // Create mock file
                    var fileBytes = System.Text.Encoding.UTF8.GetBytes(sample.content);
                    var mockFile = new FormFile(
                        new MemoryStream(fileBytes), 
                        0, 
                        fileBytes.Length, 
                        "file", 
                        sample.fileName
                    );

                    var document = await _documentService.UploadDocumentAsync(mockFile, documentDto, userId);
                    var documentResult = _mapper.Map<DocumentDto>(document);
                    
                    createdDocuments.Add(new { 
                        document = documentResult,
                        fileExists = System.IO.File.Exists(filePath)
                    });
                }

                return Ok(new { 
                    message = "Sample documents created successfully",
                    createdDocuments = createdDocuments
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [HttpGet("test-database")]
        [Authorize]
        public async Task<ActionResult<object>> TestDatabase()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var allDocuments = await _documentService.GetAllDocumentsAsync();
                
                return Ok(new { 
                    message = "Database test",
                    userId = userId,
                    totalDocuments = allDocuments.Count(),
                    documents = allDocuments.Select(d => new { 
                        id = d.Id, 
                        fileName = d.FileName, 
                        uploadedBy = d.UploadedBy,
                        filePath = d.FilePath,
                        fileExists = System.IO.File.Exists(d.FilePath)
                    }).ToList()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [HttpGet("test-serve")]
        [Authorize]
        public async Task<IActionResult> TestServe()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                if (userId == 0) return Unauthorized();

                // Create a simple test file
                var testContent = "This is a test file for debugging the serve endpoint.";
                var fileName = "test-serve.txt";
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "FileStorage", "Documents", fileName);
                
                // Ensure directory exists
                var directory = Path.GetDirectoryName(filePath);
                if (!string.IsNullOrEmpty(directory))
                {
                    Directory.CreateDirectory(directory);
                }
                
                // Write test file
                await System.IO.File.WriteAllTextAsync(filePath, testContent);
                
                // Return the file directly
                var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
                var contentType = "text/plain";
                
                Response.Headers["Content-Disposition"] = $"inline; filename=\"{fileName}\"";
                Response.Headers["Cache-Control"] = "no-cache";
                
                return File(fileBytes, contentType, fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [HttpGet("test-basic")]
        [AllowAnonymous]
        public ActionResult<object> TestBasic()
        {
            try
            {
                return Ok(new { 
                    message = "API is working",
                    timestamp = DateTime.UtcNow,
                    environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("test-doc-19")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> TestDocument19()
        {
            try
            {
                Console.WriteLine("DocumentViewerController.TestDocument19: Testing document 19");
                
                // Try to get document 19
                var document = await _documentService.GetDocumentByIdAsync(19);
                
                if (document == null)
                {
                    Console.WriteLine("DocumentViewerController.TestDocument19: Document 19 not found");
                    return NotFound(new { error = "Document 19 not found in database" });
                }
                
                Console.WriteLine($"DocumentViewerController.TestDocument19: Document found - FileName: {document.FileName}, FilePath: {document.FilePath}");
                
                // Check if file exists
                var fileExists = System.IO.File.Exists(document.FilePath);
                Console.WriteLine($"DocumentViewerController.TestDocument19: File exists: {fileExists}");
                
                if (!fileExists)
                {
                    Console.WriteLine($"DocumentViewerController.TestDocument19: File not found at path: {document.FilePath}");
                    return NotFound(new { error = "File not found on disk", filePath = document.FilePath });
                }
                
                // Get file info
                var fileInfo = new FileInfo(document.FilePath);
                Console.WriteLine($"DocumentViewerController.TestDocument19: File size: {fileInfo.Length} bytes");
                
                return Ok(new { 
                    message = "Document 19 test successful",
                    document = new { 
                        id = document.Id, 
                        fileName = document.FileName, 
                        filePath = document.FilePath,
                        fileExists = fileExists,
                        fileSize = fileInfo.Length,
                        fileLastModified = fileInfo.LastWriteTime
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DocumentViewerController.TestDocument19: Error: {ex.Message}");
                Console.WriteLine($"DocumentViewerController.TestDocument19: Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        private string GetContentType(string fileType)
        {
            return fileType.ToLower() switch
            {
                // Documents
                ".pdf" => "application/pdf",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".xls" => "application/vnd.ms-excel",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".txt" => "text/plain",
                ".rtf" => "application/rtf",
                ".md" => "text/markdown",
                ".csv" => "text/csv",
                
                // Images
                ".jpg" => "image/jpeg",
                ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".bmp" => "image/bmp",
                ".webp" => "image/webp",
                ".svg" => "image/svg+xml",
                ".ico" => "image/x-icon",
                
                // Audio
                ".mp3" => "audio/mpeg",
                ".wav" => "audio/wav",
                ".ogg" => "audio/ogg",
                ".aac" => "audio/aac",
                ".flac" => "audio/flac",
                ".m4a" => "audio/mp4",
                
                // Video
                ".mp4" => "video/mp4",
                ".avi" => "video/x-msvideo",
                ".mov" => "video/quicktime",
                ".wmv" => "video/x-ms-wmv",
                ".flv" => "video/x-flv",
                ".webm" => "video/webm",
                ".mkv" => "video/x-matroska",
                ".m4v" => "video/mp4",
                
                // Archives
                ".zip" => "application/zip",
                ".rar" => "application/x-rar-compressed",
                ".7z" => "application/x-7z-compressed",
                ".tar" => "application/x-tar",
                ".gz" => "application/gzip",
                
                _ => "application/octet-stream"
            };
        }
    }
} 