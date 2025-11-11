using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Core.Entities.DocumentViewer;
using Core.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Identity;
using Core.Dtos.DocumentViewer;
using Core.Entities.Identity;

namespace Infrastructure.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly AppIdentityDbContext _context;
        private readonly string _uploadPath;

        public DocumentService(AppIdentityDbContext context)
        {
            _context = context;
            _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "FileStorage", "Documents");
            
            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
            }
        }

        public async Task<Document> UploadDocumentAsync(IFormFile file, CreateDocumentDto documentDto, int uploadedById)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is required");

            // Generate unique filename
            var fileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(_uploadPath, fileName);

            // Save file to disk
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Create document record
            var document = new Document
            {
                FileName = documentDto.FileName ?? file.FileName,
                FileType = documentDto.FileType ?? GetFileType(file.FileName),
                FilePath = filePath,
                FileSize = file.Length,
                UploadedBy = uploadedById.ToString(),
                UploadedById = uploadedById,
                DateUploaded = DateTime.UtcNow,
                IsActive = true,
                ExcludedUsers = documentDto.ExcludedUsers ?? new List<string>(),
                Description = documentDto.Description,
                Tags = documentDto.Tags,
                Category = documentDto.Category
            };

            _context.Documents.Add(document);
            await _context.SaveChangesAsync();

            return document;
        }

        public async Task<Document> GetDocumentByIdAsync(int id)
        {
            return await _context.Documents
                .Include(d => d.UploadedByUser)
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<IEnumerable<Document>> GetDocumentsForUserAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            Console.WriteLine($"DocumentService.GetDocumentsForUserAsync: UserId: {userId}, User found: {user != null}");
            
            if (user == null) return new List<Document>();

            // Get all documents where user has access
            var documents = await _context.Documents
                .Include(d => d.UploadedByUser)
                .Where(d => d.IsActive)
                .ToListAsync();

            Console.WriteLine($"DocumentService.GetDocumentsForUserAsync: Total active documents: {documents.Count}");

            // Filter based on permissions
            var accessibleDocuments = documents.Where(d => HasUserAccess(user, d)).ToList();
            Console.WriteLine($"DocumentService.GetDocumentsForUserAsync: Accessible documents: {accessibleDocuments.Count}");

            return accessibleDocuments;
        }

        public async Task<IEnumerable<Document>> GetAllDocumentsAsync()
        {
            return await _context.Documents
                .Include(d => d.UploadedByUser)
                .Where(d => d.IsActive)
                .OrderByDescending(d => d.DateUploaded)
                .ToListAsync();
        }

        public async Task<bool> DeleteDocumentAsync(int id, int userId)
        {
            var document = await _context.Documents.FindAsync(id);
            if (document == null) return false;

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            // Check if user has permission to delete:
            // 1. Admin can delete any document
            // 2. Document owner can delete their own document
            // 3. Users with access can delete (optional - you can remove this if you want only admins and owners)
            bool canDelete = IsAdmin(user) || 
                           document.UploadedBy == user.UserName || 
                           HasUserAccess(user, document);

            if (!canDelete) return false;

            // Delete physical file
            if (File.Exists(document.FilePath))
            {
                File.Delete(document.FilePath);
            }

            _context.Documents.Remove(document);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<Document> UpdateDocumentAsync(int id, UpdateDocumentDto updateDto)
        {
            var document = await GetDocumentByIdAsync(id);
            if (document == null) return null;

            // Update properties
            document.Description = updateDto.Description ?? document.Description;
            document.Tags = updateDto.Tags ?? document.Tags;
            document.Category = updateDto.Category ?? document.Category;
            document.ExcludedUsers = updateDto.ExcludedUsers ?? new List<string>();

            await _context.SaveChangesAsync();
            return document;
        }

        public async Task<bool> UserHasAccessToDocumentAsync(int userId, int documentId)
        {
            var user = await _context.Users.FindAsync(userId);
            var document = await _context.Documents.FindAsync(documentId);

            if (user == null || document == null) return false;

            return HasUserAccess(user, document);
        }

        public async Task<byte[]> DownloadDocumentAsync(int id, int userId)
        {
            var document = await GetDocumentByIdAsync(id);
            if (document == null) return null;

            var user = await _context.Users.FindAsync(userId);
            if (user == null || !HasUserAccess(user, document)) return null;

            if (!File.Exists(document.FilePath)) return null;

            return await File.ReadAllBytesAsync(document.FilePath);
        }

        public async Task<string> GetDocumentPreviewUrlAsync(int id, int userId)
        {
            var document = await GetDocumentByIdAsync(id);
            if (document == null) return null;

            if (!await UserHasAccessToDocumentAsync(userId, id))
                return null;

            // Check if file exists
            if (!File.Exists(document.FilePath))
            {
                Console.WriteLine($"DocumentService.GetDocumentPreviewUrlAsync: File not found at path: {document.FilePath}");
                return null;
            }

            // Return the file path as URL (relative to wwwroot)
            var fileName = Path.GetFileName(document.FilePath);
            return $"/FileStorage/Documents/{fileName}";
        }

        public async Task<string> GetDocumentDownloadUrlAsync(int id, int userId)
        {
            var document = await GetDocumentByIdAsync(id);
            if (document == null) return null;

            if (!await UserHasAccessToDocumentAsync(userId, id))
                return null;

            // Check if file exists
            if (!File.Exists(document.FilePath))
            {
                Console.WriteLine($"DocumentService.GetDocumentDownloadUrlAsync: File not found at path: {document.FilePath}");
                return null;
            }

            // Return the file path as URL (relative to wwwroot)
            var fileName = Path.GetFileName(document.FilePath);
            return $"/FileStorage/Documents/{fileName}";
        }

        private string GetFileType(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return extension switch
            {
                // Documents
                ".pdf" => "pdf",
                ".doc" or ".docx" => "word",
                ".xls" or ".xlsx" => "excel",
                ".txt" => "text",
                
                // Images
                ".jpg" or ".jpeg" or ".png" or ".gif" or ".bmp" or ".webp" or ".svg" => "image",
                
                // Audio
                ".mp3" or ".wav" or ".ogg" or ".aac" or ".flac" => "audio",
                
                // Video
                ".mp4" or ".avi" or ".mov" or ".wmv" or ".flv" or ".webm" or ".mkv" => "video",
                
                // Archives
                ".zip" or ".rar" or ".7z" => "archive",
                
                _ => "unknown"
            };
        }

        private bool HasUserAccess(AppUser user, Document document)
        {
            Console.WriteLine($"DocumentService.HasUserAccess: Checking access for user {user.UserName} to document {document.FileName}");
            Console.WriteLine($"DocumentService.HasUserAccess: Document excluded users: [{string.Join(", ", document.ExcludedUsers)}]");
            
            // Admin has access to all documents
            if (IsAdmin(user)) 
            {
                Console.WriteLine($"DocumentService.HasUserAccess: User is admin, access granted");
                return true;
            }

            // Check if user is explicitly excluded (check both UserName and Email)
            if (document.ExcludedUsers.Contains(user.UserName) || document.ExcludedUsers.Contains(user.Email)) 
            {
                Console.WriteLine($"DocumentService.HasUserAccess: User is explicitly excluded, access denied");
                return false;
            }

            // If user is not excluded, they have access
            Console.WriteLine($"DocumentService.HasUserAccess: User is not excluded, access granted");
            return true;
        }

        private bool IsAdmin(AppUser user)
        {
            return user.UserRoles?.Any(ur => ur.Role.Name == "Admin") ?? false;
        }
    }
} 