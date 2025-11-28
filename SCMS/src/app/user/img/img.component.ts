import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'vex-img',
  templateUrl: './img.component.html',
  styleUrls: ['./img.component.scss']
})
export class ImgComponent implements OnInit {


  @Input() product;
  @Input() mode;
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
//  @Output('reloadProducts') reloadProducts: EventEmitter<any> = new EventEmitter();




  // modalClose(){
  //   this.modalService.dismissAll();
  // }


  constructor
  () { }

  // Public Methods
  public images = [];
  public categories = [];
  // public multiCatSelected = [{ categoryName: 'Wrenches'   } ,{ categoryName: 'Screw Drivers'   } ];
  public multiCatSelected = [];
  public brands = [];
  public multiBrandSelected = [];
  public mainImage = '';

  selectedFile: any;
  // selectedFiles: any;
  previewUrl: any;
  previewUrls: any;
	  selectedFiles: File[] = [];
	  base64 = [];
	  selectedBrands = [];
	  selectedCategories = [];
	  imagesToRemove = [];

	  items = [
		{ code: '000421009', description: '42 9', specification: 'size: 10x10	 mm', price: 20, stock: 4 },

	  ];

	  productForm: FormGroup = new FormGroup({
		name: new FormControl('', [Validators.required]),
		code: new FormControl('', [Validators.required]),
		slug: new FormControl('', [Validators.required]),
		short_desc: new FormControl('', [Validators.required]),
	  });


	  ngOnInit(): void {


		 // this.mainImage = this.product.pictures[0].url;
		let productImages = [];
		this.images = productImages;


	  } /* End of ngOnInit */



	  // getBrands() {
		// this._productService.getProductsBrands().subscribe((res: any) => {
		//   this.brands = res.data;
		//   this.multiBrandSelected =  [] ;
		//   if (this.product.category) {
		// 	for (const i in this.product.brands) {  // const k: string
		// 	  let item = { brandName: this.product.brands[i].name  };
		// 	  this.multiBrandSelected.push(item);
		// 	}
		//   }




	  // getCategories() {
		// this._productService.getProductsCategories().subscribe((res: any) => {
		//   this.categories = res.data;
		//   this.multiCatSelected =  [] ;
		//   if (this.product.category) {
		// 	for (const i in this.product.category) {  // const k: string
		// 	  let item = { categoryName: this.product.category[i].name  };
		// 	  this.multiCatSelected.push(item);
		// 	}
		//   }
		// });
	  // }


	  show_image_on_main(image) {
		this.mainImage = image;
	  }

	  onFileChanged(event) {
		// this.selectedFile = event.target.files[0];
		//  this.selectedFiles = this.fileInput.nativeElement.files;
		const files = this.fileInput.nativeElement.files;
		this.selectedFiles = [...this.selectedFiles, ...files];
		this.preview();
	  }

	  preview() {
		this.base64 = [];
		this.previewUrls = [];
		for (let i = 0; i < this.selectedFiles.length; i++) {
		  const file = this.selectedFiles[i];
		  const reader = new FileReader();
		  reader.onload = (e: any) => {
			this.previewUrls.push(e.target.result);
			this.base64.push(e.target.result);
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
	  remove_main_image(id: any) {
		this.imagesToRemove.push(id);
		document.getElementById('li_img_main').hidden = true;
	  }


	  submit() {

		this.productForm.patchValue({
		  name: this.product.name,
		  code: this.product.code,
		  slug: this.product.slug,
		  short_desc: this.product.short_desc
		  //  code: product?.code ?? '',
		});


    // if (this.productForm.valid) {
    const data = {
      ...this.productForm.value,
      id: this.product.id, // Append product id
      files: this.selectedFiles, // Append images
      images: this.base64,
      brands: this.multiBrandSelected,
      categories: this.multiCatSelected,
      removedImages: this.imagesToRemove,
      subProducts:this.items,
    };


// // on insert mode call post api
//     if (this.mode == 'insert'){
//     this._productService.postProduct(data).subscribe((res: any) => {
//       if (!res.error) {
//         Swal.fire(
//           '',
//           'Product updated successfully',
//           'success'
//         );

//       this.sharedService.sendRefreshEvent();
// // **
//       } else {
//         Swal.fire(
//           '',
//           res.data,
//           'success'
//         )
//       }
//     });
//   }
//   // on update mode call edit api
//   else if(this.mode =='update'){
//     this._productService.editProduct(data).subscribe((res: any) => {
//       if (!res.error) {
//         Swal.fire(
//           '',
//           'Product updated successfully',
//           'success'
//         )
//       } else {
//         Swal.fire(
//           '',
//           res.data,
//           'success'
//         )
//       }
//     });
//   } // end of IF statement [insert or update]



  } // end of submit()

// openModalDelete(){

//   const modalRef = this.modalService.open(ProductModalDelComponent, {
//     size: 'sm',
//     centered: true,
//     windowClass: 'modal modal-danger'
//   });
//   modalRef.componentInstance.product = this.product;

// }

  add_new_sub_product(){
    this.items .push({ code: '', description: '', specification: '', price: 0, stock: 0 }) ;
  }

  add_new_subimage() {
    this.fileInput.nativeElement.click();
  }

  onlyNumberKey(event: KeyboardEvent) {
    const pattern = /^\d*(\.\d{0,2})?$/g;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }

  onlyIntegerKey(event: KeyboardEvent) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }




}
