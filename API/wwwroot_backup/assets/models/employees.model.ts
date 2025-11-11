import { LeaveBalanceService } from './../../app/leave-balance/leave-balance.service';
import { formatDate } from '@angular/common';

export enum AssignmentStatus {
  Assigned = 1,
  TransferApproved = 2,
  DepartmentManagerApproved = 3,
  InProgress = 4
}

export class Employees {
  id: number;
  img: string;
  recruiterName: string;
  fullName: string;
  qualification:number;
  date: Date;
  mobile: string;
  designationName: string;
  degreeName: string;
  education: string;
  degreeId: number;
  designationId: number;
  address:string;
  cardNo:string;
  planId:number;
  planName:string;
  gender:number;
  militaryNumber: string;
  departmentId: string;
  departmentName: string;
  nationalId:string;
  assignmentStatus: AssignmentStatus;
  assignmentDecisionUrl: string;
}

export interface IPaginationEmps {
  pageIndex: number
  pageSize: number
  count: number
  data: Employees[]

}

export class  EmpParams {
 groupId :number;
 depId  :any;
  sort= 'desc';
  pageNumber=1;
  pageSize= 12;
  search!: string;

}

export class  SalarySettingParams {
  groupId :number;
  depId  :string;
   sort= 'desc';
   pageNumber=1;
   pageSize= 12;
   search!: string;
 
 }
 
 export interface IPaginationAny{
  pageIndex: number
  pageSize: number
  count: number
  data: any[]

}
 

  export interface leaves {
    id: string
    img: string
    name: string
    fileLeves: string
    empId: string
    deductFromBalance: string
    type: string
    from: string
    leaveTo: string
    noOfDays: string
    status: number
    reason: string
    note: string
  }

  export interface LeaveBalance {
    id?: number;
    empId: number;
    name: string;
    img?: string;
    previousYear: number;
    currentYear: number;
    total: number;
    used: number;
    accepted: number;
    rejected: number;
    expired: number;
    carryOver: number;
    fileUpload?: string | null;
  }

export interface Emp {
  id: number;
  mobile: string;
  designationId: number;
  degreeId: number;
  militaryNumber: string;
  gender: number;
  departmentId: number;
  nationalId: string;
  passportNumber: string;
  designationName: string;
  degreeName: string;
  departmentName: string;
  
  // Assignment Status properties
  assignmentStatus: AssignmentStatus;
  assignmentDecisionUrl: string;
  assignmentStatusDescription: string;
  
  passportIssuePlace: string;
  passportIssueDate: Date;
  passportExpiryDate: Date;
  qualification: number; // assuming Qualification is represented by an enum (number)
  specialization: string;
  appointmentDate: Date;
  departmentJoinDate: Date;
  trainingCourses: string;
  languagesSpoken: string;
  rankAndGrade: string;
  currentAssignment: string;
  maritalStatus: number; // assuming MaritalStatus is an enum (number)
  nearestLandmark: string;
  recruiterName: string;
  recruitmentDate: Date;
  birthCertificate: string;
  personalPhoto: string;
  designation: Designation
  file: FileList
  jobSalleries: JobSallery[]
  overTimeOrders: OverTimeOrder[]
  salleries: Sallery[]
}

// export interface Plan {
//   name: string;
//   fromStartTime: string;
//   toStartTime: string;
//   lateStartFrom: string;
//   fromEndTime: string;
//   toEndTime: string;
//   earlyExitEndIn: string;
//   daysOfWeek: DayOfWeekEnum[];
//   hoursCount: number;
// }

export interface Plan {
  id:number;
  name: string;
  totalHours: number;
  fromStartTime: Date | null;
  toStartTime: Date | null;
  lateStartFrom: Date | null;
  fromEndTime: Date | null;
  toEndTime: Date | null;
  earlyExitEndIn: Date | null;
  step1: string| null;
  step2: string| null;
  step3: string| null;
  step4: string| null;
  step5: string| null;
  step6: string| null;
  daysOfWeek: DayOfWeekEnum[];
  typePlan: number;
  startDate: Date;
  orderNext: number;
}


enum DayOfWeekEnum {
  Sunday,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday
}
export interface Degree {
  id: number
  name: string

}

export interface Designation {
  description: string;
  id: number
  name: string
  departmentId: number

}

export interface Department {
  parentId: number;
  id: number
  name: string
  descrp: string
  designations?: Designation | null;
  parentDepartmentId?:number
}

export interface FileList {
  id: number
  img: File
  nationalNumber: string
  passport: string
  idProof: string
  otherCertificate: string
  graduationCertificate: string
  cv: string
  healthCertificate: string
  criminalCase: string

}

export interface JobSallery {
  id: number
  empId: number
  montlySallery: number
  montlyExtra: number
  montlyDebit: number
  salleryJob: number
  monthJobSallery: string
  fromExpDate: string
  toExpDate: string

}

export interface OverTimeOrder {
  id: number
  descrp: string
  fromDate: string
  toDate: string
  empId: number ,
  empName:string

}

