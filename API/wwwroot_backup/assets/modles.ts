import { Time } from "@angular/common";

export interface Team {
  id: number;
  teamName: string;
  teamLeaderID: number;
  teamLeaderName: string;
}

export interface SecurityMission {
  id: string;
  aircraftCode: string;
  departureAirportCode: string;
  arrivalAirportCode: string;
  departureTime: string;
  arrivalTime: string;
  flightStatus: string;
  flightCode: string;
  totalHoursFly: string;
  missionDescription: string;
  missionDate: string;
  teams: string;
  isRoundTrip: boolean;
  flights: number[];
}

export interface EmployeeFlight {
  id: number;
  employeeID: number;
  employeeName: string;
  flightID: number;
  hoursFlown: number;
  flightStatus: string;
}

export interface FlightSchedule {
  id: number;
  date: string;
  flightStatus: number;
  flightID: number;
}
export interface PilotTraining {
  id: number;
  trainingCourseName: string;
  trainingIssueDate: string;  // Use string if you're handling it as an ISO date string, or Date if you're using actual Date objects
  trainingExpiryDate: string;  // Use string or Date
  employeeID: number;
  empName: string;
  filePilotTrainingUrl: string;
}
export interface TrainingCourse {
  id: number;
  name: string;
  description: string;
  courseType: number;  // 0 for Mandatory, 1 for Optional
  pilotTrainings: PilotTraining[];  // Adjust the type of the PilotTraining object as needed
}

// export interface Flight {
//   id: number;
//   departureLocation: string;
//   arrivalLocation: string;
//   departureCode: string;
//   arrivalCode: string;
//   departureTime: string;
//   arrivalTime: string;
//   repeatFrequency: number;
//   flightStatus: number;
//   modifiedDate: string;
//   flightNumber: string;
//   departureDate: string;
//   aircraftCode: string;
//   departureAirportID: number;
//   specificDates: string[];
//   arrivalAirportID: number;
//   securityMissions: SecurityMission[];
//   employeeFlights: EmployeeFlight[];
//   flightSchedules: FlightSchedule[];
// }
export interface Flight {
  flightCode: number;
  departureLocation: string;
  arrivalLocation: string;
  departureAirportCode: string;
  arrivalAirportCode: string;
  departureTime: string; // ISO format datetime
  arrivalTime: string; // ISO format datetime
  repeatFrequency: number; // Enum or numeric representation of repeat frequency
  flightStatus: number; // Enum or numeric representation of flight status
  modifiedDate: string; // ISO format datetime
  flightNumber: string;
  flightRoot: string;
  linkedFlightCode: string | null; // Nullable
  specificDates: string[]; // Array of ISO format dates
  aircraftCode: string;
  securityMission: SecurityMission | null; // Nullable
  securityMissionsId: number | null; // Nullable
  totalHoursFly:any
  id: number
}
export interface Aircraft {
  code: string;
  aircraftModel: string;
  airlineId: number;
  airlineName: string;
  airlineCode: string;
  flights: Flight[];
  registrationNumber: string;
  capacity: number;
  status: string;
}
export interface HealthCertificateToReturn {
  certificateIssueDate: string; // Backend: "certificateissuedate"
  certificateExpiryDate: string; // Backend: "certificateexpirydate"
  employeeId: number; // Backend: "employeeid"
  empName: string; // Backend: "empname"
  fileHealthCertificateUrl: string; // Backend: "filehealthcertificateurl"
  id: number;

}


export interface Fleet {
  code: string;
  aircraftModel: string;
  airlineId: number;
  registrationNumber: string;
  capacity: number;
  status: string;
}

export interface Airline {
  airlineName: string;
  address: string;
  phone: string;
  email: string;
  airlineCode: string;
  fleets: Fleet[];
  id: number;
}

export interface Airport {
  id?: number;
  airportName: string;
  airportCode: string;
  latitude: number;
  longitude: number;
  departures?: any[];
}

