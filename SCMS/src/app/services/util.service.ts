import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {
  constructor() {}

  /**
   * Helper function to safely get a template
   */
  getTemplate<T>(items: T[] | undefined, index: number = 0): T | undefined {
    if (!items || !items.length || index < 0 || index >= items.length) {
      return undefined;
    }
    return items[index];
  }
}

// Standalone export for use without injecting the service
export function getTemplate<T>(items: T[] | undefined, index: number = 0): T | undefined {
  if (!items || !items.length || index < 0 || index >= items.length) {
    return undefined;
  }
  return items[index];
} 