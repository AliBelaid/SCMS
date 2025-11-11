export class PaymentItem {
  id: number;
  parentId: number;
  parentName: string;
  dateOfPayment: string;
  paymentId: number;
  discountId: number;
  discountValue: number;
  discountType: string;
  children: ChildItem[];
  paymentCode: string;
  paymentCycleId: number;
  paymentType: string;
  dateOfNextPayment: string;
  imageOrder:string;
  totalPayment:number;
  valuePayment:number;
  labels: any;
  constructor(payment) {
    this.id = payment.id;
    this.parentId =payment.parentId;
    this.parentName = payment.parentName;
    this.dateOfPayment = payment.dateOfPayment;
    this.paymentId = payment.paymentId;
    this.discountId = payment.discountId;
    this.discountValue = payment.discountValue;
    this.discountType = payment.discountType;
    this.children = payment.children;
    this.paymentCode = payment.paymentCode;
    this.paymentCycleId = payment.paymentCycleId;
    this.paymentType = payment.paymentType;
    this.dateOfNextPayment = payment.dateOfNextPayment;
    this.imageOrder = "https://i.pinimg.com/originals/39/32/d4/3932d4eb77e24bd2e600a6db35f026f6.jpg",
    this.valuePayment = payment.children.reduce((total, child) => total + child.feesGrade, 0);
    this.totalPayment = payment.discountId===1? this.valuePayment * (1 - payment.discountValue / 100):this.valuePayment *  payment.discountValue ;
    //discountId ===1 as decount value //==2 is as presntege
    this.labels = payment.label;
  }
}

export class ChildItem {
  name: string;
  gradeId: number;
  gradeName: string;
  feesGrade: number;
  yearsOfEducation: string;

  constructor(
    name: string,
    gradeId: number,
    gradeName: string,
    feesGrade: number,
    yearsOfEducation: string
  ) {
    this.name = name;
    this.gradeId = gradeId;
    this.gradeName = gradeName;
    this.feesGrade = feesGrade;
    this.yearsOfEducation = yearsOfEducation;
  }
}

export const paymentList: PaymentItem[] = [
  {
    id: 1,
    parentId: 1,
    parentName: "Parent 1",
    dateOfPayment: "2023-05-21",
    paymentId: 1,
    discountId: 1,
    discountValue: 10,
    discountType: "Percentage",
    children: [
      {
        name: "John",
        gradeId: 1,
        gradeName: "Grade 1",
        feesGrade: 5000,
        yearsOfEducation: "2023-2024"
      },
      {
        name: "Jane",
        gradeId: 2,
        gradeName: "Grade 2",
        feesGrade: 6000,
        yearsOfEducation: "2023-2024"
      }
    ],
    paymentCode: "PC001",
    paymentCycleId: 1,
    paymentType: "Payment Type 1",
    dateOfNextPayment: "2023-06-21",
    imageOrder: "https://i.pinimg.com/originals/39/32/d4/3932d4eb77e24bd2e600a6db35f026f6.jpg",
    totalPayment: 11000,
    valuePayment: 9900,
    labels: []
  },
  {
    id: 2,
    parentId: 2,
    parentName: "Parent 2",
    dateOfPayment: "2023-05-22",
    paymentId: 2,
    discountId: 2,
    discountValue: 200,
    discountType: "Fixed",
    children: [
      {
        name: "Tom",
        gradeId: 3,
        gradeName: "Grade 3",
        feesGrade: 7000,
        yearsOfEducation: "2023-2024"
      },
      {
        name: "Emily",
        gradeId: 4,
        gradeName: "Grade 4",
        feesGrade: 8000,
        yearsOfEducation: "2023-2024"
      }
    ],
    paymentCode: "PC002",
    paymentCycleId: 2,
    paymentType: "Payment Type 2",
    dateOfNextPayment: "2023-07-21",
    imageOrder: "https://i.pinimg.com/originals/39/32/d4/3932d4eb77e24bd2e600a6db35f026f6.jpg",
    totalPayment: 15000,
    valuePayment: 14800,
    labels: []
  },
  // Add more payment items here...
];
