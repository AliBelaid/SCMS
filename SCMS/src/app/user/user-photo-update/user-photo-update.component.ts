import { trigger, state, style, transition, animate } from "@angular/animations";
import { HttpClient } from "@angular/common/http";
import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";


import { fadeInRight400ms } from "src/@vex/animations/fade-in-right.animation";
import { fadeInUp400ms } from "src/@vex/animations/fade-in-up.animation";
import { scaleIn400ms } from "src/@vex/animations/scale-in.animation";
import { stagger40ms } from "src/@vex/animations/stagger.animation";
 import { UserService } from "../user.service";

@Component({
  selector: 'vex-user-photo-update',
  styleUrls: ['./user-photo-update.component.scss'],
  templateUrl: './user-photo-update.component.html',  animations:[
    fadeInUp400ms,
    fadeInRight400ms,
    scaleIn400ms,
    stagger40ms,
    trigger('fadeInOut', [
      state('in', style({ opacity: 1 })),
      transition(':enter', [
        style({ opacity: 0 }),
        animate(1000)
      ]),
      transition(':leave', [
        animate(1000, style({ opacity: 0 }))
      ])
    ])
  ]
})
 export class UserPhotoUpdateComponent implements OnInit {
  showButtonArray=[];

  @Input() public images: any[];
  imgToAdd: any ={
  image_base64:''
  };
  public avatar ="";
  public  cover = "" ;
  previewUrls:any[]= [];
  count=0;
  public categories = [];
  // public multiCatSelected = [{ categoryName: 'Wrenches'   } ,{ categoryName: 'Screw Drivers'   } ];
  public multiCatSelected = [];
  public brands = [];
  public multiBrandSelected = [];
  public mainImage = '';
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  selectedFile: any;
  // selectedFiles: any;
  showButtonArrayAdded=[];
  selectedFiles: File[] = [];
  selectedBrands = [];
  selectedCategories = [];
  imagesToRemove = [];
  constructor(private userService:UserService) {
    for (let i = 0; i < this.images?.length; i++) {
      this.showButtonArray[i] = false;
      this.count=this.count+i;
      console.log(this.images);
    }
    for (let x = 0; x < this.previewUrls.length; x++) {
      this.showButtonArrayAdded[x] = false;
    }
if(this.previewUrls?.length>0) {
  for (let i = 0; i < this.selectedFiles.length; i++) {
    const file = this.selectedFiles[i];
    const reader = new FileReader();
    reader.onload = (e: any) => {

      this.previewUrls.push(
          e.target.result);
     };
    reader.readAsDataURL(file);
  }
}

  }

  ngOnInit(): void {

console.log(this.images);
  }
  show_image_on_main(image) {
    this.mainImage = image;
  }


  preview() {
    this.previewUrls = [];
    for (let i = 0; i < this.selectedFiles.length; i++) {
      const file = this.selectedFiles[i];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrls.push(e.target.result);
       };
      reader.readAsDataURL(file);
    }
  }

  remove_new_image(index: number) {
    this.selectedFiles.splice(index, 1);
    this.preview();
  }
  remove_old_image(img:any) {
    this.images.splice(img.id, 1);
    this.userService.DeleteImg(img).subscribe((rep)=> {
      if(rep) {
        this.images.splice(img.id, 1);
        this.preview();
      }
    });

  }


  remove_existed_image(id: any, index) {
    this.imagesToRemove.push(id);
    document.getElementById('li_img_existed_' + index).hidden = true;
  }
   setCover(url: string,x:any) {
   console.log(url);

   this.userService.setUpdateCurrentPhotoCover(url);
   this.images.forEach((y,i)=> { y.is_cover = false;});
   this.cover= url ;
  }
  setAvatar(url: string,x:number) {
     this.userService.setUpdateCurrentPhotoAvatar(url);
     this.images.forEach((y,i)=> {
        y.isMain = false;
    });
    this.avatar= url ;
  }

  selectCover(url){
    console.log(url);
    this.images.forEach((y,i)=> {
      if(y.id===url.id) {
        y.is_cover=true;
      }else {
        y.is_cover = false;
      }
      let img:any ={
      image_id :url.id ,
      image_type:'is_cover'
      }
    this.userService.setUpdateCurrentPhotoCover(url.image_path);
    this.userService.UpdateImg(img);
  });
}

  selectAvatar(url) {
    console.log(url);
    this.images.forEach((y,i)=> {
      if(y.id===url.id) {
        y.isMain=true;
      }else {
        y.isMain = false;
      }
    });
    this.userService.setUpdateCurrentPhotoAvatar(url.image_path);
    let img:any ={
      image_id :url.id ,
      image_type:'isMain'
      };
      this.userService.UpdateImg(img);
  }
  remove_main_image(id: any) {
    this.imagesToRemove.push(id);
    document.getElementById('li_img_main').hidden = true;
  }
  add_new_subimage() {
    this.fileInput.nativeElement.click();


  }
  onFileChanged(event) {
    const files = this.fileInput.nativeElement.files;

    this.handleUpload(event);

     this.selectedFiles = [...this.selectedFiles, ...files];
    this.preview();
  }


  handleUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        console.log(reader.result);
        this.imgToAdd.image_base64 = reader.result.toString();
        console.log( this.imgToAdd);
       this.userService.uploadImage(this.imgToAdd);
    };
}
}
