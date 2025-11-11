import { Timestamp } from "rxjs"

export interface IPaginationSite {
  pageIndex: number
  pageSize: number
  count: number
  data: Site[]

}
export interface Banks {
  id: number
  bankName:string
}

export interface PaymentSchedule {
  paymentCode: string
  contractID: number
  year: string
  value: number
  receiptNumber: string
  paymentAuthorization: string
  paymentDate: string
  checkImage: string
  cheekBank: string
  bankId: number
  bank:Banks
  siteName: string
  contractGeneralInfoId: number
  id: number
}
export interface  LibyanaBranches
  {
    companyAddressDescription: string
    libyanaBranchLocation: string
    addressLocationId: string
    libyanaBranchInfo: string
    id: number

  }




  export interface ContractGeneralInfo {
    siteName: string
    libyanaBranch: LibyanaBranches
    libyanaBranchId: number
    paymentSchedule: any[]
    contractOrders: any[]
    northDirection: string
    eastDirection: string
    southDirection: string
    westDirection: string
    contractStartDate: string
    contractEndDate: string
    contractStartDateOld: string
    contractEndDateOld: string
    rentalAmount: number
    ownerPhone: string
    state: number
    ownerRepresentatives: string[]
    propertyLocationAddress: string
    isRepresentative: boolean
    representativeName: string
    idType: number
    idNumber: string
    propertyType: number
    propertyStatement: string
    ownershipStatement: string
    ownershipCertificateType: number
    ownershipCertificateID: string
    contractCode: string
    contractType: number
    isApproved: boolean
    contractDate: string
    companyRepresentative: string
    companyRepresentativeTitle: string
    id: number
}



export interface Site {
  name: string
  location: Location
  stateSite: number
   contractGeneralInfoLast:ContractGeneralInfo ,
   contractGeneralInfo: ContractGeneralInfo[]
  paymentSchedules: PaymentSchedule[]
  contractFiles: ContractFiles[]
  revuneSite: RevuneSite[]
  durationSinceLastRevenue: string;
  electricityAccount: ElectricityAccount
  cellsSites: CellsSite[]
  planSites: any,
  isSupportLTE: boolean
  count2G: number
  count3G: number
  countLTE: number
  vendorSite: string
  siteTotalCallAmount:number
  totalDataUsageVolume:number
  callDurationPerCall:number
  id: number
}
export interface ElectricityAccount {
  electricityAccountId: string
  electricityMeterId: string
  siteName: string
  lastUpdate: Date
  accountNumber:string
  area:string
  address:string;
  electricityRecords: ElectricityRecord[]
}

export interface ElectricityRecord {
  electricityAccountId: string
  electricityMeterId: number
  accountNumber: number
  name: string
  indicator: string
  invoiceNumber: number
  type: number
  reading: number
  readingDate: string
  zoom: number
  currentReading: number
  currentReadingDate: string
  days: number
  consumption: number
  meterFee: number
  stampFee: number
  invoiceAmount: number
  pensionExemptionAmount: number
  pensionConsumption: number
  readingV: number
  readingVDate: string
  currentReadingV: number
  currentReadingVDate: string
  consumptionV: number
  percentageV: number
  invoiceAmountV: number
  totalConsumption: number
  totalAmount: number
  issueDate: string
  releaseType: string
  servicePointType: string
  releaseVersion: string
  fromDate: string
  toDate: string
  department: string
  circle: string
  id: number
}















export interface ReginLibyana {
  regin_name: string;
  regin_location: string;
  shortName: string;
  reginLibyanaRoles?: any;
  cities: City[]
  id:number
}

export interface City {
  Id: number
  a_state: string
  e_state: string
  state_id: string
  RegionId: number
  reginLibyana: any
}

export interface CellsSite {
  cellName: string
  vendor: string
  lac: string
  ci: string
  angle: number
  cellType: string
  cgi: string
  startDate: string
  cellRAs: CellRa[]
  id: number,

  totalVoiceRevenuePast30Days:number
  totalVoiceRevenuePast24Hours:number
  dataUsagePast30Days:number
  dataUsagePast24Hours:number

