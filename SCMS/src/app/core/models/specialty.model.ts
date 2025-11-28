// export interface Specialty {
//   id: number;
//   specialtyName: string;
//   specialtyNameArabic: string;
//   specialtyUserId?: number;
//   doctorSpecialties?: DoctorSpecialty[];
//   queuePatients?: QueuePatient[];
// }

// export interface DoctorSpecialty {
//   doctorId: number;
//   specialtyId: number;
//   doctor?: Doctor;
// }

// export interface QueuePatient {
//   id: number;
//   specialtyId: number;
//   doctorId: number;
//   patientId: number;
//   shiftId: number;
//   numberOfQueue: number;
//   enqueueTime: Date;
//   isActivied: boolean;
//   isFinished: boolean;
//   isMedications: boolean;
//   meetingType: string;
// }

// export interface Doctor {
//   id: number;
//   firstName: string;
//   lastName: string;
//   yearsOfExperience: number;
//   specialization: string;
//   medicalLicenseNumber: string;
//   hospitalAffiliation: string;
// } 