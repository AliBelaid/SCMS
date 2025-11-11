import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
  DashboardStats,
  Department,
  Order,
  OrderAttachment,
  Subject,
} from '../models/department.model';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private departments$ = new BehaviorSubject<Department[]>([]);
  private orders$ = new BehaviorSubject<Order[]>([]);

  constructor() {
    this.initializeFakeData();
  }

  private initializeFakeData(): void {
    const departments = this.generateFakeDepartments();
    const orders = this.generateFakeOrders(departments);

    this.departments$.next(departments);
    this.orders$.next(orders);
  }

  private generateFakeDepartments(): Department[] {
    return [
      {
        id: 'dept-001',
        code: 'HR',
        nameAr: 'إدارة الموارد البشرية',
        nameEn: 'Human Resources Department',
        description: 'إدارة شؤون الموظفين والتوظيف والتدريب',
        isActive: true,
        subjects: [
          {
            id: 'subj-hr-001',
            code: 'REC',
            nameAr: 'التوظيف',
            nameEn: 'Recruitment',
            departmentId: 'dept-001',
            incomingPrefix: 'REC-IN',
            outgoingPrefix: 'REC-OUT',
            isActive: true,
            createdAt: new Date('2024-01-01'),
          },
          {
            id: 'subj-hr-002',
            code: 'TRN',
            nameAr: 'التدريب',
            nameEn: 'Training',
            departmentId: 'dept-001',
            incomingPrefix: 'TRN-IN',
            outgoingPrefix: 'TRN-OUT',
            isActive: true,
            createdAt: new Date('2024-01-01'),
          },
          {
            id: 'subj-hr-003',
            code: 'LEV',
            nameAr: 'الإجازات',
            nameEn: 'Leave Management',
            departmentId: 'dept-001',
            incomingPrefix: 'LEV-IN',
            outgoingPrefix: 'LEV-OUT',
            isActive: true,
            createdAt: new Date('2024-01-01'),
          },
          {
            id: 'subj-hr-004',
            code: 'SAL',
            nameAr: 'الرواتب',
            nameEn: 'Salaries',
            departmentId: 'dept-001',
            incomingPrefix: 'SAL-IN',
            outgoingPrefix: 'SAL-OUT',
            isActive: true,
            createdAt: new Date('2024-01-01'),
          },
        ],
        createdAt: new Date('2024-01-01'),
        createdBy: 'admin',
      },
      {
        id: 'dept-002',
        code: 'FIN',
        nameAr: 'إدارة المالية',
        nameEn: 'Financial Department',
        description: 'إدارة الشؤون المالية والميزانية والمصروفات',
        isActive: true,
        subjects: [
          {
            id: 'subj-fin-001',
            code: 'BDG',
            nameAr: 'الميزانية',
            nameEn: 'Budget',
            departmentId: 'dept-002',
            incomingPrefix: 'BDG-IN',
            outgoingPrefix: 'BDG-OUT',
            isActive: true,
            createdAt: new Date('2024-01-01'),
          },
          {
            id: 'subj-fin-002',
            code: 'EXP',
            nameAr: 'المصروفات',
            nameEn: 'Expenses',
            departmentId: 'dept-002',
            incomingPrefix: 'EXP-IN',
            outgoingPrefix: 'EXP-OUT',
            isActive: true,
            createdAt: new Date('2024-01-01'),
          },
          {
            id: 'subj-fin-003',
            code: 'INV',
            nameAr: 'الفواتير',
            nameEn: 'Invoices',
            departmentId: 'dept-002',
            incomingPrefix: 'INV-IN',
            outgoingPrefix: 'INV-OUT',
            isActive: true,
            createdAt: new Date('2024-01-01'),
          },
          {
            id: 'subj-fin-004',
            code: 'AUD',
            nameAr: 'التدقيق المالي',
            nameEn: 'Financial Audit',
            departmentId: 'dept-002',
            incomingPrefix: 'AUD-IN',
            outgoingPrefix: 'AUD-OUT',
            isActive: true,
            createdAt: new Date('2024-01-01'),
          },
        ],
        createdAt: new Date('2024-01-01'),
        createdBy: 'admin',
      },
      {
        id: 'dept-003',
        code: 'OPS',
        nameAr: 'إدارة العمليات',
        nameEn: 'Operations Department',
        description: 'إدارة العمليات التشغيلية والمشاريع',
        isActive: true,
        subjects: [
          {
            id: 'subj-ops-001',
            code: 'PRJ',
            nameAr: 'المشاريع',
            nameEn: 'Projects',
            departmentId: 'dept-003',
            incomingPrefix: 'PRJ-IN',
            outgoingPrefix: 'PRJ-OUT',
            isActive: true,
            createdAt: new Date('2024-01-01'),
          },
          {
            id: 'subj-ops-002',
            code: 'QUA',
            nameAr: 'الجودة',
            nameEn: 'Quality Assurance',
            departmentId: 'dept-003',
            incomingPrefix: 'QUA-IN',
            outgoingPrefix: 'QUA-OUT',
            isActive: true,
            createdAt: new Date('2024-01-01'),
          },
          {
            id: 'subj-ops-003',
            code: 'LOG',
            nameAr: 'اللوجستيات',
            nameEn: 'Logistics',
            departmentId: 'dept-003',
            incomingPrefix: 'LOG-IN',
            outgoingPrefix: 'LOG-OUT',
            isActive: true,
            createdAt: new Date('2024-01-01'),
          },
          {
            id: 'subj-ops-004',
            code: 'MTN',
            nameAr: 'الصيانة',
            nameEn: 'Maintenance',
            departmentId: 'dept-003',
            incomingPrefix: 'MTN-IN',
            outgoingPrefix: 'MTN-OUT',
            isActive: true,
            createdAt: new Date('2024-01-01'),
          },
        ],
        createdAt: new Date('2024-01-01'),
        createdBy: 'admin',
      },
    ];
  }

  private generateFakeOrders(departments: Department[]): Order[] {
    const orders: Order[] = [];
    const currentYear = new Date().getFullYear();
    let orderCounter = 1;

    departments.forEach((dept) => {
      dept.subjects.forEach((subject) => {
        for (let i = 0; i < 10; i++) {
          const refNum = `${dept.code}-${subject.code}-${currentYear}-${String(
            orderCounter
          ).padStart(4, '0')}`;
          orders.push(
            this.createFakeOrder(refNum, 'incoming', dept, subject, orderCounter)
          );
          orderCounter++;
        }

        for (let i = 0; i < 8; i++) {
          const refNum = `${dept.code}-${subject.code}-${currentYear}-${String(
            orderCounter
          ).padStart(4, '0')}`;
          orders.push(
            this.createFakeOrder(refNum, 'outgoing', dept, subject, orderCounter)
          );
          orderCounter++;
        }
      });
    });

    return orders;
  }

  private createFakeOrder(
    refNum: string,
    type: 'incoming' | 'outgoing',
    dept: Department,
    subject: Subject,
    index: number
  ): Order {
    const statuses: Order['status'][] = [
      'pending',
      'in-progress',
      'completed',
      'archived',
    ];
    const priorities: Order['priority'][] = ['low', 'medium', 'high', 'urgent'];
    const titles: Record<'incoming' | 'outgoing', string[]> = {
      incoming: [
        `طلب ${subject.nameAr} رقم ${index}`,
        `استفسار ${subject.nameAr}`,
        `موافقة على ${subject.nameAr}`,
        `تحديث ${subject.nameAr}`,
        `مراجعة ${subject.nameAr}`,
      ],
      outgoing: [
        `رد على ${subject.nameAr}`,
        `موافقة ${subject.nameAr}`,
        `إشعار ${subject.nameAr}`,
        `تقرير ${subject.nameAr}`,
        `خطاب ${subject.nameAr}`,
      ],
    };

    const randomTitle =
      titles[type][Math.floor(Math.random() * titles[type].length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomPriority =
      priorities[Math.floor(Math.random() * priorities.length)];
    const daysAgo = Math.floor(Math.random() * 90);
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - daysAgo);

    return {
      id: `order-${refNum}`,
      referenceNumber: refNum,
      type,
      departmentId: dept.id,
      departmentCode: dept.code,
      subjectId: subject.id,
      subjectCode: subject.code,
      title: randomTitle,
      description: `هذا ${
        type === 'incoming' ? 'معاملة واردة' : 'معاملة صادرة'
      } تخص ${subject.nameAr} في ${dept.nameAr}. المرجع: ${refNum}`,
      status: randomStatus,
      priority: randomPriority,
      attachments: this.generateFakeAttachments(refNum),
      createdAt: createdDate,
      createdBy: 'user' + Math.floor(Math.random() * 5 + 1),
      updatedAt: new Date(),
      updatedBy: 'user' + Math.floor(Math.random() * 5 + 1),
      dueDate:
        Math.random() > 0.5
          ? new Date(
              Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000
            )
          : undefined,
      permissions: {
        canView: ['admin', 'user1', 'user2'],
        canEdit: ['admin', 'user1'],
        canDelete: ['admin'],
        excludedUsers: [],
        isPublic: Math.random() > 0.7,
      },
    };
  }

  private generateFakeAttachments(orderId: string): OrderAttachment[] {
    const attachmentCount = Math.floor(Math.random() * 3) + 1;
    const attachments: OrderAttachment[] = [];
    const fileTypes: Array<OrderAttachment['fileType']> = [
      'pdf',
      'image',
      'document',
    ];
    const fileNames = [
      'مستند_رسمي',
      'تقرير',
      'صورة_المرفق',
      'نموذج_معبأ',
      'خطاب_رسمي',
    ];

    for (let i = 0; i < attachmentCount; i++) {
      const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
      const fileName = fileNames[Math.floor(Math.random() * fileNames.length)];

      attachments.push({
        id: `att-${orderId}-${i}`,
        orderId,
        fileName: `${fileName}_${i + 1}.${
          fileType === 'image' ? 'jpg' : fileType === 'pdf' ? 'pdf' : 'docx'
        }`,
        fileSize: Math.floor(Math.random() * 5_000_000) + 100_000,
        fileType,
        fileUrl: `/api/files/${orderId}/${i}`,
        uploadedAt: new Date(),
        uploadedBy: 'user' + Math.floor(Math.random() * 5 + 1),
      });
    }

    return attachments;
  }

  getAllDepartments(): Observable<Department[]> {
    return this.departments$.asObservable().pipe(delay(300));
  }

  getDepartmentById(id: string): Observable<Department | undefined> {
    return this.departments$.pipe(
      map((depts) => depts.find((d) => d.id === id)),
      delay(200)
    );
  }

  addDepartment(
    department: Omit<Department, 'id' | 'createdAt'>
  ): Observable<boolean> {
    const newDeptId = 'dept-' + Date.now();
    const now = new Date();
    const subjects = (department.subjects ?? []).map((subject, index) =>
      this.normalizeSubject(subject, newDeptId, index)
    );
    const newDept: Department = {
      ...department,
      id: newDeptId,
      createdAt: now,
      createdBy: department.createdBy ?? 'admin',
      subjects,
    };
    const currentDepts = this.departments$.value;
    this.departments$.next([...currentDepts, newDept]);

    return of(true).pipe(delay(500));
  }

  updateDepartment(id: string, updates: Partial<Department>): Observable<boolean> {
    const currentDepts = this.departments$.value;
    const index = currentDepts.findIndex((d) => d.id === id);

    if (index !== -1) {
      const updatedSubjects = (updates.subjects ?? currentDepts[index].subjects).map(
        (subject, subjIndex) => this.normalizeSubject(subject, id, subjIndex)
      );
      currentDepts[index] = {
        ...currentDepts[index],
        ...updates,
        subjects: updatedSubjects,
      };
      this.departments$.next([...currentDepts]);
      return of(true).pipe(delay(500));
    }

    return of(false).pipe(delay(500));
  }

  deleteDepartment(id: string): Observable<boolean> {
    const currentDepts = this.departments$.value;
    const filtered = currentDepts.filter((d) => d.id !== id);
    this.departments$.next(filtered);
    return of(true).pipe(delay(500));
  }

  getSubjectsByDepartment(departmentId: string): Observable<Subject[]> {
    return this.departments$.pipe(
      map((depts) => {
        const dept = depts.find((d) => d.id === departmentId);
        return dept ? dept.subjects : [];
      }),
      delay(200)
    );
  }

  addSubject(
    departmentId: string,
    subject: Omit<Subject, 'id' | 'createdAt' | 'departmentId'>
  ): Observable<boolean> {
    const currentDepts = this.departments$.value;
    const deptIndex = currentDepts.findIndex((d) => d.id === departmentId);

    if (deptIndex !== -1) {
      const newSubject: Subject = {
        ...subject,
        id: 'subj-' + Date.now(),
        departmentId,
        createdAt: new Date(),
      };

      currentDepts[deptIndex].subjects = [
        ...currentDepts[deptIndex].subjects,
        newSubject,
      ];
      this.departments$.next([...currentDepts]);
      return of(true).pipe(delay(500));
    }

    return of(false).pipe(delay(500));
  }

  updateSubject(
    departmentId: string,
    subjectId: string,
    updates: Partial<Subject>
  ): Observable<boolean> {
    const currentDepts = this.departments$.value;
    const deptIndex = currentDepts.findIndex((d) => d.id === departmentId);

    if (deptIndex !== -1) {
      const subjIndex = currentDepts[deptIndex].subjects.findIndex(
        (s) => s.id === subjectId
      );
      if (subjIndex !== -1) {
        const subjects = [...currentDepts[deptIndex].subjects];
        subjects[subjIndex] = { ...subjects[subjIndex], ...updates };
        currentDepts[deptIndex] = {
          ...currentDepts[deptIndex],
          subjects,
        };
        this.departments$.next([...currentDepts]);
        return of(true).pipe(delay(500));
      }
    }

    return of(false).pipe(delay(500));
  }

  deleteSubject(departmentId: string, subjectId: string): Observable<boolean> {
    const currentDepts = this.departments$.value;
    const deptIndex = currentDepts.findIndex((d) => d.id === departmentId);

    if (deptIndex !== -1) {
      const subjects = currentDepts[deptIndex].subjects.filter(
        (s) => s.id !== subjectId
      );
      currentDepts[deptIndex] = {
        ...currentDepts[deptIndex],
        subjects,
      };
      this.departments$.next([...currentDepts]);
      return of(true).pipe(delay(500));
    }

    return of(false).pipe(delay(500));
  }

  getAllOrders(): Observable<Order[]> {
    return this.orders$.asObservable().pipe(delay(300));
  }

  getOrdersByType(type: 'incoming' | 'outgoing'): Observable<Order[]> {
    return this.orders$.pipe(
      map((orders) => orders.filter((o) => o.type === type)),
      delay(300)
    );
  }

  getOrdersByDepartment(departmentId: string): Observable<Order[]> {
    return this.orders$.pipe(
      map((orders) => orders.filter((o) => o.departmentId === departmentId)),
      delay(300)
    );
  }

  getOrderById(id: string): Observable<Order | undefined> {
    return this.orders$.pipe(
      map((orders) => orders.find((o) => o.id === id)),
      delay(200)
    );
  }

  addOrder(
    order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
  ): Observable<boolean> {
    const newOrder: Order = {
      ...order,
      id: 'order-' + Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const currentOrders = this.orders$.value;
    this.orders$.next([...currentOrders, newOrder]);

    return of(true).pipe(delay(500));
  }

  updateOrder(id: string, updates: Partial<Order>): Observable<boolean> {
    const currentOrders = this.orders$.value;
    const index = currentOrders.findIndex((o) => o.id === id);

    if (index !== -1) {
      currentOrders[index] = {
        ...currentOrders[index],
        ...updates,
        updatedAt: new Date(),
      };
      this.orders$.next([...currentOrders]);
      return of(true).pipe(delay(500));
    }

    return of(false).pipe(delay(500));
  }

  deleteOrder(id: string): Observable<boolean> {
    const currentOrders = this.orders$.value;
    const filtered = currentOrders.filter((o) => o.id !== id);
    this.orders$.next(filtered);
    return of(true).pipe(delay(500));
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.orders$.pipe(
      map((orders) => {
        const stats: DashboardStats = {
          totalOrders: orders.length,
          incomingOrders: orders.filter((o) => o.type === 'incoming').length,
          outgoingOrders: orders.filter((o) => o.type === 'outgoing').length,
          pendingOrders: orders.filter((o) => o.status === 'pending').length,
          completedOrders: orders.filter((o) => o.status === 'completed').length,
          ordersByDepartment: this.getOrdersByDepartmentStats(orders),
          ordersBySubject: this.getOrdersBySubjectStats(orders),
          ordersByMonth: this.getOrdersByMonthStats(orders),
          recentOrders: orders.slice(0, 10),
        };
        return stats;
      }),
      delay(300)
    );
  }

  private getOrdersByDepartmentStats(
    orders: Order[]
  ): { department: string; count: number }[] {
    const deptMap = new Map<string, number>();
    orders.forEach((order) => {
      const count = deptMap.get(order.departmentCode) || 0;
      deptMap.set(order.departmentCode, count + 1);
    });

    return Array.from(deptMap.entries()).map(([department, count]) => ({
      department,
      count,
    }));
  }

  private getOrdersBySubjectStats(
    orders: Order[]
  ): { subject: string; count: number }[] {
    const subjMap = new Map<string, number>();
    orders.forEach((order) => {
      const count = subjMap.get(order.subjectCode) || 0;
      subjMap.set(order.subjectCode, count + 1);
    });

    return Array.from(subjMap.entries()).map(([subject, count]) => ({
      subject,
      count,
    }));
  }

  private getOrdersByMonthStats(
    orders: Order[]
  ): { month: string; incoming: number; outgoing: number }[] {
    const monthMap = new Map<string, { incoming: number; outgoing: number }>();

    orders.forEach((order) => {
      const month = order.createdAt.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
      });
      const stats = monthMap.get(month) || { incoming: 0, outgoing: 0 };

      if (order.type === 'incoming') {
        stats.incoming++;
      } else {
        stats.outgoing++;
      }

      monthMap.set(month, stats);
    });

    return Array.from(monthMap.entries()).map(([month, stats]) => ({
      month,
      ...stats,
    }));
  }

  generateReferenceNumber(departmentCode: string, subjectCode: string): string {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 9999) + 1;
    return `${departmentCode}-${subjectCode}-${year}-${String(randomNum).padStart(
      4,
      '0'
    )}`;
  }

  private normalizeSubject(
    subject: Partial<Subject>,
    departmentId: string,
    index: number
  ): Subject {
    return {
      id: subject.id ?? `subj-${departmentId}-${Date.now()}-${index}`,
      code: subject.code ?? `SUB-${index}`,
      nameAr: subject.nameAr ?? 'موضوع جديد',
      nameEn: subject.nameEn ?? 'New Subject',
      departmentId,
      incomingPrefix: subject.incomingPrefix ?? `${subject.code ?? 'SUB'}-IN`,
      outgoingPrefix: subject.outgoingPrefix ?? `${subject.code ?? 'SUB'}-OUT`,
      isActive: subject.isActive ?? true,
      createdAt: subject.createdAt ? new Date(subject.createdAt) : new Date(),
    };
  }
}