  totalCallDurationPast30Days:number
  durationSinceLastRevenue:number


 }

 export interface RevuneSite {
  statDate: string
  countOfCell: number
  sumTotalCallNum: number
  sumTotalCallAmount: number
  sumTotalDataUsageNum: number
  sumTotalDataUsageVolumeGB: number
  sumTotalVoiceToLibyana: number
  sumTotalVoiceOFFNET: number
  sumTotalCallDurationSec: number
}


 export interface CellInfo {
  CELL_ID: number;
  Cell_Name: string;
  CI_DEC: string;
  In_EMS: string;
  Antenna_Azimuth: string;
  Antenna_Downtilt: string;
  E_tilt: string;
  M_Tilt: string;
  isSelected: boolean;
  isEdit: boolean;
}

 export interface CellsSiteOpt {
  cellName: string
  vendor: string
  lac: string
  ci: string
  angle: number
  cellType: number
  cgi: string
  id:number
  isSelected:boolean
  isEdit:boolean
 }


 export interface CellSiteDto{
  CELL_ID: number;
  Cell_Name: string;
  CI_DEC: string;
  In_EMS: string;
  Antenna_Azimuth: string;
  Antenna_Downtilt: string;
  E_tilt: string;
  M_Tilt: string;
  isSelected:boolean
  isEdit:boolean
 }

export interface Location {
  latitude: string
  longitude: string
  street: string
  neerPoint: string
  cityId: number
  cityes: City
  id: number
}


export interface CellRa {
  id: number
  cgi: string
  statDate: string
  totalCallNum: number
  totalCallAmount: number
  totalDataUsageNum: number
  totalDataUsageVolumeGB: number
  totalVoiceToLibyana: number
  totalVoiceOFFNET: number
  totalCallDuration: number
}




// //

// export interface Contracts {
//   id: number

//   state: number
//    lastUpdate: string
//   note: string
//   siteName: string
//   ownerFullName: string
//   ownerCardNumber: string
//   ownerPhoneNumber: string

//   contractOrders: ContractOrder[]
//   contractFiles:ContractFiles[]

// }

export interface ContractFiles {
  contractId: number;
  contractType: number;
  createFile: string;
  filePath: string;
  id: number;
  isDelete: boolean;
  nameFile: string;
  fileFormat:string
  SiteName:string
}


// libyana-branch.interface.ts

export interface LibyanaBranch {
  id: number;
  companyAddressDescription: string;

  addressLocation: string | null;
  addressLocationId: number;
  libyanaBranchInfo: number;
}


// export interface ContractOrder {
//   contractId: number;
//   startDate: Date
//   endDate: Date
//   payment?: PaymentToReturn
//   id: number
//   notes:string ,
//   contractOrderCode:string
//   isPayment:boolean,
//   contractType:number
//   rentalAmount:number

// }

// export interface Payment {
//   paymentCode: string
//   paymentDate: string
//   paymentMethod: string
//   amount: number
//   notes:string
//   checkImage: string
//   cheekBank: string
//   bankName: string
//   id: number
// }



export interface PlanSites {
  id: number
  siteName: string
  planName: string
  clanderPlanDate: string
  dayToAction: number
  stateOfPlan: number
}



// export interface Owner {
//   id: number
//   fullName: string
//   cardNumber: string
//   phoneNumber: string
//   iIdImage: string
//   contractId: number
// }



// export interface ContractsDto {
//   id: number
//   startDate: Date
//   endDate: Date
//   rentalAmount: number
//   state: number
//   lastUpdate: string
//   note: any
//   siteName: string
//   ownerFullName: string
//   ownerCardNumber: string
//   ownerPhoneNumber: string

//   contractType:number
//   contractOrderCode:string
// }


// export interface PaymentToReturn {
//   id: number;
//   paymentCode: string;
//   paymentDate: Date;
//   paymentMethod: string;
//   notes:string;
//   amount: number;
//   checkImage: string;
//   cheekBank: string;
//   bankName: string;
//   contractOrder: {
//     id: number;
//     startDate: Date;
//     endDate: Date;
//     rentalAmount:number;
//     contractOrderCode :string;
//      isPayment:boolean;
//      contractType:number;
//     contract: {
//       id: number;
//       siteName: string;
//       ownerFullName: string;
//       ownerCardNumber: string;
//       ownerPhoneNumber: string;
//     };
//   };
// }