export interface Sallery {
  id: number
  empId: number
  degreeId: number
  degree: Degree
  salleryValue: number
  degreeSalleriesDate: string
  salleryTimeExtra: number

}

export interface Degree {
  id: number
  name: string

}
export interface Holiday {
  id: number;
  hName: string;
  shift: number;
  details: string;
  date: string;
  departmentsAccpted: number[];
}

export class AttedPlan {
  id: number;
  name: string;
  depId:string
  hoursCount:number;
  fromStartTime: string;
  toStartTime: string;
  lateStartFrom: string;
  fromEndTime: string;
  toEndTime: string;
  earlyExitEndIn: string;
  daysOfWeek: number[];
  empsList: number[];
   typePlan: number;
  stepCheck: number;
startDate: string;
orderNext:number;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  step5: string;
  step6: string;
  constructor(attedPlan: AttedPlan) {
    this.id = attedPlan.id || null;
    this.name = attedPlan.name || '';
    this.fromStartTime = attedPlan.fromStartTime || '08:00';
    this.toStartTime = attedPlan.toStartTime || '09:30';
    this.lateStartFrom = attedPlan.lateStartFrom || '09:31';
    this.fromEndTime = attedPlan.fromEndTime || '14:30';
    this.toEndTime = attedPlan.toEndTime || '23:59';
    this.earlyExitEndIn = attedPlan.earlyExitEndIn || '13:00';
    this.daysOfWeek = attedPlan.daysOfWeek || [0];
    this.empsList = attedPlan.empsList || [0];
    this.typePlan = attedPlan.typePlan || 1;
    this.stepCheck = attedPlan.stepCheck || 0;
  this.startDate= attedPlan.startDate ||  Date();
  this.orderNext = attedPlan.orderNext || 1;
  this.step1 = attedPlan.step1  || '08:00';
  this.step2 = attedPlan.step2  || '12:00';
  this.step3 = attedPlan.step3  || '16:00';
  this.step4 = attedPlan.step4  || '20:00';
  this.step5 = attedPlan.step5  || '01:00';
  this.step6 = attedPlan.step6  || '08:00';


  }

  public getRandomID(): number {
    const S4 = () => {
      return ((1 + Math.random()) * 0x10000) | 0;
    };
    return S4() + S4();
  }
}






// src/app/shared/financial-interfaces.ts

export interface AllowanceManagement {
  id: number;
  employeeId: number;
  allowanceType: string;
  amount: number;
  effectiveDate: Date;
}

export interface Approval {
  id: number;
  requestId: number;
  approverId: number;
  approvalDate: Date;
  status: string; // e.g., Approved, Pending, Rejected
  comments?: string;
}

// export interface Archive {
//   id: number;
//   documentName: string;
//   documentType: string; // e.g., PDF, DOCX, XLSX
//   archivedDate: Date;
//   archivedBy: string;
//   departmentId: number;
// }
export interface Archive {
  id: number;
  fileName: string;
  fileFormat: string;
  filePath: string;
  uploadedAt: string;
  archiveDepartments: ArchiveDepartment[];
  archiveEmps: ArchiveEmp[];
  appUserId: number;
  archiveType: number;
  title: string;
  description: string;
}

export interface ArchiveDepartment {
  departmentName: string;
  departmentId: number;
  department: Department;
}

export interface ArchiveEmp {
  empName: string;
  empId: number;
  emp: Employees;
}
export interface ArchivedMailView {
  id: number;
  mailId: number;
  viewDate: Date;
  viewedBy: string;
}

export interface AuditInterface {
  id: number;
  auditDate: Date;
  auditedBy: string;
  changes: string;
  departmentId: number;
}

export interface FinancialManagement {
  id: number;
  transactionId: number;
  transactionDate: Date;
  amount: number;
  description: string;
  departmentId: number;
}

export interface FinancialReport {
  id: number;
  reportName: string;
  reportType: string; // e.g., Monthly, Quarterly, Annual
  generatedDate: Date;
  generatedBy: string;
}

export interface Inventory {
  id: number;
  itemId: number;
  itemName: string;
  quantity: number;
  location: string;
  lastUpdated: Date;
}

export interface OutgoingMailArchiving {
  id: number;
  mailId: number;
  archivedDate: Date;
  archivedBy: string;
  departmentId: number;
}

export interface PermissionsManagement {
  id: number;
  userId: number;
  roleId: number;
  permissionLevel: string; // e.g., Read, Write, Admin
  assignedDate: Date;
}

export interface Product {
  id: number;
  name: string;
  productType: string;
  price: number;
  inStock: boolean;
  lastUpdated: Date;
}

export interface PromotionManagement {
  id: number;
  employeeId: number;
  oldDesignation: string;
  newDesignation: string;
  promotionDate: Date;
  remarks?: string;
}

export interface Report {
  id: number;
  reportName: string;
  reportType: string;
  generatedDate: Date;
  departmentId: number;
}

export interface SalarySetting {
  id: number;
  employeeId: number;
  basicSalary: number;
  allowances: AllowanceManagement[];
  deductions: number;
  netSalary: number;
}
