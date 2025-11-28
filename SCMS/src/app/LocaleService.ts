import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocaleService {
  private localeSubject = new BehaviorSubject<string>(this.loadInitialLocale());
  locale$ = this.localeSubject.asObservable();

  private loadInitialLocale(): string {
    return localStorage.getItem('userLang') || 'en';
  }

  setLocale(locale: string) {
    localStorage.setItem('userLang', locale);
    this.localeSubject.next(locale);
  }

  getLocale(): string {
    return this.localeSubject.getValue();
  }
}
