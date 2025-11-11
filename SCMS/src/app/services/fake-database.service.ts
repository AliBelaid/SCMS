import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppUser } from '../models/app-user';
import { FileEntry } from '../models/file-entry';

@Injectable({
  providedIn: 'root'
})
export class FakeDatabaseService {
  private usersSubject = new BehaviorSubject<AppUser[]>([
    {
      code: 'ADMIN001',
      password: 'admin123',
      description: 'System Administrator',
      role: 'Admin',
      isActive: true
    },
    {
      code: 'MEMBER001',
      password: 'member123',
      description: 'John Doe - Marketing Team',
      role: 'Member',
      isActive: true
    },
    {
      code: 'MEMBER002',
      password: 'member456',
      description: 'Jane Smith - Sales Team',
      role: 'Member',
      isActive: true
    },
    {
      code: 'MEMBER003',
      password: 'member789',
      description: 'Bob Johnson - IT Team',
      role: 'Member',
      isActive: false
    }
  ]);

  private filesSubject = new BehaviorSubject<FileEntry[]>([
    {
      id: '1',
      fileName: 'Company_Policy_2024.pdf',
      fileType: 'pdf',
      uploadedBy: 'ADMIN001',
      dateUploaded: '2024-01-15T10:30:00Z',
      allowedUsers: ['MEMBER001', 'MEMBER002', 'MEMBER003'],
      excludedUsers: []
    },
    {
      id: '2',
      fileName: 'Sales_Report_Q1.xlsx',
      fileType: 'excel',
      uploadedBy: 'ADMIN001',
      dateUploaded: '2024-01-20T14:15:00Z',
      allowedUsers: ['MEMBER001', 'MEMBER002'],
      excludedUsers: ['MEMBER003']
    },
    {
      id: '3',
      fileName: 'Marketing_Strategy.docx',
      fileType: 'word',
      uploadedBy: 'ADMIN001',
      dateUploaded: '2024-01-25T09:45:00Z',
      allowedUsers: ['MEMBER001'],
      excludedUsers: []
    },
    {
      id: '4',
      fileName: 'Office_Photo.jpg',
      fileType: 'image',
      uploadedBy: 'ADMIN001',
      dateUploaded: '2024-01-30T16:20:00Z',
      allowedUsers: ['MEMBER001', 'MEMBER002', 'MEMBER003'],
      excludedUsers: []
    }
  ]);

  users$ = this.usersSubject.asObservable();
  files$ = this.filesSubject.asObservable();

  getUsers(): AppUser[] {
    return this.usersSubject.value;
  }

  getFiles(): FileEntry[] {
    return this.filesSubject.value;
  }

  addUser(user: AppUser): void {
    const currentUsers = this.usersSubject.value;
    this.usersSubject.next([...currentUsers, user]);
  }

  updateUser(updatedUser: AppUser): void {
    const currentUsers = this.usersSubject.value;
    const index = currentUsers.findIndex(u => u.code === updatedUser.code);
    if (index !== -1) {
      currentUsers[index] = updatedUser;
      this.usersSubject.next([...currentUsers]);
    }
  }

  deleteUser(userCode: string): void {
    const currentUsers = this.usersSubject.value;
    const filteredUsers = currentUsers.filter(u => u.code !== userCode);
    this.usersSubject.next(filteredUsers);
  }

  addFile(file: FileEntry): void {
    const currentFiles = this.filesSubject.value;
    this.filesSubject.next([...currentFiles, file]);
  }

  updateFile(updatedFile: FileEntry): void {
    const currentFiles = this.filesSubject.value;
    const index = currentFiles.findIndex(f => f.id === updatedFile.id);
    if (index !== -1) {
      currentFiles[index] = updatedFile;
      this.filesSubject.next([...currentFiles]);
    }
  }

  deleteFile(fileId: string): void {
    const currentFiles = this.filesSubject.value;
    const filteredFiles = currentFiles.filter(f => f.id !== fileId);
    this.filesSubject.next(filteredFiles);
  }
} 