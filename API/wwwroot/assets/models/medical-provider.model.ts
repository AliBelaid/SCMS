export enum userType {
  Admin = 0,
  MedicalProviderManager = 1,
  Doctor = 2,
  Reception = 3,
  Clerk = 4,
  HospitalStaff = 5,
  MinistryInspector = 6,
  MaintenanceTech = 7,
  MedicalTechnician = 8,
  Patient = 9,
  BranchManager = 10
}

export type UserType = userType;

export enum userStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
  Pending = 'pending',
  Locked = 'locked'
}

export type UserStatus = userStatus;

export enum medicalProviderType {
  Individual = 'individual',
  Organization = 'organization',
  Group = 'group',
  Clinic = 'clinic',
  Pharmacy = 'pharmacy',
  Lab = 'lab',
  Radiology = 'radiology'
}

export interface MedicalProviderSettings {
  allowCashPayments: boolean;
  allowCardPayments: boolean;
  defaultCurrency: string;
  requireAppointments: boolean;
  allowWalkIns: boolean;
  defaultLanguage: 'en' | 'ar';
  timezone: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export interface WorkingHoursDay {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface WorkingHours {
  monday?: WorkingHoursDay;
  tuesday?: WorkingHoursDay;
  wednesday?: WorkingHoursDay;
  thursday?: WorkingHoursDay;
  friday?: WorkingHoursDay;
  saturday?: WorkingHoursDay;
  sunday?: WorkingHoursDay;
}

export interface MedicalProviderService {
  id: number;
  medicalProviderId: number;
  serviceCode: string;
  serviceName: string;
  price: number;
  category?: string;
  isActive: boolean;
}

export interface ContractMedicalProvider {
  id: number;
  contractId: number;
  medicalProviderId: number;
  isPreferred: boolean;
  isInNetwork: boolean;
  discountPercentage?: number;
  copaymentPercentage?: number;
  effectiveDate: Date | string;
  expiryDate?: Date | string;
  contractReference?: string;
  isActive: boolean;
  createdDate: Date | string;
  modifiedDate?: Date | string;
}

export interface PriceList {
  id: number;
  medicalProviderId: number;
  serviceCode: string;
  serviceName: string;
  price: number;
  effectiveDate: Date | string;
  expiryDate?: Date | string;
  isActive: boolean;
}

export interface MedicalProvider {
  id: number;
  name: string;
  code: string;
  city?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  type?: medicalProviderType;
  isActive: boolean;
  /** Legacy alias for isActive */
  active?: boolean;
  isHeadquarters?: boolean;
  managerId?: string;
  userCount?: number;
  activeUserCount?: number;
  settings?: MedicalProviderSettings;
  workingHours?: WorkingHours;
  services?: MedicalProviderService[];
  contractProviders?: ContractMedicalProvider[];
  priceLists?: PriceList[];
  legalName?: string;
  registrationNumber?: string;
  establishmentDate?: Date | string;
  description?: string;
  annualRevenue?: number;
  numberOfEmployees?: number;
  hasContract?: boolean;
  parentProviderId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type medicalProvider = MedicalProvider;

export interface MedicalProviderSummary {
  id: number;
  name: string;
  code: string;
  type?: medicalProviderType;
  address?: string;
  phone?: string;
  isActive: boolean;
  servicesCount?: number;
}

export interface medical_provider_dto extends MedicalProvider {
  active?: boolean;
}
export interface MedicalProviderDto extends MedicalProvider {}

export interface MedicalProviderWithUsers extends MedicalProvider {
  users: User[];
  primaryUser?: User;
}

export interface MedicalProviderApprovalSettings {
  AutoApproveReceptions: boolean;
  AutoApprovalThreshold?: number;
  ApprovalTimeoutDays: number;
  RequireManagerApproval: boolean;
  AllowBulkApproval: boolean;
  ExcludedServices: string[];
  RequiredApprovalUserTypes: string[];
}

export interface UserPermissions {
  canView: string[];
  canEdit: string[];
  canDelete: string[];
  excludedUsers: string[];
  isPublic: boolean;
}

export interface User {
  id: number;
  userName: string;
  code?: string;
  displayName: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  userType: userType;
  status: userStatus;
  isActive: boolean;
  medicalProviderId: number;
  medicalProviderName?: string;
  additionalBranches?: number[];
  isPrimaryUser?: boolean;
  roles: string[];
  permissions: string[];
  token?: string;
  profileImage?: string;
  lastLogin?: Date;
  lastActive?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface MedicalProviderUserDto extends User {
  medicalProviderCode?: string;
}

export interface LoginRequest {
  code: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  medicalProvider?: MedicalProvider;
}

export interface PasswordResetRequest {
  userName: string;
  medicalProviderCode?: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface CreateUserRequest {
  userName: string;
  displayName: string;
  password: string;
  phoneNumber?: string;
  email?: string;
  userType: userType;
  medicalProviderId: number;
  isPrimaryUser?: boolean;
  roles?: string[];
  permissions?: string[];
  isActive?: boolean;
}

export interface updateUserRequest {
  id: number;
  displayName?: string;
  phoneNumber?: string;
  email?: string;
  userType?: userType;
  status?: userStatus;
  isActive?: boolean;
  medicalProviderId?: number;
  isPrimaryUser?: boolean;
  roles?: string[];
  permissions?: string[];
}

export interface UpdateUserRequest extends updateUserRequest {}

export interface MoveUserToMedicalProviderRequest {
  medicalProviderId: number;
  isPrimary?: boolean;
  reason?: string;
}

export interface UserSearchParams {
  search?: string;
  medicalProviderId?: number;
  userType?: userType;
  status?: userStatus;
  isActive?: boolean;
  roles?: string[];
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface medicalProviderSearchParams {
  search?: string;
  city?: string;
  active?: boolean;
  hasManager?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface user_dto {
  id: number | string;
  userName: string;
  displayName?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  userType: number;
  status: string;
  isActive: boolean;
  medicalProviderId: number;
  medicalProviderName?: string;
  roles?: string[];
  permissions?: string[];
  profileImage?: string;
  lastLogin?: Date | string;
  lastActive?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  isPrimaryUser?: boolean;
}

export interface user_search_params_dto {
  search?: string;
  medicalProviderId?: number;
  userType?: number;
  status?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface update_user_request_dto {
  id: number | string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  userType?: number;
  status?: string;
  isActive?: boolean;
  medicalProviderId?: number;
  isPrimaryUser?: boolean;
  roles?: string[];
  permissions?: string[];
}

export interface createMedicalProviderRequest {
  name: string;
  code: string;
  city?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  active?: boolean;
  managerId?: string;
  settings?: Partial<MedicalProviderSettings>;
  workingHours?: Partial<WorkingHours>;
}

export interface updateMedicalProviderRequest {
  name?: string;
  city?: string;
  address?: string;
  phoneNumber?: string;
  latitude?: number;
  longitude?: number;
  email?: string;
  active?: boolean;
  isHeadquarters?: boolean;
  autoApproveReceptions?: boolean;
  autoApprovalThreshold?: number;
  approvalWorkflowSettings?: string;
  settings?: Partial<MedicalProviderSettings>;
  workingHours?: Partial<WorkingHours>;
  printerName?: string;
  userCount?: number;
  activeUserCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BulkUserOperation {
  userIds: number[] | string[];
  operation: 'activate' | 'deactivate' | 'delete' | 'changeType' | 'moveMedicalProvider';
  parameters?: {
    isActive?: boolean;
    userType?: userType;
    medicalProviderId?: string | number;
    reason?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UserListResponse extends PaginatedResponse<User> {}

export interface MedicalProviderListResponse extends PaginatedResponse<MedicalProvider> {}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  statusCode?: number;
  timestamp?: Date;
}

export class ModelUtils {
  static getUserTypeDisplayName(userTypeValue: userType): string {
    const typeNames: Record<userType, string> = {
      [userType.Admin]: 'Administrator',
      [userType.MedicalProviderManager]: 'Medical Provider Manager',
      [userType.Doctor]: 'Doctor',
      [userType.Reception]: 'Reception',
      [userType.Clerk]: 'Clerk',
      [userType.HospitalStaff]: 'Hospital Staff',
      [userType.MinistryInspector]: 'Ministry Inspector',
      [userType.MaintenanceTech]: 'Maintenance Technician',
      [userType.MedicalTechnician]: 'Medical Technician',
      [userType.Patient]: 'Patient',
      [userType.BranchManager]: 'Branch Manager'
    };
    return typeNames[userTypeValue] ?? 'Unknown';
  }

  static generateMedicalProviderCode(providerName: string, city: string): string {
    const nameCode = providerName.substring(0, 3).toUpperCase();
    const cityCode = city.substring(0, 2).toUpperCase();
    const randomNum = Math.floor(Math.random() * 99).toString().padStart(2, '0');
    return `${nameCode}${cityCode}${randomNum}`;
  }

  static generateUserName(fullName: string, providerCode: string): string {
    const cleaned = fullName
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 6);
    const randomNum = Math.floor(Math.random() * 999).toString().padStart(3, '0');
    return `${cleaned}_${providerCode.toLowerCase()}_${randomNum}`;
  }

  static isActiveMedicalProvider(provider: MedicalProvider): boolean {
    if (typeof provider.isActive === 'boolean') {
      return provider.isActive;
    }
    if (typeof provider.active === 'boolean') {
      return provider.active;
    }
    return false;
  }

  static isActiveUser(user: User): boolean {
    return user.isActive && user.status === userStatus.Active;
  }

  static canUserAccessMedicalProvider(user: User, providerId: number): boolean {
    if (user.userType === userType.Admin) {
      return true;
    }
    if (user.medicalProviderId === providerId) {
      return true;
    }
    return user.additionalBranches?.includes(providerId) ?? false;
  }

  static getUserPermissions(userTypeValue: userType): string[] {
    const permissions: Record<userType, string[]> = {
      [userType.Admin]: ['*'],
      [userType.MedicalProviderManager]: ['medicalProvider:manage', 'users:manage', 'reports:view'],
      [userType.Doctor]: ['patients:manage', 'records:create', 'reports:view'],
      [userType.Reception]: ['patients:register', 'appointments:manage', 'basic:view'],
      [userType.Clerk]: ['data:entry', 'documents:manage', 'basic:view'],
      [userType.HospitalStaff]: ['basic:view', 'tasks:assigned'],
      [userType.MinistryInspector]: ['reports:view', 'audit:access'],
      [userType.MaintenanceTech]: ['equipment:manage', 'maintenance:schedule'],
      [userType.MedicalTechnician]: ['equipment:operate', 'tests:perform'],
      [userType.Patient]: ['profile:view', 'appointments:book'],
      [userType.BranchManager]: ['branch:manage', 'users:manage']
    };
    return permissions[userTypeValue] ?? ['basic:view'];
  }
}

export const DEFAULT_MEDICAL_PROVIDER_SETTINGS: MedicalProviderSettings = {
  allowCashPayments: true,
  allowCardPayments: true,
  defaultCurrency: 'USD',
  requireAppointments: false,
  allowWalkIns: true,
  defaultLanguage: 'en',
  timezone: 'UTC',
  emailNotifications: true,
  smsNotifications: false
};

export const DEFAULT_WORKING_HOURS: WorkingHours = {
  monday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
  tuesday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
  wednesday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
  thursday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
  friday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
  saturday: { isOpen: false },
  sunday: { isOpen: false }
};


