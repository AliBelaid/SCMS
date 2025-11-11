export interface Parent {
  id: number;
  name: string;
  birth_Date: Date;
  phone_List: string;
  email: string;
  last_login: Date;
  addressParent: AddressParent;
  isBlocked: boolean;
  children: Childern[];
  paymentAcademicYear:any[];


  isAvitve: boolean;
}






export interface paintationParent {
  data : Parent[] ;
  count:number;
pageIndex:number;
pageSize:number;


}
export interface AddressParent {
  id: number;
  description: string;
  street: string;
  cityId: number;
}

export interface City {
  id: number;
  name: string;
}
export interface CitySite {
  id: number;
  reginLibyana: string;
  a_state: string;
  e_state: string;
  RegionId: number;
}



export interface StudentPayment  {
  studentId: number;
  amount: number;
  paymentOrderId: number;
  id: number;
}
export interface PaymentAcademicYear{
  id: number
  parentId: number
  paymentCode: number
  paymentOrders: PaymentOrder[]
  paymentType: number
  totalAmount: number
  totalOrder: number
  paymentCreate: string
  notes: string
  paymentStatues: number
  discountId: number
  academicYearId: number
  discountName:string
  parentName:string
  academicYearName:string
  numberOfChildernPayment:number
  numberOfPaymentOrders:number
  totalDebit:number
  isExpanded: boolean;
}

export interface PaymentOrder {
  parentId: number;
  parent: Parent;
  studentPayments: StudentPayment[];
  paymentState: number;
  amount: number;
  paymentDateTiket: string;
  orderFileUpload:string;
  notes:string;
  paymentAcademicYearId:string;
}




export interface academicYear {
  academicYearName:string;
  year:string;
  startDate:string;
  endDate:string;
  id:number;
  semesters:semesters[]
}





export interface Grade {
  id: number;
  name: string;
  stage_name: string;
  curriculum_name: string;
  fees: number;
  feesEveryStage: number;
  stage: number;
  semesters:semesters[];
}



export interface semesters {
  academicYearId:number ;
  fees:number ;
  id:number ;
  semesterName:string;
  gradeId:number;
  stage:string;
  gradeName:string;
}



export interface Student {
  id: number;
  name: string;
  brithOfDay: string;
  academicYear: string;
  gradeId: number;
  grade: Grade;
  parentId: number;
  gender: number;
  isAvitve: boolean;
  semesters:semesters[];
  studentPayment:StudentPayment[];
}
export interface Childern {
  isSelected: boolean;
  id: number;
  name: string;
  parentId: number;
  brithOfDay: string;
  academicYear: string;
  gradeId: number;
  gradeName: string;
  gender: number;
  isAvitve: boolean;
  isEdit?: boolean ;
  fees?:number ;
  studentPayment:StudentPayment[];
  semesters:semesters[];

}



export interface semesters {
  academicYearId:number ;
  fees:number ;
  id:number ;
  semesterName:string;

}

export interface Discount {
  id: number
  discountName: string
  percentage: number
  daisbleDiscount: number
}
