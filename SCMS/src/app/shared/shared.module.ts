import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimationIgnoreDirective } from './directives/animation-ignore.directive';
  import { LoadingDialogComponent } from './components/loading-dialog/loading-dialog.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AnimationIgnoreDirective,
      LoadingDialogComponent
  ],
  exports: [
    AnimationIgnoreDirective,
 
     LoadingDialogComponent
  ]
})
export class SharedModule { } 