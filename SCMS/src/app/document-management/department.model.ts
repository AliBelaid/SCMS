// ==================== Department User Model ====================

export interface DepartmentUser {
  id: string;
  userId: string;
  userCode: string;
  userEmail: string;
  userName: string;
  position?: string;
  isHead: boolean;
  joinedAt: Date;
  leftAt?: Date;
  notes?: string;
  isActive: boolean;
}

// ==================== Core Models ====================

export interface Department {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  managerId?: number;
  managerName?: string;
  subjects: Subject[];
  users?: DepartmentUser[];
  usersCount?: number;
  createdBy?: string;
}

export interface Subject {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  description?: string;
  departmentId: string;
  incomingPrefix?: string;
  outgoingPrefix?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Order {
  id: string;
  referenceNumber: string;
  type: 'incoming' | 'outgoing';
  departmentId: string;
  departmentNameAr?: string;
  departmentCode?: string;
  subjectId: string;
  subjectNameAr?: string;
  subjectCode?: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: Date;
  updatedAt?: Date;
  createdBy: string;
  createdByName?: string;
  updatedBy?: string;
  updatedByName?: string;
  dueDate?: Date;
  expirationDate?: Date;
  isPublic: boolean;
  attachments?: OrderAttachment[];
  attachmentsCount?: number; // Count of attachments (from API)
  history?: OrderHistory[];
  permissions?: OrderPermission[];
  userPermissions?: UserPermission[]; // For backward compatibility and direct user permissions
  userExceptions?: UserException[]; // Users explicitly excluded
  notes?: string;
}

export interface OrderAttachment {
  id: string;
  orderId: string;
  documentId?: number; // Reference to original DocumentViewer document
  fileName: string;
  filePath: string;
  fileUrl?: string; // URL for accessing the file
  fileSize: number;
  fileType: string;
  uploadedAt: Date;
  uploadedBy: string;
  uploadedByName?: string;
  canView?: boolean; // Whether file can be viewed inline (PDF/images)
  canDownload?: boolean; // Whether file can be downloaded
}

export interface OrderHistory {
  id: number;
  orderId: number;
  action: OrderAction;
  description: string;
  oldValue?: string;
  newValue?: string;
  performedById: number;
  performedByName: string;
  performedAt: Date;
  notes?: string;
}

export enum OrderAction {
  Created = 1,
  Updated = 2,
  StatusChanged = 3,
  PriorityChanged = 4,
  Assigned = 5,
  AttachmentAdded = 6,
  AttachmentRemoved = 7,
  PermissionGranted = 8,
  PermissionRevoked = 9,
  DepartmentAccessGranted = 10,
  DepartmentAccessRevoked = 11,
  UserExcluded = 12,
  UserExclusionRemoved = 13,
  ExpirationSet = 14,
  Archived = 15,
  Restored = 16,
  Deleted = 17
}

export interface OrderPermission {
  orderId: string;
  userId?: string;
  userCode?: string;
  departmentId?: string;
  departmentCode?: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  canDownload: boolean;
  canPrint: boolean;
  canComment: boolean;
  canApprove: boolean;
  grantedAt: Date;
  grantedBy: string;
}

// ==================== Permission Models ====================

export interface UserPermission {
  id: number;
  userId: number;
  userCode: string;
  userEmail: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  canDownload: boolean;
  canPrint: boolean;
  canComment: boolean;
  canApprove: boolean;
  grantedAt: Date;
  expiresAt?: Date;
  isExpired: boolean;
  grantedByName: string;
}

export interface DepartmentAccess {
  id: number;
  departmentId: number;
  departmentCode: string;
  departmentNameAr: string;
  accessLevel: AccessLevel;
  accessLevelName: string;
  grantedAt: Date;
  expiresAt?: Date;
  isExpired: boolean;
  grantedByName: string;
}

export enum AccessLevel {
  ViewOnly = 1,
  Edit = 2,
  Full = 3
}

export interface UserException {
  id: number;
  userId: number;
  userCode: string;
  userEmail: string;
  reason: string;
  addedAt: Date;
  expiresAt?: Date;
  isExpired: boolean;
  addedByName: string;
}

export interface EffectivePermissions {
  userId: number;
  orderId: number;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  canDownload: boolean;
  canPrint: boolean;
  canComment: boolean;
  canApprove: boolean;
  isOwner: boolean;
  isExcluded: boolean;
  permissionSource: 'Owner' | 'Direct' | 'Department' | 'Public' | 'None';
}

// ==================== DTOs ====================

export interface CreateDepartmentDto {
  code: string;
  nameAr: string;
  nameEn: string;
  description?: string;
  isActive?: boolean;
  managerId?: number;
  subjects?: CreateSubjectDto[];
  users?: AddDepartmentUserDto[];
}

export interface UpdateDepartmentDto {
  code?: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  isActive?: boolean;
  managerId?: number;
}

export interface CreateSubjectDto {
  code: string;
  nameAr: string;
  nameEn: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateSubjectDto {
  code?: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  isActive?: boolean;
}

export interface AddDepartmentUserDto {
  userId: number;
  position?: string;
  isHead?: boolean;
  notes?: string;
}

export interface UpdateDepartmentUserDto {
  position?: string;
  isHead?: boolean;
  notes?: string;
}

// ==================== Order Creation DTO ====================

export interface CreateOrderDto {
  referenceNumber?: string;
  type: 'incoming' | 'outgoing';
  departmentId: string;
  departmentCode?: string;
  subjectId: string;
  subjectCode?: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate?: Date;
  expirationDate?: Date;
  notes?: string;
  isPublic: boolean;
  userPermissions?: GrantUserPermissionDto[];
  departmentAccesses?: GrantDepartmentAccessDto[];
  userExceptions?: AddUserExceptionDto[];
  attachmentIds?: number[];
}

export interface GrantUserPermissionDto {
  userId: number;
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canShare?: boolean;
  canDownload?: boolean;
  canPrint?: boolean;
  canComment?: boolean;
  canApprove?: boolean;
  expiresAt?: Date;
  notes?: string;
}

export interface GrantDepartmentAccessDto {
  departmentId: string;
  accessLevel: AccessLevel;
  expiresAt?: Date;
  notes?: string;
}

export interface AddUserExceptionDto {
  userId: number;
  reason: string;
  expiresAt?: Date;
}


export interface AddUserExceptionDto {
  userId: number;
  reason: string;
  expiresAt?: Date;
}

export interface SetExpirationDto {
  expirationDate: Date;
}

export interface ArchiveOrderDto {
  reason: string;
}

// ==================== Archive Models ====================

export interface ArchivedOrder {
  id: number;
  referenceNumber: string;
  title: string;
  description: string;
  departmentName: string;
  subjectName: string;
  expirationDate: Date;
  archivedAt: Date;
  archiveReason: string;
  archivedByName: string;
  canBeRestored: boolean;
}

export interface ExpirationWarning {
  orderId: number;
  referenceNumber: string;
  title: string;
  expirationDate: Date;
  daysUntilExpiration: number;
  priority: string;
}

// ==================== Dashboard Stats ====================

export interface DashboardStats {
  totalOrders: number;
  incomingOrders: number;
  outgoingOrders: number;
  pendingOrders: number;
  completedOrders: number;
  expiredOrders: number;
  archivedOrders: number;
  ordersByDepartment: { department: string; count: number }[];
  ordersBySubject: { subject: string; count: number }[];
  ordersByMonth: { month: string; incoming: number; outgoing: number }[];
  recentOrders: Order[];
  expirationWarnings: ExpirationWarning[];
}

// ==================== Helper Types ====================

export type DirectoryUser = {
  id: number;
  code: string;
  email: string;
  name: string;
};

// ==================== DTOs ====================

export interface CreateSubjectDto {
  code: string;
  nameAr: string;
  nameEn: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateSubjectDto {
  code?: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  isActive?: boolean;
}

export interface AddDepartmentUserDto {
  userId: number;
  position?: string;
  isHead?: boolean;
  notes?: string;
}

export interface UpdateDepartmentUserDto {
  position?: string;
  isHead?: boolean;
  notes?: string;
}

// ==================== Order Creation DTO ====================

export interface CreateOrderDto {
  referenceNumber?: string;
  type: 'incoming' | 'outgoing';
  departmentId: string;
  departmentCode?: string;
  subjectId: string;
  subjectCode?: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate?: Date;
  expirationDate?: Date;
  notes?: string;
  isPublic: boolean;
  userPermissions?: GrantUserPermissionDto[];
  departmentAccesses?: GrantDepartmentAccessDto[];
  userExceptions?: AddUserExceptionDto[];
  attachmentIds?: number[];
}

export interface GrantUserPermissionDto {
  userId: number;
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canShare?: boolean;
  canDownload?: boolean;
  canPrint?: boolean;
  canComment?: boolean;
  canApprove?: boolean;
  expiresAt?: Date;
  notes?: string;
}

export interface GrantDepartmentAccessDto {
  departmentId: string;
  accessLevel: AccessLevel;
  expiresAt?: Date;
  notes?: string;
}

export interface AddUserExceptionDto {
  userId: number;
  reason: string;
  expiresAt?: Date;
}
