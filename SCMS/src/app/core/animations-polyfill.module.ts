import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

/**
 * This module is a polyfill for animations in production builds.
 * In some cases, AOT compilation can strip out animation code that's needed at runtime.
 * This module makes sure all animation providers are properly loaded.
 */
@NgModule({
  imports: [
    CommonModule,
    BrowserAnimationsModule
  ],
  exports: [
    BrowserAnimationsModule
  ]
})
export class AnimationsPolyfillModule { } 