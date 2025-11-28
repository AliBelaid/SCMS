// ==================== Enhanced Models for Angular Frontend ====================

export interface Department {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  description?: string;
  isActive: boolean;
  subjects: Subject[];
  createdAt: Date;
  createdBy: string;
}

export interface Subject {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  departmentId: string;
  incomingPrefix: string;
  outgoingPrefix: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Order {
  id: string;
  referenceNumber: string;
  type: 'incoming' | 'outgoing';
  departmentId: string;
  departmentCode: string;
  subjectId: string;
  subjectCode: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'archived' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachments: OrderAttachment[];
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  dueDate?: Date;
  expirationDate?: Date;
  isExpired?: boolean;
  isArchived: boolean;
  archivedAt?: Date;
  archivedBy?: string;
  archiveReason?: string;
  notes?: string;
  isPublic: boolean;

  // Permissions
  userPermissions?: UserPermission[];
  departmentAccesses?: DepartmentAccess[];
  userExceptions?: UserException[];
}

export interface OrderAttachment {
  id: string;
  orderId: string;
  fileName: string;
  fileSize: number;
  fileType: 'pdf' | 'image' | 'document' | 'other';
  fileUrl: string;
  uploadedAt: Date;
  uploadedBy: string;
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
  departmentId: string;
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
  Full = 3,
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

// ==================== Order History Models (NEW) ====================

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
  Deleted = 17,
}

// ==================== DTOs ====================

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

// ==================== Filters ====================

export interface OrderFilters {
  searchTerm?: string;
  type?: 'incoming' | 'outgoing' | 'all';
  departmentId?: string;
  subjectId?: string;
  status?: string;
  priority?: string;
  createdBy?: string;
  dateFrom?: Date;
  dateTo?: Date;
  isExpired?: boolean;
  isArchived?: boolean;
  hasExpiration?: boolean;
  expiringInDays?: number;
}

// ==================== Create/Update DTOs ====================

export interface CreateOrderDto {
  referenceNumber: string;
  type: 'incoming' | 'outgoing';
  departmentId: string;
  subjectId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate?: Date;
  expirationDate?: Date;
  isPublic: boolean;
  notes?: string;
}

export interface UpdateOrderDto extends Partial<CreateOrderDto> {
  updatedBy: string;
}

// ==================== Permission Helper Types ====================

export interface PermissionCheck {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManagePermissions: boolean;
  reason?: string;
}

export interface UserPermissionSummary {
  hasDirectPermission: boolean;
  hasDepartmentAccess: boolean;
  isExcluded: boolean;
  isOwner: boolean;
  isPublic: boolean;
  effectivePermissions: string[];
}