// view-models.interface.ts - UI View Models
export interface Dashboard {
  corporateClients: {
    total: number;
    active: number;
    inactive: number;
  };
  contracts: {
    total: number;
    active: number;
    expiringSoon: number;
  };
  subscribers: {
    total: number;
    employees: number;
    dependents: number;
  };
  claims: {
    pending: number;
    approved: number;
    rejected: number;
    totalAmount: number;
  };
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: number;
  type: 'claim' | 'subscriber' | 'contract' | 'approval';
  title: string;
  description: string;
  timestamp: Date | string;
  status?: string;
}

export interface FilterOptions {
  searchTerm?: string;
  status?: string;
  dateFrom?: Date | string;
  dateTo?: Date | string;
  corporateClientId?: number;
  contractId?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDesc?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}
