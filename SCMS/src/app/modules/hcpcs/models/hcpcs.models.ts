// ==================== HCPCS MODELS ====================

/**
 * HCPCS Code Entity - Healthcare Common Procedure Coding System
 */
export interface HCPCSCode {
  id?: string;
  code: string;
  actionCode?: string;
  shortDescription: string;
  longDescription: string;
  category?: string;
  effectiveDate?: Date | string;
  terminationDate?: Date | string;
  isActive?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * HCPCS List Response with Pagination
 */
export interface HCPCSListResponse {
  items: HCPCSCode[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

/**
 * HCPCS Query Parameters
 */
export interface HCPCSQueryParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  category?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * HCPCS Create/Update DTO
 */
export interface HCPCSCreateDto {
  code: string;
  actionCode?: string;
  shortDescription: string;
  longDescription: string;
  category?: string;
  effectiveDate?: Date | string;
  terminationDate?: Date | string;
  isActive?: boolean;
}

/**
 * Excel Import Result
 */
export interface HCPCSImportResult {
  totalProcessed: number;
  successful: number;
  failed: number;
  errors: HCPCSImportError[];
  duplicates: string[];
}

/**
 * Import Error Detail
 */
export interface HCPCSImportError {
  row: number;
  code: string;
  error: string;
}

/**
 * Bulk Delete Request
 */
export interface HCPCSBulkDeleteRequest {
  ids: string[];
}

/**
 * HCPCS Statistics
 */
export interface HCPCSStatistics {
  totalCodes: number;
  activeCount: number;
  inactiveCount: number;
  categoriesCount: number;
  recentlyAdded: number;
}