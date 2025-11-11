import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../material.module';
import { FileEntry } from '../../models/file-entry';
import { FileService } from '../../services/file.service';
import { MarkdownPipe } from '../../pipe/markdown.pipe';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface FileWithProgress extends FileEntry {
  downloadProgress?: number;
  isDownloading?: boolean;
}

type FileType = 'pdf' | 'word' | 'excel' | 'image' | 'audio' | 'video' | 'text' | 'archive' | 'unknown' | 'unsupported';

@Component({
  selector: 'app-file-preview-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule, MarkdownPipe],
  templateUrl: './file-preview-dialog.component.html',
  styleUrls: ['./file-preview-dialog.component.scss']
})
export class FilePreviewDialogComponent implements OnInit, OnDestroy {
  file: FileWithProgress;
  previewData: string;
  isDownloading = false;
  downloadProgress = 0;
  previewUrl: SafeResourceUrl | null = null;
  previewType: 'image' | 'pdf' | 'text' | 'audio' | 'video' | 'none' = 'none';
  isLoading = true;
  pdfError = false;
  fileType: FileType = 'unsupported';
  private destroy$ = new Subject<void>();
  private blobUrls: string[] = []; // Track blob URLs for cleanup

  constructor(
    public dialogRef: MatDialogRef<FilePreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { file: FileEntry },
    private fileService: FileService,
    private sanitizer: DomSanitizer
  ) {
    this.file = {
      ...data.file,
      downloadProgress: 0,
      isDownloading: false
    };
    this.previewData = this.fileService.getFilePreviewData(this.file);
    this.fileType = this.detectFileType(this.file.fileName);
  }

  ngOnInit(): void {
    this.loadFilePreview();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clean up blob URLs
    this.blobUrls.forEach(url => {
      window.URL.revokeObjectURL(url);
    });
    this.blobUrls = [];
  }

