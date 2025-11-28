import { Component, OnInit } from "@angular/core";
import { FormGroup, FormArray, FormBuilder, Validators, UntypedFormBuilder, FormGroupName, UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { MatDatepicker } from "@angular/material/datepicker";

import { map, take } from "rxjs";
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";
import { fadeInRight400ms } from "src/@vex/animations/fade-in-right.animation";
import { fadeInUp400ms } from "src/@vex/animations/fade-in-up.animation";
import { scaleIn400ms } from "src/@vex/animations/scale-in.animation";
import { stagger40ms } from "src/@vex/animations/stagger.animation";
import { get } from "http";
import {
  ActivatedRoute,
  Route,
  Router,
  RouterStateSnapshot,
  Routes,
} from "@angular/router";
import { DialogConfig } from "@angular/cdk/dialog";
import { MatDialog } from "@angular/material/dialog";
import { error } from "console";
import { ToastrService } from "ngx-toastr";
import { UserService } from "../user.service";

// const columnsSchema = [
//   { key: "name", label: "Name", type: "text" },
//   { key: "birthDate", label: "Birth Date", type: "date" },
//   {
//     key: "education",
//     label: "Education Level",
//     type: "select",
//     options: ["First", "Second", "Third"],
//   },
// ];


export const MY_DATE_FORMATS = {
  parse: {
    dateInput: "DD/MM/YYYY",
  },
  display: {
    dateInput: "DD/MM/YYYY",
    monthYearLabel: "MMMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY",
  },
};
@Component({
  selector: "app-edith-user",
  templateUrl: "./edit-user.component.html",
  styleUrls: ["./edit-user.component.scss"],
  animations: [
    fadeInUp400ms,
    fadeInRight400ms,
    scaleIn400ms,
    stagger40ms,
    trigger("fadeInOut", [
      state("in", style({ opacity: 1 })),
      transition(":enter", [style({ opacity: 0 }), animate(1000)]),
      transition(":leave", [animate(1000, style({ opacity: 0 }))]),
    ]),
  ],
})
export class EditUserComponent implements OnInit {
  UserForm = this._formBuilder.group({
    basic: this.CreateBasicFormGroup() ,
    interNaitnlCompany: this.createInterNaitnlCompanyFormGroup(),
    localCompany: this.createLocalCompanyFormGroup(),

  });

  cellsSitesOpt:any[]=[];
  layoutCtrl = new UntypedFormControl('fullwidth');

  searchVisible=false;
  getFilteredAreas() {
    //const selectedDepartmentId = this.basicForm.get('regin')?.value || 1;
     // Filter designations based on the selected department
   // return this.regins.find(dep => dep.id === selectedDepartmentId)?.cities || [];
  }




  openMapDialog(): void {
    // const dialogRef = this.dialog.open(MapComponent);

    // dialogRef.componentInstance.locationSelected.subscribe((location: { latitude: number, longitude: number }) => {
    //   // Set the latitude and longitude in your form


    //   this.UserForm.get('basic').patchValue({
    //     latitude: location.latitude,
    //     longitude: location.longitude
    //   });
    // });

  }


  // ...



  save() {}
  toggleEdit(_t83: any) {}



  regins: any[]=[];
  user:any;
  picker: MatDatepicker<any>;
  id:number;
  constructor(
    private _formBuilder:  UntypedFormBuilder,
    public _SiteService: UserService,
    private route: Router,
    private routing: ActivatedRoute ,  private dialog:MatDialog,
    private toastrService:ToastrService
) {


  this._SiteService.loadCurrentUser().pipe(take(1)).subscribe((rep) => {
    this.user = rep;
    if(this.user) {
      this.loadingCreateForm(this.user);
    }
  });

  }

  get basicForm() {
    return this.UserForm?.get('basic') as FormGroup;
  }
  parentItem:any;
  ngOnInit(): void {




    this.routing.data.subscribe(data=> {
      if( data["member"] !==null) {
       console.log(data)
      }

    })




}

  submit() {
    console.log(this.UserForm.value)
    const formData = this.UserForm.value;
    const dataToSend = {
      siteName: formData.basic.siteName,
      location: {
          latitude: formData.basic.latitude.toString(),
          longitude: formData.basic.longitude.toString(),
          street: formData.basic.street,
          neerPoint: formData.basic.neerPoint,
          cityId: formData.basic.areaId,
      },
      implementDate: formData.basic.implementDate,


      planSite: {
          planName: formData.planSites.planName,
          clanderPlanDate: formData.planSites.clanderPlanDate,
          dayToAction: formData.planSites.dayToAction,
          stateOfPlan: formData.planSites.stateOfPlan,
          stateSitePlan: 1,
      },
      towerDesign: formData.TowerDesign,
      bscConfig: formData.BSCConfig,

        cellsSites:[...formData.lac?.flatMap((des) =>
          des.cellsSites.map((cell: any) => ({
        frequencyBandId: des.frequencyBand,
        lac: des.lac,
        antennaTypeId: des.antennaType,
        antennaHeight: des.antennaHeight,
        siteConfiguration: des.siteConfiguration,
        cellId: cell.CELL_ID,
        cellName: cell.Cell_Name,
        ci: cell.CI_DEC,
        inEms: cell.In_EMS,
        antennaAzimuth: cell.Antenna_Azimuth,
        antennaDowntilt: cell.Antenna_Downtilt,
        eTilt: cell.E_tilt,
        mTilt: cell.M_Tilt,
        vender:cell.vender??"no",
        cellType:cell.cellType??"no",
        angle:cell.angle??65.5
      }))
      )],
  };
  console.log(dataToSend) ;
    this._SiteService.updateUserx(dataToSend).pipe(take(1)).subscribe(rep=> {
      if(rep) {

        this.toastrService.success('Add Site!!')
      }
    },error=>{
      console.log(error)
      this.toastrService.error('error falid added!!')
    });


        console.log(dataToSend)

  }
  updateAddress(){


  }






  loadingCreateForm(data:any) {

  this.UserForm = this._formBuilder.group({
    basic: this.CreateBasicFormGroup(data) ,
    interNaitnlCompany: this.createInterNaitnlCompanyFormGroup(),
    localCompany: this.createLocalCompanyFormGroup(),

  });


 this.basicForm.get('logo').valueChanges.subscribe((file: File) => {
  if (file) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      // هنا يمكن تعديل قيمة FormControl بالقيمة المطلوبة، مثلاً:
       this.basicForm.get('logo').setValue(e.target.result);
    };
    reader.readAsDataURL(file);
  }
});
  }
  CreateBasicFormGroup(data?:any):  FormGroup {
    return  this._formBuilder.group({
      userName: [data?.userName, Validators.required],
      email: [data?.phoneNumber, [Validators.required, Validators.email]],
      phoneNumber: [data?.phoneNumber],
      displayName: [data?.displayName],
      lastActive: [new Date()],
      introduction: [data?.introduction],
      city: [data?.city],
      country: [data?.country],
      street:[data?.country] ,
      longitude:[] ,
      latitude:[],
      logo: [data?.logo],
      // pathCoverImage: [''],
      accountType: [data?.accountType],
     // abrove: [data?.abrove],
     // roles: this._formBuilder.array([data?.roles])

    });
  }



