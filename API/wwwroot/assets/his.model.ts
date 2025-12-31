// Core interfaces for the Health Information System

// ===================================
// USER & AUTHENTICATION
// ===================================

export interface IUser {
  id: number;
  userName: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phoneNumber?: string;
  isActive: boolean;
  userType: UserType;
  roles?: string[];
  categories?: CategoryService[];
}

export interface IUserNew {
  id: number;
  userName: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phoneNumber?: string;
  isActive: boolean;
  userType: UserType;
  roles?: string[];
  categories?: CategoryService[];
}

export enum UserType {
  Admin = 'Admin',
  Doctor = 'Doctor',
  Nurse = 'Nurse',
  Reception = 'Reception',
  Patient = 'Patient',
  TPA = 'TPA',
  Manager = 'Manager',
  DataEntry = 'DataEntry'
}

// ===================================
// PATIENTS
// ===================================

export interface Patients {
  name: any;
  surname: any;
  fatherName: any;
  phone: any;
  motherName: string;
  birthDate: Date;
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth: Date;
  gender: string;
  address?: string;
  patientFileNumber: string;
  patientType: PatientType;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  tcNo?: string;
  insuranceNumber?: string;
  companyName?: string;
  passportNumber?: string;
}

export enum PatientType {
  Regular = 'Regular',
  VIP = 'VIP',
  Emergency = 'Emergency',
  Citizen = "Citizen",
  Company = "Company",
  Insurance = "Insurance",
  Foreigner = "Foreigner"
}

// ===================================
// DOCTORS
// ===================================

export interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  specialization: string;
  medicalLicenseNumber: string;
  isActive: boolean;
  shiftToday?: ShiftDto;
  shifts?: ShiftDto[];
  // Additional properties
  fullName?: string;
  name?: string;
  specialty?: string;
  displayName?: string;
}

export interface DoctorShifts {
  id: number;
  doctorId: number;
  shifts: ShiftDto[];
}

// ===================================
// SHIFTS & QUEUE
// ===================================

export interface ShiftDto {
  id: number;
  doctorId: number;
  day: string;
  count: number;
  start: string;
  end: string;
  finishedPatients?: number;
  waitingPatients?: number;
  currentPatientId?: number;
  currentNumber?: number;
  totalNumbersIssued?: number;
  nextPatientId?: number;
  nextNumber?: number;
  queuePatients?: QueuePatient[];
  isActiveQueue?: boolean;
}

export interface QueuePatient {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  shiftId: number;
  numberOfQueue: number;
  serviceName: string;
  category: Category;
  isFinished: boolean;
  isTreatment: boolean;
  isPartialPayment: boolean;
  imageSrc?: string;
  clinicName?: string;
  createdAt: Date;
  // Additional properties
  doctorName?: string;
  meetingType?: MeetingType;
  isPaid?: boolean;
  queuePatientId?: number;
  doctorSpecialization?: string;
  day?: string;
  treatment?: any;
}

export interface QueuePatientToSaved {
  patientId: number;
  doctorId: number;
  shiftId: number;
  serviceId: number;
  meetingType: number;
  numberOfQueue: number;
}

export interface QueueStatusDto {
  id: number;
  status: string;
  message: string;
}

// ===================================
// MEDICAL RECORDS & TREATMENTS
// ===================================

export interface MedicalRecord {
  id: number;
  patientId: number;
  doctorId: number;
  diagnosis: string;
  treatment: string;
  notes?: string;
  createdAt: Date;
}

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentDate: Date;
  status: AppointmentStatus;
  notes?: string;
}

export enum AppointmentStatus {
  Scheduled = 'Scheduled',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export interface TreatmentDto {
  id: number;
  patientId: number;
  doctorId: number;
  treatmentName: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  status: TreatmentStatus;
}

export enum TreatmentStatus {
  Active = 'Active',
  Completed = 'Completed',
  Discontinued = 'Discontinued'
}

export interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
}

export interface MedicationsDto {
  isSelected: unknown;
  isEdit: boolean;
  drugId(drugId: any): number;
  timesPerDay: any;
  durationDays: any;
  id: number;
  patientId: number;
  medicationId: number;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  instructions?: string;
}

export interface Medications {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
}

// ===================================
// SERVICES & CATEGORIES
// ===================================

export interface MedicalService {
  prices: any;
  category: boolean;
  id: number;
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  isActive: boolean;
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  isActive: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  isActive: boolean;
  children?: Category[];
}

export interface CategoryService {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  isActive: boolean;
  children?: CategoryService[];
  allowChildren?: boolean;
  displayOrder?: number;
}

