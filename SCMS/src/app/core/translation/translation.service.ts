import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLang = new BehaviorSubject<string>('ar');

  constructor(private translateService: TranslateService) {
    // Initialize with Arabic
    this.translateService.setDefaultLang('ar');
    this.translateService.use('ar');
    
    // Load translations
    this.translateService.get('TREASURY').subscribe(() => {
      console.log('Translations loaded successfully');
    }, error => {
      console.error('Error loading translations:', error);
    });
  }

  setLanguage(lang: string) {
    this.translateService.use(lang);
    this.currentLang.next(lang);
  }

  getCurrentLang(): Observable<string> {
    return this.currentLang.asObservable();
  }

  getTranslation(key: string): Observable<string> {
    return this.translateService.get(key);
  }

  instant(key: string): string {
    return this.translateService.instant(key);
  }
} 