createInterNaitnlCompanyFormGroup(): FormGroup {
  return this._formBuilder.group({
    financialStatusFile: [''],
    registrations: this._formBuilder.array([]), // يتم ملؤها بالبيانات حسب الحاجة
    siteMasterFile: [''],
    gmpAndISO13485CertificateFile: [''],
    licenseNumber: [''],
    licenseDate: [''],
    licenseValidity: [''],
    freeSaleCertificateFile: [''],
    productsToBeImported: this._formBuilder.array([]), // يتم ملؤها بالبيانات حسب الحاجة
    declarationsOfConformity: this._formBuilder.array([]), // يتم ملؤها بالبيانات حسب الحاجة
    clinicalPerformanceFile: [''],
    stabilityStudiesFile: [''],
    riskAssessmentFile: ['']
  });
}
onFileCardSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      // تعيين مصدر الصورة إلى النتيجة التي يُعيدها FileReader
      const previewImg = document.getElementById('logoPreview') as HTMLImageElement;
      if (previewImg) {
        previewImg.src = e.target.result;
      }
      // هنا تعيين قيمة الشعار في نموذج paymentForm
      // افترض أن حقل الشعار يُسمى 'logo'
      this.basicForm.get('logo').setValue(e.target.result);
    };
    reader.readAsDataURL(file); // قراءة الملف وتحويله إلى URL مشفر بصيغة base64
  }
}


createLocalCompanyFormGroup(): FormGroup {
  return this._formBuilder.group({
    registrationRequestFile: [''],
    activityLicenseFile: [''],
    licenseNumber: [''],
    licenseValidity: [''],
    foodControlRegistrationCertificateFile: [''],
    authorizedPersonLetter: [''],
    authorizedPersonName: ['', Validators.required],
    authorizedPersonPhone: ['', Validators.required],
    authorizedPersonEmail: ['', [Validators.required, Validators.email]],
    authorizedPersonID: [''],
    professionalOpeningPermitFile: [''],
    professionalType: [''],
    registrationFee: [0],
    authenticityCertificateFromAdministrationFile: [''],
    companyFile: ['']
  });
}

}
