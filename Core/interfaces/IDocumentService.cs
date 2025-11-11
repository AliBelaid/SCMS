using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Entities.DocumentViewer;
using Core.Dtos.DocumentViewer;
using Microsoft.AspNetCore.Http;

namespace Core.Interfaces
{
    public interface IDocumentService
    {
        Task<Document> UploadDocumentAsync(IFormFile file, CreateDocumentDto documentDto, int uploadedById);
        Task<Document> GetDocumentByIdAsync(int id);
        Task<IEnumerable<Document>> GetDocumentsForUserAsync(int userId);
        Task<IEnumerable<Document>> GetAllDocumentsAsync();
        Task<bool> DeleteDocumentAsync(int id, int userId);
        Task<Document> UpdateDocumentAsync(int id, UpdateDocumentDto updateDto);
        Task<bool> UserHasAccessToDocumentAsync(int userId, int documentId);
        Task<byte[]> DownloadDocumentAsync(int id, int userId);
        Task<string> GetDocumentDownloadUrlAsync(int id, int userId);
        Task<string> GetDocumentPreviewUrlAsync(int id, int userId);
    }
} 