  detectFileType(fileName: string): FileType {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
      // Documents
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'word';
      case 'xls':
      case 'xlsx':
        return 'excel';
      case 'txt':
      case 'rtf':
      case 'md':
      case 'csv':
        return 'text';
      
      // Images
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'webp':
      case 'svg':
      case 'ico':
        return 'image';
      
      // Audio
      case 'mp3':
      case 'wav':
      case 'ogg':
      case 'aac':
      case 'flac':
      case 'm4a':
        return 'audio';
      
      // Video
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
      case 'flv':
      case 'webm':
      case 'mkv':
      case 'm4v':
        return 'video';
      
      // Archives
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        return 'archive';
      
      default:
        return 'unknown';
    }
  }

  loadFilePreview(): void {
    this.isLoading = true;
    console.log('Loading file preview for:', this.file.fileName);
    console.log('Detected file type:', this.fileType);
    console.log('File ID:', this.file.id);
    
    // For Word and Excel files, try to convert to PDF first
    if (this.fileType === 'word' || this.fileType === 'excel') {
      console.log('Attempting to convert Word/Excel to PDF for preview');
      this.fileService.convertToPdf(this.file).pipe(takeUntil(this.destroy$)).subscribe({
        next: (pdfUrl) => {
          console.log('Received PDF conversion URL:', pdfUrl);
          this.isLoading = false;
          
          if (pdfUrl) {
            // Track the blob URL for cleanup
            this.blobUrls.push(pdfUrl);
            this.loadPdfPreview(pdfUrl);
          } else {
            // If conversion fails, show download message
            this.showDownloadMessage();
          }
        },
        error: (error) => {
          console.error('Error converting to PDF:', error);
          this.isLoading = false;
          this.showDownloadMessage();
        }
      });
      return;
    }
    
    // For other file types, get the regular preview URL
    console.log('Getting preview URL for file type:', this.fileType);
    this.fileService.getFilePreviewUrl(this.file).pipe(takeUntil(this.destroy$)).subscribe({
      next: (previewUrl) => {
        console.log('Received preview URL:', previewUrl);
        console.log('Preview URL type:', typeof previewUrl);
        this.isLoading = false;
        
        if (previewUrl) {
          // Track the blob URL for cleanup
          this.blobUrls.push(previewUrl);
          console.log('Added blob URL to tracking list. Total URLs:', this.blobUrls.length);
          
          switch (this.fileType) {
            case 'image':
              console.log('Loading image preview');
              this.loadImagePreview(previewUrl);
              break;
            case 'pdf':
              console.log('Loading PDF preview with URL:', previewUrl);
              this.loadPdfPreview(previewUrl);
              break;
            case 'text':
              console.log('Loading text document preview');
              this.loadTextPreview(previewUrl);
              break;
            case 'audio':
              console.log('Loading audio preview');
              this.loadAudioPreview(previewUrl);
              break;
            case 'video':
              console.log('Loading video preview');
              this.loadVideoPreview(previewUrl);
              break;
            default:
              console.log('Unknown file type, setting preview to none');
              this.previewType = 'none';
          }
        } else {
          console.log('No preview URL received, showing error message');
          this.previewType = 'none';
          this.previewData = `Unable to load preview for ${this.file.fileName}. The file may not exist on the server or you may not have permission to access it. Please try downloading the file instead.`;
        }
      },
      error: (error) => {
        console.error('Error loading file preview:', error);
        console.error('Error details:', error);
        this.isLoading = false;
        // Show error message and fallback to download option
        this.previewType = 'none';
        this.previewData = `Error loading preview for ${this.file.fileName}. Please download the file to view its contents. Error: ${error.message || 'Unknown error'}`;
      }
    });
  }

  showDownloadMessage(): void {
    const fileTypeName = this.fileType === 'word' ? 'مستند Word' : 'جدول بيانات Excel';
    this.previewType = 'none';
    this.previewData = `
# ${fileTypeName}: ${this.file.fileName}

## Preview Not Available

${fileTypeName}s cannot be displayed directly in the browser for security reasons.

### Options:
- **Download the file** to view it in the appropriate application
- **Convert to PDF** (if available) for browser viewing

### File Information:
- **File Name**: ${this.file.fileName}
- **File Type**: ${fileTypeName}
- **Size**: ${this.getFileSize()}
- **Uploaded**: ${this.formatDate(this.file.dateUploaded)}

Click the download button below to save and view this document.
    `;
  }

  loadImagePreview(fileUrl: string): void {
    this.previewType = 'image';
    this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
  }

  loadPdfPreview(fileUrl: string): void {
    console.log('FilePreviewDialogComponent.loadPdfPreview: Loading PDF with URL:', fileUrl);
    console.log('FilePreviewDialogComponent.loadPdfPreview: File type:', this.fileType);
    console.log('FilePreviewDialogComponent.loadPdfPreview: File name:', this.file.fileName);
    
    this.previewType = 'pdf';
    this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
    this.pdfError = false;
    
    console.log('PDF preview URL set:', fileUrl);
    console.log('PDF preview type set to:', this.previewType);
    console.log('PDF preview URL sanitized:', this.previewUrl);
  }

  loadWordPreview(fileUrl: string): void {
    // Word documents cannot be viewed directly in browser
    // Show a message with download option
    this.previewType = 'none';
    this.previewData = `
# Word Document: ${this.file.fileName}

## Preview Not Available

Word documents (.doc, .docx) cannot be displayed directly in the browser for security reasons.

### Options:
- **Download the file** to view it in Microsoft Word or another compatible application
- **Convert to PDF** (if available) for browser viewing

### File Information:
- **File Name**: ${this.file.fileName}
- **File Type**: Word Document
- **Size**: ${this.getFileSize()}
- **Uploaded**: ${this.formatDate(this.file.dateUploaded)}

Click the download button below to save and view this document.
    `;
  }

  loadExcelPreview(fileUrl: string): void {
    // Excel spreadsheets cannot be viewed directly in browser
    // Show a message with download option
    this.previewType = 'none';
    this.previewData = `
# Excel Spreadsheet: ${this.file.fileName}

## Preview Not Available

Excel spreadsheets (.xls, .xlsx) cannot be displayed directly in the browser for security reasons.

### Options:
- **Download the file** to view it in Microsoft Excel or another compatible application
- **Convert to PDF** (if available) for browser viewing

### File Information:
- **File Name**: ${this.file.fileName}
- **File Type**: Excel Spreadsheet
- **Size**: ${this.getFileSize()}
- **Uploaded**: ${this.formatDate(this.file.dateUploaded)}

Click the download button below to save and view this spreadsheet.
    `;
  }

  loadTextPreview(fileUrl: string): void {
    this.previewType = 'text';
    // For text files, we'll load the content and display it
    fetch(fileUrl)
      .then(response => response.text())
      .then(text => {
        // Check if this is a CSV file
        if (this.file.fileName.toLowerCase().endsWith('.csv')) {
          // Format CSV data for better display
          this.previewData = this.formatCsvData(text);
        } else {
          // For regular text files, display as-is
          this.previewData = text;
        }
      })
      .catch(error => {
        console.error('Error loading text file:', error);
        this.previewData = 'Error loading text file content.';
      });
  }

  formatCsvData(csvText: string): string {
    try {
      // Split CSV into lines
      const lines = csvText.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length === 0) {
        return 'Empty CSV file.';
      }

      // Parse the first line as headers
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Parse data rows
      const dataRows = lines.slice(1).map(line => {
        return line.split(',').map(cell => cell.trim().replace(/"/g, ''));
      });

      // Create a markdown table
      let markdown = `# CSV File: ${this.file.fileName}\n\n`;
      markdown += `## Data Preview\n\n`;
      
      // Add headers
      markdown += '| ' + headers.join(' | ') + ' |\n';
      markdown += '|' + headers.map(() => '---').join('|') + '|\n';
      
      // Add data rows (limit to first 20 rows for preview)
      const previewRows = dataRows.slice(0, 20);
      previewRows.forEach(row => {
        markdown += '| ' + row.join(' | ') + ' |\n';
      });
      
      if (dataRows.length > 20) {
        markdown += `\n*Showing first 20 rows of ${dataRows.length} total rows.*\n`;
      }
      
      markdown += `\n**Total Rows**: ${dataRows.length}\n`;
      markdown += `**Total Columns**: ${headers.length}\n`;
      
      return markdown;
    } catch (error) {
      console.error('Error formatting CSV:', error);
      return `# CSV File: ${this.file.fileName}\n\n## Raw Content\n\n\`\`\`\n${csvText}\n\`\`\``;
    }
  }

  loadAudioPreview(fileUrl: string): void {
    this.previewType = 'audio';
    this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
  }

  loadVideoPreview(fileUrl: string): void {
    this.previewType = 'video';
    this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
  }

  loadDocumentPreview(): void {
    this.previewType = 'text';
    if (this.fileType === 'word') {
      this.previewData = this.getMockWordContent();
    } else if (this.fileType === 'excel') {
      this.previewData = this.getMockExcelContent();
    } else {
      this.previewData = this.getMockTextContent();
    }
  }

  loadMockPreview(): void {
    // Fallback to mock content when API doesn't provide URL
    switch (this.fileType) {
      case 'image':
        this.loadImagePreview(this.getMockImageUrl());
        break;
      case 'pdf':
        this.loadPdfPreview(this.getMockPdfUrl());
        break;
      case 'word':
      case 'excel':
      case 'text':
        this.loadDocumentPreview();
        break;
      case 'audio':
        this.loadAudioPreview(this.getMockAudioUrl());
        break;
      case 'video':
        this.loadVideoPreview(this.getMockVideoUrl());
        break;
      default:
        this.previewType = 'none';
    }
  }

  getMockImageUrl(): string {
    // Return a placeholder image URL based on file ID for consistency
    const hash = this.file.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const images = [
      'https://picsum.photos/1200/800?random=1',
      'https://picsum.photos/1200/800?random=2',
      'https://picsum.photos/1200/800?random=3',
      'https://picsum.photos/1200/800?random=4',
      'https://picsum.photos/1200/800?random=5'
    ];
    return images[Math.abs(hash) % images.length];
  }

  getMockPdfUrl(): string {
    // Return a sample PDF URL (using a public sample PDF)
    // Using a different PDF that should work better
    return 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';
  }

  getMockAudioUrl(): string {
    // Return a sample audio URL
    return 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav';
  }

  getMockVideoUrl(): string {
    // Return a sample video URL
    return 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4';
  }

  getMockWordContent(): string {
    return `
# ${this.file.fileName}

## Document Content

This is a sample Word document preview. In a real application, this would show the actual content of the Word document.

### Executive Summary
This document provides a comprehensive overview of our quarterly performance and strategic initiatives. The analysis covers key metrics, market trends, and future projections.

### Key Highlights:
- **Revenue Growth**: 15.2% increase compared to previous quarter
- **Market Expansion**: Successfully entered 3 new markets
- **Product Development**: Launched 2 new product lines
- **Customer Satisfaction**: Achieved 94% satisfaction rate

### Financial Performance
| Metric | Q1 | Q2 | Q3 | Q4 |
|--------|----|----|----|----|
| Revenue | $2.1M | $2.4M | $2.8M | $3.2M |
| Profit | $420K | $480K | $560K | $640K |
| Growth | 12% | 14% | 17% | 14% |

### Strategic Initiatives
1. **Digital Transformation**
   - Implemented new CRM system
   - Enhanced online presence
   - Improved customer engagement

2. **Market Expansion**
   - Entered European markets
   - Established partnerships
   - Increased market share

3. **Product Innovation**
   - R&D investment increased by 25%
   - 3 new patents filed
   - 2 products in development

### Recommendations
- Continue aggressive market expansion
- Increase R&D investment
- Strengthen customer relationships
- Explore new partnerships

This preview shows the formatted content that would appear in the actual Word document.
    `;
  }

  getMockExcelContent(): string {
    return `
# ${this.file.fileName}

## Spreadsheet Data

This is a sample Excel spreadsheet preview. In a real application, this would show the actual content of the Excel file.

### Sales Performance Dashboard

#### Quarterly Sales Data
| Product Category | Q1 Sales | Q2 Sales | Q3 Sales | Q4 Sales | Total |
|------------------|----------|----------|----------|----------|-------|
| Electronics | $125,000 | $142,000 | $168,000 | $195,000 | $630,000 |
| Clothing | $89,000 | $95,000 | $112,000 | $128,000 | $424,000 |
| Home & Garden | $67,000 | $78,000 | $89,000 | $102,000 | $336,000 |
| Sports | $45,000 | $52,000 | $61,000 | $73,000 | $231,000 |
| **Total** | **$326,000** | **$367,000** | **$430,000** | **$498,000** | **$1,621,000** |

#### Regional Performance
| Region | Sales | % of Total | Growth |
|--------|-------|------------|--------|
| North America | $812,000 | 50.1% | +18.2% |
| Europe | $486,000 | 30.0% | +15.7% |
| Asia Pacific | $324,000 | 20.0% | +22.1% |

#### Key Metrics
- **Total Revenue**: $1,621,000
- **Average Order Value**: $156.42
- **Customer Count**: 10,357
- **Growth Rate**: 18.7%
- **Profit Margin**: 23.4%

#### Charts and Analysis
- **Top Performing Product**: Electronics (38.9% of sales)
- **Fastest Growing Region**: Asia Pacific (+22.1%)
- **Best Quarter**: Q4 ($498,000)
- **Monthly Average**: $405,250

This preview shows the spreadsheet data that would appear in the actual Excel file.
    `;
  }

  getMockTextContent(): string {
    return `
# ${this.file.fileName}

## Text Document Content

This is a sample text document preview. In a real application, this would show the actual content of the text file.

### Document Information
- **File Name**: ${this.file.fileName}
- **File Type**: Text Document
- **Size**: ${this.getFileSize()}
- **Uploaded**: ${this.formatDate(this.file.dateUploaded)}

### Sample Content
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

### Key Points
1. **First Point**: This is the first important point in the document
2. **Second Point**: This is the second important point in the document
3. **Third Point**: This is the third important point in the document

### Summary
This preview shows the formatted content that would appear in the actual text file.
    `;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onPdfError(): void {
    this.pdfError = true;
    console.error('PDF preview error for file:', this.file.fileName);
  }

  onPdfLoad(): void {
    this.pdfError = false;
    console.log('PDF preview loaded successfully for file:', this.file.fileName);
  }

  onImageError(): void {
    // Handle image loading errors by showing a fallback
    console.error('Error loading image:', this.file.fileName);
    this.previewType = 'none';
  }

  onDownload(): void {
    if (this.isDownloading) return;

    this.isDownloading = true;
    this.downloadProgress = 0;

    // Simulate download progress
    const interval = setInterval(() => {
      this.downloadProgress += Math.random() * 25;
      if (this.downloadProgress >= 100) {
        this.downloadProgress = 100;
        this.isDownloading = false;
        clearInterval(interval);
        
        // Use proper error handling for download
        this.fileService.downloadFile(this.file).pipe(takeUntil(this.destroy$)).subscribe({
          next: (success) => {
            if (success) {
              console.log('Download completed successfully');
            } else {
              console.error('Download failed');
            }
            this.dialogRef.close();
          },
          error: (error) => {
            console.error('Error during download:', error);
            this.dialogRef.close();
          }
        });
      }
    }, 200);
  }

  getFileSize(): string {
    // Mock file size - in real app this would come from the file metadata
    // Use file ID to generate consistent size for each file
    const hash = this.file.id.toString().split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const sizes = ['2.5 كيلوبايت', '1.2 ميجابايت', '856 كيلوبايت', '3.1 ميجابايت', '512 كيلوبايت'];
    return sizes[Math.abs(hash) % sizes.length];
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isSupportedFormat(): boolean {
    return ['pdf', 'word', 'excel', 'image', 'audio', 'video', 'text', 'archive'].includes(this.fileType);
  }

  getFileTypeDisplayName(): string {
    switch (this.fileType) {
      case 'pdf': return 'مستند PDF';
      case 'word': return 'مستند Word';
      case 'excel': return 'جدول بيانات Excel';
      case 'image': return 'صورة';
      case 'audio': return 'ملف صوتي';
      case 'video': return 'ملف فيديو';
      case 'text': return 'ملف نصي';
      case 'archive': return 'ملف مضغوط';
      default: return 'ملف غير معروف';
    }
  }

  getUnsupportedMessage(): string {
    return 'هذا النوع من الملفات لا يدعم المعاينة المباشرة. يرجى تحميل الملف لعرضه في التطبيق المناسب.';
  }
} 