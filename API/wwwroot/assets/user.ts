  

 


  export interface SpecialtyUser {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
  }

  export interface IUserNew {
    categories: import("./his.model.ts").CategoryService[];
    accountType: any
    pathCoverImage: string
    logo: string
    id: number
    specialties:string[];
    firstName:string;
    lastName:string;
    clinics:Clinic[];
    reginLibyana:string[];
    displayName: string;
    userName:string;
    KnownAs: string;
    token: string;
    roles: string[];
    photoUrl: string
    reginsNames:string[]
    email: string
    age: number
    knownAs: string
    created: string
    lastActive: string
    gender: string
    introduction: string
    lookingFor: string
    interests: string
    city: string
    country: string
    phoneNumber:string
    enabledCategories?: number[];
 
  }
  export interface IUsertDto{
    id: string
    displayName: string;
    userName:string;
    KnownAs: string;
    token: string;
    roles: string[];

    photoUrlFile: File

    email: string
    age: number
    knownAs: string
    created: string
    lastActive: string
    gender: string
    introduction: string
    lookingFor: string
    interests: string
    city: string
    country: string

  }


  export interface Registration {
    id: number
    country: string
    registrationFile: string
    registrationDate: string
  }

  export interface ProductsToBeImported {
    id: number
    name: string
    type: string
    compositionIfDrug: string
  }

  export interface DeclarationsOfConformity {
    id: number
    productName: string
    declarationFile: string
  }

  export interface LocalCompany {
    id: number
    appUserId: number
     registrationRequestFile: string
    activityLicenseFile: string
    licenseNumber: string
    licenseValidity: string
    foodControlRegistrationCertificateFile: string
    authorizedPersonLetter: string
    authorizedPersonName: string
    authorizedPersonPhone: string
    authorizedPersonEmail: string
    authorizedPersonID: string
    professionalOpeningPermitFile: string
    professionalType: string
    registrationFee: number
    authenticityCertificateFromAdministrationFile: string
    companyFile: string
  }


 
  export interface IUser {
    id: string
    logo: string | null;
    knownAs:string
    pathCoverImage: string | null;
    phoneNumber:string;
    userName:string,
    token: string;
    displayName: string;
    created: string;
    lastActive: string;
    gender: string | null;
    introduction: string | null;
    lookingFor: string | null;
    interests: string | null;
    city: string | null;
    country: string | null;
    email: string;
    roles: string[];
 
    accountType: number;
    abrove: boolean;
    enabledCategories?: number[];
 
  }

  export interface UserRole {
    userId: number
    roleId: number
    user: string
    role: Role
  }

  export interface Role {
    isActive?: boolean
    description?: any
    id?: number
    name?: string
    normalizedName?: string
    concurrencyStamp?: string
    userRoles?: string[]
    checked?:boolean;
  }
  export interface DoctorSpecialty {
    doctorId: number;
    specialtyId: number;
  }
  export interface Specialty {
    id: number;
    name: string;
    nameArabic?: string;
    description?: string;
    location?: string;  
  }
  


  export interface Clinic {
    checked?: Boolean
    id?: number;
    name: string;
    nameArabic?: string;
    description?: string;
    location?: string;
    contactInfo?: string;
    isActive?: boolean;
    specialtyId?: number;
    specialtyName?: string;
 
    logo?: string;
    doctorsCount: number;
    isBlocked?: boolean;
    patientsAllCount?: number;
    patientsActivied?: number;
  }

 
