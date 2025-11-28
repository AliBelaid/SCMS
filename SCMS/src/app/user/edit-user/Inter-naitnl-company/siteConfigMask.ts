import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appUserConfigMask]'
})
export class UserConfigMaskDirective {
  @Input() appUserConfigMask: string; // Input mask

  constructor(private el: ElementRef) {}

  // @HostListener('input', ['$event'])
  // onInput(event: any): void {
  //   const input = event.target;
  //   const value = input.value;
  //   const formattedValue = this.formatInput(value);
  //   input.value = formattedValue;
  // }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Remove non-digit characters
    value = value.replace(/\D/g, '');

    // Ensure only up to three digits
    value = value.substr(0, 3);

    // Format as "S_/_/_" with separators
    if (value.length > 0) {
      const formattedValue = `S${value.charAt(0)}${value.charAt(1) ? `/${value.charAt(1)}` : ''}${value.charAt(2) ? `/${value.charAt(2)}` : ''}`;
      input.value = formattedValue;
    } else {
      input.value = '';
    }
  }

private formatInput(value: string): string {
    // Remove non-digit characters
    value = value.replace(/\D/g, '');

    // Ensure only up to three digits
    value = value.substr(0, 3);

    // Apply the "S_/_/_" format
    if (value.length >= 1) {
      value = 'S' + value[0];
      if (value.length >= 2) {
        value += '/' + value[1];
        if (value.length >= 3) {
          value += '/' + value[2];
        }
      }
    }

    return value;
  }
}
