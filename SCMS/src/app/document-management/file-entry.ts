export interface FileEntry {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'word' | 'excel' | 'image' | 'audio' | 'video' | 'text' | 'archive' | 'unknown';
  uploadedBy: string;
  dateUploaded: string;
  excludedUsers: string[]; // user codes explicitly blocked
} 