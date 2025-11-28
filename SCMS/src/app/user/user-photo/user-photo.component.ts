import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { fadeInRight400ms } from 'src/@vex/animations/fade-in-right.animation';
import { fadeInUp400ms } from 'src/@vex/animations/fade-in-up.animation';
import { scaleIn400ms } from 'src/@vex/animations/scale-in.animation';
import { stagger40ms } from 'src/@vex/animations/stagger.animation';

import { UserService } from '../user.service';

@Component({
  selector: 'vex-user-photo',
  templateUrl: './user-photo.component.html',
  styleUrls: ['./user-photo.component.scss'],
  animations: [
    fadeInUp400ms,
    fadeInRight400ms,
    scaleIn400ms,
    stagger40ms
  ]
})
export class UserPhotoComponent implements OnInit {
  showButton=false;
  photoCover:any= {
    id:1,
    image_path:"",
    is_avatar:0,
    is_cover:0,
    image_ext:"sghh",
    user_id:1,
    image_name:"fhfh"
  };
  photoAvatar:any= {
    id:1,
    image_path:"",
    is_avatar:0,
    is_cover:0,
    image_ext:"sghh",
    user_id:1,
    image_name:"fhfh"
  };
  previewUrls= ['https://vex.visurel.com/assets/img/Medical/user.jpg','https://vex.visurel.com/assets/img/avatars/2.jpg',
 ];
  public images = [];
  public categories = [];
  // public multiCatSelected = [{ categoryName: 'Wrenches'   } ,{ categoryName: 'Screw Drivers'   } ];
  public multiCatSelected = [];
  public brands = [];
  public multiBrandSelected = [];
  public mainImage = '';
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  selectedFile: any;
  // selectedFiles: any;

  selectedFiles: File[] = [];
  selectedBrands = [];
  selectedCategories = [];
  imagesToRemove = [];
  constructor(private userService:UserService) {
if(this.previewUrls.length>0) {
  for (let i = 0; i < this.selectedFiles.length; i++) {
    const file = this.selectedFiles[i];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrls.push(e.target.result);
     };
    reader.readAsDataURL(file);
  }
}

  }

  ngOnInit(): void {


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
  remove_existed_image(id: any, index) {
    this.imagesToRemove.push(id);
    document.getElementById('li_img_existed_' + index).hidden = true;
  }
   setCover(url: string,i:any) {
   console.log(url);
  this.photoCover.image_path = url;
  this.photoCover.id = i;
  this.photoCover.is_cover = 1;
  this.photoCover.is_avatar = 0;
   this.userService.setUpdateCurrentPhotoCover(this.photoCover);
  }
  setAvatar(url: string,i:any) {
    this.photoAvatar.id = i;
    this.photoAvatar.image_path = url;
    this.photoAvatar.is_avatar = 1;
    this.photoAvatar.is_cover = 0;
    console.log(this.photoAvatar);
    this.userService.setUpdateCurrentPhotoAvatar(this.photoAvatar);
      console.log(this.photoAvatar);
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
    this.selectedFiles = [...this.selectedFiles, ...files];
    this.preview();
  }
}
