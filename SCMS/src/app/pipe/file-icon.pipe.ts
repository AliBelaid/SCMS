import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileIcon',
  standalone: true
})
export class FileIconPipe implements PipeTransform {
  transform(fileType: string): string {
    switch (fileType) {
      case 'pdf':
        return 'picture_as_pdf';
      case 'word':
        return 'description';
      case 'excel':
        return 'table_chart';
      case 'text':
        return 'article';
      case 'image':
        return 'image';
      case 'audio':
        return 'audiotrack';
      case 'video':
        return 'video_library';
      case 'archive':
        return 'folder_zip';
      default:
        return 'insert_drive_file';
    }
  }
} 