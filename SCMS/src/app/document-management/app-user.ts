export interface AppUser {
  id?: number;
  code: string;
  password?: string;
  description: string;
  role: 'Admin' | 'Member' | 'Uploader';
  isActive: boolean;
  token?: string;
  lastActive?: Date;
  country?: string;
  preferredLanguage?: string;
} 