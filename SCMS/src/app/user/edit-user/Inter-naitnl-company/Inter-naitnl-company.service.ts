// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { forkJoin, Observable } from 'rxjs';

// import { map } from 'rxjs/operators';
// import { Location,CellSiteDto, CellsSiteOpt } from 'src/assets/models/site';
// import { FormGroup, FormBuilder } from '@angular/forms';
// import { MatDialog } from '@angular/material/dialog';
// import { SitesService } from 'src/app/sites/sites.service';


// @Injectable({
//   providedIn: 'root',
// })
// export class InterNaitnlCompanyService {
//   private serviceUrl = 'https://localhost:5001/api/site/CellSiteDto';

//   onRegistrationCertificateFile(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     if (input.files && input.files.length) {
//       const file = input.files[0];
//       const reader = new FileReader();
//       reader.onload = (e: any) => {
//         // تعيين مصدر الصورة إلى النتيجة التي يُعيدها FileReader
//         const previewImg = document.getElementById('CertificateFilePreview') as HTMLImageElement;
//         if (previewImg) {
//           previewImg.src = e.target.result;
//         }
//         // هنا تعيين قيمة الشعار في نموذج paymentForm
//         // افترض أن حقل الشعار يُسمى 'logo'
//         this.basicForm.get('onRegistrationCertificateFile').setValue(e.target.result);
//       };
//       reader.readAsDataURL(file); // قراءة الملف وتحويله إلى URL مشفر بصيغة base64
//     }
//   }

//   onAuthenticityCertificateFile($event: Event) {
//     const input = event.target as HTMLInputElement;
//     if (input.files && input.files.length) {
//       const file = input.files[0];
//       const reader = new FileReader();
//       reader.onload = (e: any) => {
//         // تعيين مصدر الصورة إلى النتيجة التي يُعيدها FileReader
//         const previewImg = document.getElementById('ErtificateFromAdministrationFilePreview') as HTMLImageElement;
//         if (previewImg) {
//           previewImg.src = e.target.result;
//         }
//         // هنا تعيين قيمة الشعار في نموذج paymentForm
//         // افترض أن حقل الشعار يُسمى 'logo'
//         this.basicForm.get('authenticityCertificateFromAdministrationFile').setValue(e.target.result);
//       };
//       reader.readAsDataURL(file); // قراءة الملف وتحويله إلى URL مشفر بصيغة base64
//     }
//     }
//     onCompanyFile($event: Event) {
//       const input = event.target as HTMLInputElement;
//       if (input.files && input.files.length) {
//         const file = input.files[0];
//         const reader = new FileReader();
//         reader.onload = (e: any) => {
//           // تعيين مصدر الصورة إلى النتيجة التي يُعيدها FileReader
//           const previewImg = document.getElementById('companyFile') as HTMLImageElement;
//           if (previewImg) {
//             previewImg.src = e.target.result;
//           }
//           // هنا تعيين قيمة الشعار في نموذج paymentForm
//           // افترض أن حقل الشعار يُسمى 'logo'
//           this.basicForm.get('CompanyFilePreview').setValue(e.target.result);
//         };
//         reader.readAsDataURL(file); // قراءة الملف وتحويله إلى URL مشفر بصيغة base64
//       }
//     }






//   // createLocalCompanyFormGroup(): FormGroup {
//   //   return this._formBuilder.group({
//   //     registrationRequestFile: [''],
//   //     activityLicenseFile: [''],
//   //     licenseNumber: [''],
//   //     licenseValidity: [''],
//   //     foodControlRegistrationCertificateFile: [''],
//   //     authorizedPersonLetter: [''],
//   //     authorizedPersonName: ['', Validators.required],
//   //     authorizedPersonPhone: ['', Validators.required],
//   //     authorizedPersonEmail: ['', [Validators.required, Validators.email]],
//   //     authorizedPersonID: [''],
//   //     professionalOpeningPermitFile: [''],
//   //     professionalType: [''],
//   //     registrationFee: [0],
//   //     authenticityCertificateFromAdministrationFile: [''],
//   //     companyFile: ['']
//   //   });
//   // }
//     cellsSitesOpt: CellsSiteOpt[] = [];
//     constructor(
//       private _formBuilder: FormBuilder,
//       private _SiteService: SitesService,
//       private dialog:MatDialog
//     ) {}


//      ngOnInit(): void {}



//     save() {
//       // Implement your save logic here
//     }

//     toggleEdit(_t83: any) {
//       // Implement your edit logic here
//     }

//   addLac() {


//     }

//   greenFileds= [
//       {id: 1, Name: "MonoPole"},
//       {id: 2, Name: "GuideMast"},
//       {id: 3, Name: "SelfSupport"}
//   ]
//   rooftops=[
//       {id: 1, Name: "GreenFiled"},
//       {id: 2, Name: "Rooftop"}
//   ]



//   }
