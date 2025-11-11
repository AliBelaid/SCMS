import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'role',
  standalone: true
})
export class RolePipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'Admin':
        return 'مدير';
      case 'Member':
        return 'عضو';
      case 'Uploader':
        return 'رافع ملفات';
      default:
        return value;
    }
  }
} 