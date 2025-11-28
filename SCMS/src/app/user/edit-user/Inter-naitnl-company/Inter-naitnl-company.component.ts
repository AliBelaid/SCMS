

  import { Component, OnInit, Input, HostListener, ElementRef, Renderer2, ViewChild } from "@angular/core";
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


 import { TranslateService } from "@ngx-translate/core";

  @Component({
    selector: "vex-Inter-naitnl-company",
    templateUrl: "./Inter-naitnl-company.component.html",
    styleUrls: ["./Inter-naitnl-company.component.scss"],
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
  export class InterNaitnlCompanyComponent implements OnInit {
onISO13485CertificateFile($event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      // تعيين مصدر الصورة إلى النتيجة التي يُعيدها FileReader
      const previewImg = document.getElementById('ISO13485CertificateFilePreview') as HTMLImageElement;
      if (previewImg) {
        previewImg.src = e.target.result;
      }
      // هنا تعيين قيمة الشعار في نموذج paymentForm
      // افترض أن حقل الشعار يُسمى 'logo'
      this.InterCompany.get('gmpAndISO13485CertificateFile').setValue(e.target.result);
    };
    reader.readAsDataURL(file); // قراءة الملف وتحويله إلى URL مشفر بصيغة base64

  }}
onFileCardSelected($event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      // تعيين مصدر الصورة إلى النتيجة التي يُعيدها FileReader
      const previewImg = document.getElementById('FileCardSelectedPreview') as HTMLImageElement;
      if (previewImg) {
        previewImg.src = e.target.result;
      }
      // هنا تعيين قيمة الشعار في نموذج paymentForm
      // افترض أن حقل الشعار يُسمى 'logo'
      this.InterCompany.get('registrationRequestFile').setValue(e.target.result);
    };
    reader.readAsDataURL(file); // قراءة الملف وتحويله إلى URL مشفر بصيغة base64

  }
}
onRiskAssessmentFile($event: Event) {

    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // تعيين مصدر الصورة إلى النتيجة التي يُعيدها FileReader
        const previewImg = document.getElementById('RiskAssessmentPreview') as HTMLImageElement;
        if (previewImg) {
          previewImg.src = e.target.result;
        }
        // هنا تعيين قيمة الشعار في نموذج paymentForm
        // افترض أن حقل الشعار يُسمى 'logo'
        this.InterCompany.get('riskAssessmentFile').setValue(e.target.result);
      };
      reader.readAsDataURL(file); // قراءة الملف وتحويله إلى URL مشفر بصيغة base64
    }
  }
  get InterCompany(){
    return this.UserForm.get('interNaitnlCompany').value ;
  }

onStabilityStudiesFile($event: Event) {


  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      // تعيين مصدر الصورة إلى النتيجة التي يُعيدها FileReader
      const previewImg = document.getElementById('StabilityStudiesFilePreview') as HTMLImageElement;
      if (previewImg) {
        previewImg.src = e.target.result;
      }
      // هنا تعيين قيمة الشعار في نموذج paymentForm
      // افترض أن حقل الشعار يُسمى 'logo'
      this.InterCompany.get('authenticityCertificateFromAdministrationFile').setValue(e.target.result);
    };
    reader.readAsDataURL(file); // قراءة الملف وتحويله إلى URL مشفر بصيغة base64
  }
}

    @Input() public UserForm: FormGroup;
     lacForm= this.createLac();
    get cellsSitesForms() {
      return this.UserForm.get("cellsSites") as FormArray;
    }
    cellsSitesOpt: any[] = [];
    constructor(
      private _formBuilder: FormBuilder,
      public translate:TranslateService,
      private dialog:MatDialog,
      private el: ElementRef, private renderer: Renderer2) {



      }

    ngOnInit(): void {
    }
      @Input() appSiteConfigMask: string; // Input mask
      removeOpt(selectedId: any) {
        const indexToRemove = this.LacSitesForms.controls.findIndex((control: FormGroup) => {
          return control.get('id')?.value === selectedId;
        });
        if (indexToRemove !== -1) {
          this.LacSitesForms.removeAt(indexToRemove);
        }
      }
    items:any[]=[];
    generateDataList(i:any)  {
      console.log(i);
      this.items=[];
      var data= i;
      var siteName = this.UserForm?.get('basic').value?.siteName ;
      if(this.items.length>0) {
        return this.items;
      }
      for (let i = 1; i <= data?.SiteCount; i++) {
        const item = {
          CELL_ID: i,
          Cell_Name: `${siteName}${data?.frequencyBand.alias}${i}`,
          CI_DEC: "00000",
          In_EMS: "",
          Antenna_Azimuth: "",
          Antenna_Downtilt: "",
          E_tilt: "",
          M_Tilt: "",
          isSelected: false,
          isEdit: true,
        };
        this.items.push(item);
      }
        return  this.items;
    }
    CountOfcell = 0;
    openAddCell() {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = 'auto';
      dialogConfig.height = 'auto';
      dialogConfig.maxWidth = '100%';
     // this.lacForm =  this.createLac();
    //  this.lacForm.setValue(opt);
      // Set the desired width here
      dialogConfig.data = this.generateDataList(this.lacForm.value);
 }

    drop(event: CdkDragDrop<any[]>) {
      moveItemInArray(this.LacSitesForms.value, event.previousIndex, event.currentIndex);
    }
  // Change LacSitesForms to LacSitesForms
  get LacSitesForms() {
    return this.UserForm.get('lac') as FormArray;
  }


  get cellsSitesSitesForms() {
    return this.lacForm.get('cellsSites') as FormArray;
  }
  createLac(): FormGroup {
    return this._formBuilder.group({
      frequencyBand: '',  // 2G, 3G, etc.
      lac: '',
      antennaType: '',
      antennaHeight: '',
      siteConfiguration: '',
      SiteCount:0,
      cellsSites: this._formBuilder.array([]),
    });
  }
    createCell(): FormGroup {
      return this._formBuilder.group({
        CELL_ID: 0,
        Cell_Name: '',
        CI_DEC: '',

        In_EMS: '',
        Antenna_Azimuth: '',
        // GCI: '',
        Antenna_Downtilt: '',
        E_tilt: '',
        M_Tilt: '',
      //  New_cells_in_last_update: '',
        isSelected: false,
        isEdit: false,
      });
    }
    frequencyBands: any[] = [];

    antennaTypes: any[]=[] ;
    save() {
      // Implement your save logic here
    }

    toggleEdit(_t83: any) {
      // Implement your edit logic here
    }
    // Add a new Lac FormGroup
  // Inside your AddLacComponent class
  addLac() {

      if(this.lacForm.valid){
      this.LacSitesForms.push(this._formBuilder.control(this.lacForm.value));
      this.lacForm.reset(null);

          this.CountOfcell=0;
      }

    }
    submit(){
      console.log(this.UserForm.value)
    }
  }
