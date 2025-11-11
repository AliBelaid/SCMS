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
    incomingPrefix: string; // Prefix code for incoming orders
    outgoingPrefix: string; // Prefix code for outgoing orders
    isActive: boolean;
    createdAt: Date;
  }
  
  export interface Order {
    id: string;
    referenceNumber: string; // Format: {DeptCode}-{SubjectCode}-{YYYY}-{NNNN}
    type: 'incoming' | 'outgoing';
    departmentId: string;
    departmentCode: string;
    subjectId: string;
    subjectCode: string;
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed' | 'archived';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    attachments: OrderAttachment[];
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    dueDate?: Date;
    permissions: OrderPermissions;
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
  
  export interface OrderPermissions {
    canView: string[]; // User codes who can view
    canEdit: string[]; // User codes who can edit
    canDelete: string[]; // User codes who can delete
    excludedUsers: string[]; // User codes who are excluded from viewing
    isPublic: boolean; // If true, all users can view
  }
  
  export interface DashboardStats {
    totalOrders: number;
    incomingOrders: number;
    outgoingOrders: number;
    pendingOrders: number;
    completedOrders: number;
    ordersByDepartment: { department: string; count: number }[];
    ordersBySubject: { subject: string; count: number }[];
    ordersByMonth: { month: string; incoming: number; outgoing: number }[];
    recentOrders: Order[];
  }