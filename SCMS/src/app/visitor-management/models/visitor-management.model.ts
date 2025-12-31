// ==================== Visitor Management Models ====================

export interface Visitor {
  id: number;
  fullName: string;
  nationalId?: string;
  phone?: string;
  company?: string;
  medicalNotes?: string;
  personImageUrl?: string;
  idCardImageUrl?: string;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Visit {
  id: number;
  visitNumber: string;
  visitorId: number;
  visitorName: string;
  carPlate?: string;
  carImageUrl?: string;
  departmentId: number;
  departmentName: string;
  employeeToVisit: string;
  visitReason?: string;
  expectedDurationHours?: number;
  status: VisitStatus;
  checkInAt: Date;
  checkOutAt?: Date;
  createdByUserId: number;
  createdByUserName: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum VisitStatus {
  CheckedIn = 'checkedin',
  CheckedOut = 'checkedout',
  Rejected = 'rejected',
  Cancelled = 'cancelled'
}

// Legacy status values for backward compatibility
export const LegacyVisitStatus = {
  Ongoing: 'checkedin',
  Completed: 'checkedout',
  Incomplete: 'rejected',
  Cancelled: 'cancelled'
} as const;

export interface VisitorDepartment {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
}

// ==================== DTOs for API Requests ====================

export interface CreateVisitorDto {
  fullName: string;
  nationalId?: string;
  phone?: string;
  company?: string;
  medicalNotes?: string;
  personImageBase64?: string;
  idCardImageBase64?: string;
}

export interface VisitorDtoWithBase64 extends Visitor {
  personImageBase64?: string;
  idCardImageBase64?: string;
}

export interface CreateVisitDto {
  visitor: VisitorDtoWithBase64;
  carPlate?: string;
  carImageBase64?: string;
  departmentId: number;
  employeeToVisit: string;
  visitReason?: string;
  expectedDurationHours?: number;
}

export interface UpdateVisitDto {
  departmentId?: number;
  employeeToVisit?: string;
  visitReason?: string;
  expectedDurationHours?: number;
  status?: VisitStatus;
}

// ==================== Statistics & Dashboard ====================

export interface DashboardStats {
  totalVisits: number;
  totalCompleted: number;
  totalOngoing: number;
  todayVisits: number;
  weekVisits: number;
  monthVisits: number;
  visitsPerDepartment: DepartmentVisitCount[];
  visitsPerUser: UserVisitCount[];
  averageDurationMinutes: number;
}

export interface DepartmentVisitCount {
  departmentId: number;
  departmentName: string;
  visitCount: number;
  percentage?: number;
}

export interface UserVisitCount {
  userId: number;
  userName: string;
  visitCount: number;
  rank?: number;
}

export interface HourlyDistribution {
  hour: string;
  count: number;
  percentage?: number;
}

export interface VisitSummary {
  date: Date;
  incomingCount: number;
  outgoingCount: number;
  totalCount: number;
}

// ==================== Filters & Pagination ====================

export interface VisitFilters {
  searchTerm?: string;
  departmentId?: number;
  status?: VisitStatus | 'all';
  dateFrom?: Date;
  dateTo?: Date;
  createdByUserId?: number;
  hasCarPlate?: boolean;
}

export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ==================== Reports ====================

export interface VisitReport {
  reportId: string;
  generatedAt: Date;
  generatedBy: string;
  reportType: ReportType;
  dateFrom: Date;
  dateTo: Date;
  totalVisits: number;
  departmentBreakdown: DepartmentVisitCount[];
  statusBreakdown: StatusBreakdown[];
  peakHours: HourlyDistribution[];
}

export enum ReportType {
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
  Custom = 'custom'
}

export interface StatusBreakdown {
  status: VisitStatus;
  count: number;
  percentage: number;
}

// ==================== Visitor Profile ====================

export interface VisitorProfile {
  visitor: Visitor;
  totalVisits: number;
  completedVisits: number;
  ongoingVisits: number;
  recentVisits: Visit[];
  averageVisitDuration: number;
  lastVisitDate?: Date;
  frequentDepartments: DepartmentVisitCount[];
}

// ==================== Search Results ====================

export interface VisitorSearchResult {
  visitor: Visitor;
  lastVisit?: Visit;
  totalVisits: number;
  matchScore: number;
}

export interface VisitSearchResult {
  visit: Visit;
  visitor: Visitor;
  matchScore: number;
}

// ==================== Notifications ====================

export interface VisitNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  visit: Visit;
  timestamp: Date;
  isRead: boolean;
}

export enum NotificationType {
  VisitCreated = 'visit_created',
  VisitUpdated = 'visit_updated',
  VisitCompleted = 'visit_completed',
  VisitorBlocked = 'visitor_blocked',
  LongStay = 'long_stay',
  SystemAlert = 'system_alert'
}

// ==================== Real-time Events ====================

export interface VisitCreatedEvent {
  visit: Visit;
  createdBy: string;
  timestamp: Date;
}

export interface VisitUpdatedEvent {
  visit: Visit;
  action: 'checkout' | 'update' | 'status_change';
  timestamp: Date;
}

export interface VisitorBlockedEvent {
  visitorId: number;
  visitorName: string;
  reason: string;
  blockedBy: string;
  timestamp: Date;
}

// ==================== Time Periods ====================

export enum TimePeriod {
  Today = 'today',
  Yesterday = 'yesterday',
  ThisWeek = 'week',
  ThisMonth = 'month',
  LastMonth = 'last_month',
  Custom = 'custom',
  All = 'all'
}

// ==================== Export Options ====================

export interface ExportOptions {
  format: ExportFormat;
  includeHeaders: boolean;
  includeStats: boolean;
  filters?: VisitFilters;
  columns?: string[];
}

export enum ExportFormat {
  Excel = 'excel',
  PDF = 'pdf',
  CSV = 'csv',
  JSON = 'json'
}

// ==================== Badge Printing ====================

export interface VisitorBadge {
  visitNumber: string;
  visitorName: string;
  company?: string;
  department: string;
  employeeToVisit: string;
  checkInTime: Date;
  validUntil?: Date;
  qrCode?: string;
  photoUrl?: string;
}

// ==================== Security ====================

export interface BlockedVisitor {
  visitorId: number;
  visitorName: string;
  nationalId?: string;
  reason: string;
  blockedAt: Date;
  blockedBy: string;
  expiresAt?: Date;
}

export interface SecurityAlert {
  id: string;
  alertType: AlertType;
  severity: AlertSeverity;
  message: string;
  relatedVisitId?: number;
  relatedVisitorId?: number;
  timestamp: Date;
  isResolved: boolean;
}

export enum AlertType {
  BlockedVisitorAttempt = 'blocked_visitor',
  UnauthorizedAccess = 'unauthorized_access',
  LongStayAlert = 'long_stay',
  SuspiciousActivity = 'suspicious',
  SystemError = 'system_error'
}

export enum AlertSeverity {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical'
}

// ==================== Configuration ====================

export interface VisitorManagementConfig {
  maxVisitDurationHours: number;
  requireCarPlate: boolean;
  requireNationalId: boolean;
  requirePhoto: boolean;
  enableNotifications: boolean;
  autoArchiveAfterDays: number;
  alertLongStayAfterHours: number;
  workingHoursStart: string;
  workingHoursEnd: string;
}

// ==================== Audit Log ====================

export interface VisitAuditLog {
  id: number;
  visitId: number;
  action: AuditAction;
  description: string;
  performedBy: string;
  performedAt: Date;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
}

export enum AuditAction {
  Created = 'created',
  Updated = 'updated',
  CheckedOut = 'checked_out',
  Cancelled = 'cancelled',
  StatusChanged = 'status_changed',
  VisitorBlocked = 'visitor_blocked',
  VisitorUnblocked = 'visitor_unblocked'
}

// ==================== Helper Types ====================

export interface KeyValuePair<T = any> {
  key: string;
  value: T;
}

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface TimelineItem {
  time: Date;
  title: string;
  description: string;
  icon?: string;
  color?: string;
}

// ==================== API Response ====================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  timestamp: Date;
}

export interface ApiError {
  statusCode: number;
  message: string;
  details?: string;
  timestamp: Date;
}

// ==================== Loading States ====================

export interface LoadingState {
  isLoading: boolean;
  isRefreshing: boolean;
  error?: string;
}

// ==================== Cache ====================

export interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  expiresAt: Date;
}

export interface CacheConfig {
  enabled: boolean;
  ttlMinutes: number;
  maxEntries: number;
}
