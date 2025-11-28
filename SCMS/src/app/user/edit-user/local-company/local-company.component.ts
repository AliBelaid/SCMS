import { get } from 'http';
import { Component, OnInit, Input } from "@angular/core";
import { FormGroup, FormArray, FormBuilder } from "@angular/forms";
import { MatDatepicker } from "@angular/material/datepicker";

import { trigger, state, style, transition, animate } from "@angular/animations";
import { fadeInRight400ms } from "src/@vex/animations/fade-in-right.animation";
import { fadeInUp400ms } from "src/@vex/animations/fade-in-up.animation";
import { scaleIn400ms } from "src/@vex/animations/scale-in.animation";
import { stagger40ms } from "src/@vex/animations/stagger.animation";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Dialog, DialogConfig } from "@angular/cdk/dialog";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";



@Component({
  selector: "app-local-company",
  templateUrl: "./local-company.component.html",
  styleUrls: ["./local-company.component.scss"],
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
export class LocalCompanyComponent implements OnInit {

  @Input() public UserForm: FormGroup;


//    createTowerDesign():FormGroup{
//     return this._formBuilder.group({
//       towerType:1,
//       greenFiled: '',
//       rooftop:'',
//       towerHeight: '',
//     })
//   }
// get

onRegistrationCertificateFile(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      // تعيين مصدر الصورة إلى النتيجة التي يُعيدها FileReader
      const previewImg = document.getElementById('CertificateFilePreview') as HTMLImageElement;
      if (previewImg) {
        previewImg.src = e.target.result;
      }
      // هنا تعيين قيمة الشعار في نموذج paymentForm
      // افترض أن حقل الشعار يُسمى 'logo'
      this.basicForm.get('onRegistrationCertificateFile').setValue(e.target.result);
    };
    reader.readAsDataURL(file); // قراءة الملف وتحويله إلى URL مشفر بصيغة base64
  }
}

onAuthenticityCertificateFile($event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      // تعيين مصدر الصورة إلى النتيجة التي يُعيدها FileReader
      const previewImg = document.getElementById('ErtificateFromAdministrationFilePreview') as HTMLImageElement;
      if (previewImg) {
        previewImg.src = e.target.result;
      }
      // هنا تعيين قيمة الشعار في نموذج paymentForm
      // افترض أن حقل الشعار يُسمى 'logo'
      this.basicForm.get('authenticityCertificateFromAdministrationFile').setValue(e.target.result);
    };
    reader.readAsDataURL(file); // قراءة الملف وتحويله إلى URL مشفر بصيغة base64
  }
  }
  onCompanyFile($event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // تعيين مصدر الصورة إلى النتيجة التي يُعيدها FileReader
        const previewImg = document.getElementById('CompanyFilePreview') as HTMLImageElement;
        if (previewImg) {
          previewImg.src = e.target.result;
        }
        // هنا تعيين قيمة الشعار في نموذج paymentForm
        // افترض أن حقل الشعار يُسمى 'logo'
        this.basicForm.get('companyFile').setValue(e.target.result);
      };
      reader.readAsDataURL(file); // قراءة الملف وتحويله إلى URL مشفر بصيغة base64
    }
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
      this.basicForm.get('registrationRequestFile').setValue(e.target.result);
    };
    reader.readAsDataURL(file); // قراءة الملف وتحويله إلى URL مشفر بصيغة base64
  }
}
get LocalCompany(){
  return this.UserForm.get('localCompany').value ;
}

get basicForm() {
  return this.UserForm?.get('basic') as FormGroup;
}
// createLocalCompanyFormGroup(): FormGroup {
//   return this._formBuilder.group({
//     registrationRequestFile: [''],
//     activityLicenseFile: [''],
//     licenseNumber: [''],
//     licenseValidity: [''],
//     foodControlRegistrationCertificateFile: [''],
//     authorizedPersonLetter: [''],
//     authorizedPersonName: ['', Validators.required],
//     authorizedPersonPhone: ['', Validators.required],
//     authorizedPersonEmail: ['', [Validators.required, Validators.email]],
//     authorizedPersonID: [''],
//     professionalOpeningPermitFile: [''],
//     professionalType: [''],
//     registrationFee: [0],
//     authenticityCertificateFromAdministrationFile: [''],
//     companyFile: ['']
//   });
// }
  cellsSitesOpt: any[] = [];
  constructor(
    private _formBuilder: FormBuilder,

    private dialog:MatDialog
  ) {}


   ngOnInit(): void {}



  save() {
    // Implement your save logic here
  }

  toggleEdit(_t83: any) {
    // Implement your edit logic here
  }

addLac() {


  }

greenFileds=[
  {id: 1, NameArb: "الصيدلة", NameEn: "Pharmacy"},
  {id: 2, Name: "الاطباء", NameEn: "Doctors"},
  {id: 3, Name: "الصحة", NameEn: "Health"},
]

rooftops=[
    {id: 1, Name: "GreenFiled"},
    {id: 2, Name: "Rooftop"}
]




  submit(){
    console.log(this.UserForm.value)
  }
}
