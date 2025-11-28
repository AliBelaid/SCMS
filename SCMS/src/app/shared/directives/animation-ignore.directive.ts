import { Directive, ElementRef, Input, OnInit } from '@angular/core';

/**
 * This directive can be used to ignore Angular animation binding errors
 * It allows both syntax types (@animation or [@animation]) to work
 * 
 * Usage: Add this directive to components that have animation errors:
 * <table animationIgnore @stagger [dataSource]="dataSource">
 */
@Directive({
  selector: '[animationIgnore]',
  standalone: true
})
export class AnimationIgnoreDirective implements OnInit {
  @Input() animationIgnore: string = '';

  constructor(private el: ElementRef) {}

  ngOnInit() {
    // This is just a placeholder directive to allow both animation syntaxes
    // It doesn't need to do anything as it just prevents Angular's parser error
  }
} 