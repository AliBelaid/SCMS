import { QueuePatient } from 'src/assets/his.model';

export interface Shift {
  id: number;
  doctorId: number;
  day: string;
  start: string;
  end: string;
  count: number;
  queuePatients?: QueuePatient[];
}

export interface ShiftDto {
  id: number;
  doctorId: number;
  day: string;
  start: string;
  end: string;
  count: number;
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