export interface Clinic {
  id: number;
  name: string;
  description?: string;
  location?: string;
  contactInfo?: string;
  isActive: boolean;
}

// ===================================
// PAYMENTS
// ===================================

export interface Payment {
  id: number;
  patientId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentReference: string;
  status: PaymentStatus;
  createdAt: Date;
  // Additional properties
  patientName?: string;
  serviceName?: string;
  date?: Date;
}

export interface PaymentReport {
  id: number;
  reportDate: Date;
  totalAmount: number;
  paymentCount: number;
  details: Payment[];
  totalRevenue?: any;
  totalPayments?: any;
  averagePayment?: number;
  paymentsByMethod?: any;
  paymentsByStatus?: any;
}

export interface PaymentRefund {
  id: number;
  paymentId: number;
  refundAmount: number;
  reason: string;
  processedAt: Date;
  refundReason?: string;
}

export enum PaymentMethod {
  Cash = 'Cash',
  CreditCard = 'CreditCard',
  BankTransfer = 'BankTransfer',
  Insurance = 'Insurance'
}

export enum PaymentStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Failed = 'Failed',
  Refunded = 'Refunded'
}

export interface ServicePrice {
  id: number;
  serviceId: number;
  price: number;
  calculationType: PaymentCalculationType;
  isActive: boolean;
  patientType?: PatientType;
  clinicId?: number;
  allDoctors?: boolean;
  useDoctorFixedAmount?: boolean;
  doctorFixedAmount?: number;
  doctorPercentage?: number;
  useTechnicianFixedAmount?: boolean;
  technicianFixedAmount?: number;
  medicalTechnicianPercentage?: number;
  centerPercentage?: number;
  selectedDoctorIds?: number[];
  doctorId?: number;
  doctorAmount?: number;
  doctorPaymentType?: PaymentCalculationType;
  technicianAmount?: number;
  technicianPaymentType?: PaymentCalculationType;
}

export enum PaymentCalculationType {
  Fixed = 'Fixed',
  Percentage = 'Percentage',
  Variable = 'Variable'
}

// ===================================
// REGISTRATION
// ===================================

export interface ReceptionRegistration {
  id: number;
  patientId: number;
  doctorId: number;
  serviceId: number;
  registrationDate: Date;
  status: RegistrationStatus;
  paymentMethod: PaymentMethod;
  amount: number;
}

export interface Registration {
  id: number;
  patientId: number;
  doctorId: number;
  serviceId: number;
  registrationDate: Date;
  status: RegistrationStatus;
  paymentMethod: PaymentMethod;
  amount: number;
}

export enum RegistrationStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

// ===================================
// MEETING TYPES
// ===================================

export enum MeetingType {
  Emergency = 0,
  Checkup = 1,
  FollowUp = 2
}

// ===================================
// VITAL SIGNS
// ===================================

export interface VitalSign {
  id: number;
  patientId: number;
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  recordedAt: Date;
  recordedBy: number;
}

// ===================================
// RADIOLOGY
// ===================================

export interface RadiologyReportTemplate {
  id: number;
  templateCode: string;
  templateName: string;
  examType: string;
  defaultFindings: string;
  defaultMedicalOpinion: string;
  medicalServiceId: number;
  findingsList?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface RadiologyReportData {
  fileNumber?: string;
  fullName?: string;
  age?: number;
  gender?: string;
  examDate?: Date;
  examType: string;
  examFindings: string[];
  medicalOpinion: string;
  doctorName: string;
  doctorSpeciality?: string;
}

// ===================================
// ICD CODES
// ===================================

export interface ICDItem {
  id: number;
  code: string;
  description: string;
  category?: string;
}

export interface ICDDescription {
  id: number;
  code: string;
  description: string;
  category?: string;
}

// ===================================
// CALENDAR EVENTS
// ===================================

export interface CalendarEventDto {
  id: number;
  title: string;
  start: Date;
  end: Date;
  color?: {
    primary: string;
    secondary: string;
  };
  meta?: any;
}

// ===================================
// SPECIALTIES
// ===================================

export interface Specialty {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

// ===================================
// DOCTOR SHIFTS
// ===================================

export interface DoctorShift {
  id: number;
  doctorId: number;
  day: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

// ===================================
// SERVICE MANAGEMENT
// ===================================

export interface ServiceManagementService {
  // This would be a service class, not an interface
  // But we need to define it for dependency injection
}

// ===================================
// TREASURY
// ===================================

export interface TreasuryService {
  // This would be a service class, not an interface
  // But we need to define it for dependency injection
}

// ===================================
// COMPANY SERVICES
// ===================================

export interface CompanyService {
  // This would be a service class, not an interface
  // But we need to define it for dependency injection
}