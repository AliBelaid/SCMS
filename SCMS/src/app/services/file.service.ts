import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FileEntry } from '../models/file-entry';
import { AppUser } from '../models/app-user';
import { AuthService } from './auth.service';
import { environment } from '../../assets/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiUrl = environment.apiUrl + 'DocumentViewer'; // Update with your API URL

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAuthToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getAuthToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getAllFiles(): Observable<FileEntry[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`, { headers: this.getHeaders() })
      .pipe(
        map(documents => documents.map(doc => this.mapDocumentToFileEntry(doc))),
        catchError(error => {
          console.error('Error fetching all files:', error);
          return of([]);
        })
      );
  }

  getFilesForCurrentUser(): Observable<FileEntry[]> {
    return this.http.get<any[]>(`${this.apiUrl}`, { headers: this.getHeaders() })
      .pipe(
        map(documents => documents.map(doc => this.mapDocumentToFileEntry(doc))),
        catchError(error => {
          console.error('Error fetching user files:', error);
          return of([]);
        })
      );
  }

  addFile(file: Omit<FileEntry, 'id' | 'dateUploaded'>, actualFile?: File): Observable<boolean> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return of(false);

    const formData = new FormData();
    
    // Use the actual file if provided, otherwise create a mock file
    const fileToUpload = actualFile || new File(['mock content'], file.fileName, { type: 'text/plain' });
    
    console.log('FileService: File to upload:', fileToUpload);
    console.log('FileService: File name:', fileToUpload.name);
    console.log('FileService: File size:', fileToUpload.size);
    console.log('FileService: File type:', fileToUpload.type);
    
    formData.append('file', fileToUpload);
    
    // Add form fields
    formData.append('description', file.fileName);
    formData.append('tags', '');
    formData.append('category', 'General');
    
    // Add excluded users as comma-separated string
    if (file.excludedUsers && file.excludedUsers.length > 0) {
      formData.append('excludedUsers', file.excludedUsers.join(','));
    }

    console.log('FileService: Uploading file to', `${this.apiUrl}/upload`);
    console.log('FileService: FormData contains file and metadata');
    console.log('FileService: Auth token available:', !!this.authService.getAuthToken());
    console.log('FileService: Auth token value:', this.authService.getAuthToken());
    
    // For FormData requests, don't set Content-Type header - let the browser set it
    const token = this.authService.getAuthToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    console.log('FileService: Making request with headers:', headers);
    console.log('FileService: FormData contains file and form fields');
    
    return this.http.post<any>(`${this.apiUrl}/upload`, formData, { headers })
      .pipe(
        map(() => {
          console.log('FileService: Upload successful');
          return true;
        }),
        catchError(error => {
          console.error('Error adding file:', error);
          console.error('Error details:', error.error);
          return of(false);
        })
      );
  }

  updateFile(file: FileEntry): Observable<boolean> {
    const updateDocumentDto = {
      description: file.fileName,
      tags: '',
      category: 'General',
      excludedUsers: file.excludedUsers
    };

    return this.http.put<any>(`${this.apiUrl}/${file.id}`, updateDocumentDto, { headers: this.getHeaders() })
      .pipe(
        map(() => true),
        catchError(error => {
          console.error('Error updating file:', error);
          return of(false);
        })
      );
  }

  deleteFile(fileId: string): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/${fileId}`, { headers: this.getHeaders() })
      .pipe(
        map(() => true),
        catchError(error => {
          console.error('Error deleting file:', error);
          return of(false);
        })
      );
  }

  getFileById(fileId: string): Observable<FileEntry | undefined> {
    return this.http.get<any>(`${this.apiUrl}/${fileId}`, { headers: this.getHeaders() })
      .pipe(
        map(doc => this.mapDocumentToFileEntry(doc)),
        catchError(error => {
          console.error('Error fetching file by ID:', error);
          return of(undefined);
        })
      );
  }

  canUserAccessFile(file: FileEntry, userCode: string): boolean {
    // Check if user is excluded
    const isExcluded = file.excludedUsers.includes(userCode);
    return !isExcluded; // User has access if not excluded
  }

  // Download file from API - now uses blob approach
  downloadFile(file: FileEntry): Observable<boolean> {
    console.log('FileService: Downloading file:', file.fileName);
    console.log('FileService: File ID:', file.id);
    
    // Use the API endpoint to get the file as blob
    return this.http.get(`${this.apiUrl}/${file.id}/serve`, { 
      headers: this.getHeaders(),
      responseType: 'blob'
    }).pipe(
      map(blob => {
        console.log('FileService: Received blob for download:', blob);
        console.log('FileService: Blob size:', blob.size);
        console.log('FileService: Blob type:', blob.type);
        
        // Create blob URL and trigger download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        window.URL.revokeObjectURL(url);
        
        console.log('FileService: Download triggered for:', file.fileName);
        return true;
      }),
      catchError(error => {
        console.error('FileService: Download error:', error);
        console.error('FileService: Error status:', error.status);
        console.error('FileService: Error message:', error.message);
        console.error('FileService: Error details:', error.error);
        return of(false);
      })
    );
  }

  // Get file preview URL - now uses blob approach
  getFilePreviewUrl(file: FileEntry): Observable<string | null> {
    console.log('FileService: Getting preview URL for:', file.fileName);
    console.log('FileService: File ID:', file.id);
    console.log('FileService: File type:', file.fileType);
    
    // Check if file type supports direct preview
    const fileExtension = file.fileName.split('.').pop()?.toLowerCase() || '';
    const supportsPreview = [
      'pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'txt', 'rtf', 'md', 'csv',
      'mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a',
      'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'
    ].includes(fileExtension);
    
    if (!supportsPreview) {
      console.log('FileService: File type does not support direct preview:', fileExtension);
      return of(null);
    }
    
    // Use the API endpoint to get the file as blob
    return this.http.get(`${this.apiUrl}/${file.id}/serve`, { 
      headers: this.getHeaders(),
      responseType: 'blob'
    }).pipe(
      map(blob => {
        console.log('FileService: Received blob for preview:', blob);
        console.log('FileService: Blob size:', blob.size);
        console.log('FileService: Blob type:', blob.type);
        
        // Check if the blob is actually an error response (JSON)
        if (blob.type === 'application/json') {
          console.error('FileService: Received JSON error response instead of file');
          // Read the blob as text to get the error details
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorText = reader.result as string;
              const errorData = JSON.parse(errorText);
              console.error('FileService: Error details:', errorData);
            } catch (e) {
              console.error('FileService: Could not parse error response');
            }
          };
          reader.readAsText(blob);
          return null;
        }
        
        // Create blob URL for preview
        const url = window.URL.createObjectURL(blob);
        console.log('FileService: Created preview URL:', url);
        return url;
      }),
      catchError(error => {
        console.error('FileService: Preview error:', error);
        console.error('FileService: Error status:', error.status);
        console.error('FileService: Error message:', error.message);
        console.error('FileService: Error details:', error.error);
        
        // Try to read error response if it's a blob
        if (error.error instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorText = reader.result as string;
              const errorData = JSON.parse(errorText);
              console.error('FileService: Backend error details:', errorData);
            } catch (e) {
              console.error('FileService: Could not parse error response');
            }
          };
          reader.readAsText(error.error);
        }
        
        return of(null);
      })
    );
  }

  // Convert Word/Excel to PDF for preview
  convertToPdf(file: FileEntry): Observable<string | null> {
    console.log('FileService: Converting to PDF for:', file.fileName);
    console.log('FileService: File ID:', file.id);
    
    // Check if file type supports conversion
    const fileExtension = file.fileName.split('.').pop()?.toLowerCase() || '';
    const supportsConversion = ['docx', 'doc', 'xlsx', 'xls'].includes(fileExtension);
    
    if (!supportsConversion) {
      console.log('FileService: File type does not support conversion:', fileExtension);
      return of(null);
    }
    
    // Use the API endpoint to convert and get the file as blob
    return this.http.get(`${this.apiUrl}/${file.id}/convert-to-pdf`, { 
      headers: this.getHeaders(),
      responseType: 'blob'
    }).pipe(
      map(blob => {
        console.log('FileService: Received PDF blob for conversion:', blob);
        console.log('FileService: Blob size:', blob.size);
        console.log('FileService: Blob type:', blob.type);
        
        // Check if the blob is actually an error response (JSON)
        if (blob.type === 'application/json') {
          console.error('FileService: Received JSON error response instead of PDF');
          // Read the blob as text to get the error details
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorText = reader.result as string;
              const errorData = JSON.parse(errorText);
              console.error('FileService: Error details:', errorData);
            } catch (e) {
              console.error('FileService: Could not parse error response');
            }
          };
          reader.readAsText(blob);
          return null;
        }
        
        // Create blob URL for preview
        const url = window.URL.createObjectURL(blob);
        console.log('FileService: Created PDF conversion URL:', url);
        return url;
      }),
      catchError(error => {
        console.error('FileService: PDF conversion error:', error);
        console.error('FileService: Error status:', error.status);
        console.error('FileService: Error message:', error.message);
        console.error('FileService: Error details:', error.error);
        
        // Try to read error response if it's a blob
        if (error.error instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorText = reader.result as string;
              const errorData = JSON.parse(errorText);
              console.error('FileService: Backend error details:', errorData);
            } catch (e) {
              console.error('FileService: Could not parse error response');
            }
          };
          reader.readAsText(error.error);
        }
        
        return of(null);
      })
    );
  }

  // Test authentication endpoint
  testAuthentication(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/test-auth`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          console.log('FileService: Authentication test successful:', response);
          return response;
        }),
        catchError(error => {
          console.error('FileService: Authentication test failed:', error);
          return of(null);
        })
      );
  }

  // Debug documents endpoint
  debugDocuments(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/debug-documents`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          console.log('FileService: Debug documents successful:', response);
          return response;
        }),
        catchError(error => {
          console.error('FileService: Debug documents failed:', error);
          return of(null);
        })
      );
  }

  // Create test document
  createTestDocument(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create-test-document`, {}, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          console.log('FileService: Create test document successful:', response);
          return response;
        }),
        catchError(error => {
          console.error('FileService: Create test document failed:', error);
          return of(null);
        })
      );
  }

  // Mock file preview data (for backward compatibility)
  getFilePreviewData(file: FileEntry): string {
    switch (file.fileType) {
      case 'pdf':
        return 'PDF Preview: This is a mock PDF content preview.';
      case 'word':
        return 'Word Document Preview: This is a mock Word document content preview.';
      case 'excel':
        return 'Excel Spreadsheet Preview: This is a mock Excel spreadsheet content preview.';
      case 'image':
        return 'Image Preview: This is a mock image preview.';
      default:
        return 'File Preview: This is a mock file content preview.';
    }
  }

  private mapDocumentToFileEntry(doc: any): FileEntry {
    return {
      id: doc.id.toString(),
      fileName: doc.fileName,
      fileType: doc.fileType,
      uploadedBy: doc.uploadedBy,
      dateUploaded: doc.dateUploaded,
      excludedUsers: doc.excludedUsers || []
    };
  }

  private mapFileType(fileType: string): 'pdf' | 'word' | 'excel' | 'image' | 'audio' | 'video' | 'text' | 'archive' | 'unknown' {
    const extension = fileType.toLowerCase();
    
    switch (extension) {
      case '.pdf':
        return 'pdf';
      case '.doc':
      case '.docx':
        return 'word';
      case '.xls':
      case '.xlsx':
        return 'excel';
      case '.txt':
      case '.rtf':
      case '.md':
        return 'text';
      case '.jpg':
      case '.jpeg':
      case '.png':
      case '.gif':
      case '.bmp':
      case '.webp':
      case '.svg':
      case '.ico':
        return 'image';
      case '.mp3':
      case '.wav':
      case '.ogg':
      case '.aac':
      case '.flac':
      case '.m4a':
        return 'audio';
      case '.mp4':
      case '.avi':
      case '.mov':
      case '.wmv':
      case '.flv':
      case '.webm':
      case '.mkv':
      case '.m4v':
        return 'video';
      case '.zip':
      case '.rar':
      case '.7z':
      case '.tar':
      case '.gz':
        return 'archive';
      default:
        return 'unknown';
    }
  }
} 