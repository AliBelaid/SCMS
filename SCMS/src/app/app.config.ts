import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { appRoutes } from './app.routes';
import { provideAnimations, NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { PreloadingStrategy, provideRouter, withInMemoryScrolling } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatNativeDateModule } from '@angular/material/core';
import { provideIcons } from './core/icons/icons.provider';
import { provideLuxon } from './core/luxon/luxon.provider';
import { provideVex } from '@vex/vex.provider';
import { provideNavigation } from './core/navigation/navigation.provider';
import { vexConfigs } from '@vex/config/vex-configs';
import { provideQuillConfig } from 'ngx-quill';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ToastrModule } from 'ngx-toastr';
import { registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar';
import localeEnExtra from '@angular/common/locales/extra/en';
import localeArExtra from '@angular/common/locales/extra/ar';
import { AnimationsPolyfillModule } from './core/animations-polyfill.module';

import localeEn from '@angular/common/locales/en';
import { LocaleService } from './LocaleService';
import { TokenceptorService } from 'src/assets/services/tokenceptor.service';
import { LoadingInterceptor } from './loading.interceptors';
import { ErrorInterceptor } from './ErrorInterceptor';
import { UserService } from './user/user.service';
import { take, firstValueFrom } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
 

// Custom TranslateLoader to support multiple files
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}  

registerLocaleData(localeEn, 'en', localeEnExtra);
registerLocaleData(localeAr, 'ar', localeArExtra);

export function appInitializerFactory(localeService: LocaleService) {
  return () => {
    const locale = localeService.getLocale();
    localeService.setLocale(locale); // Initialize with the stored locale
  };
}

// Initialize user data on app startup to ensure roles are available
export function userInitializerFactory(userService: UserService) {
  return () => {
    // First try to initialize from storage (synchronous)
    // This happens in the constructor now

    // Then try to load from the API (asynchronous)
    return firstValueFrom(userService.loadCurrentUser());
  };
}

// Initialize translations
export function initializeTranslations(translateService: TranslateService) {
  return () => {
    translateService.setDefaultLang('ar');
    translateService.use('ar');
    // Load translations properly
    return translateService.get('WELCOME_TO_HEMS').toPromise().catch(() => Promise.resolve());
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      BrowserModule,
      MatDialogModule,
      MatBottomSheetModule,
      MatNativeDateModule,
      AnimationsPolyfillModule,
      TranslateModule.forRoot({
        defaultLanguage: 'ar',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        },
        useDefaultLang: true
      }),
ToastrModule.forRoot({
  timeOut: 3000,
  positionClass: 'toast-top-right',
  preventDuplicates: true,
}),
    ),
    provideRouter(
      appRoutes,
      // TODO: Add preloading withPreloading(),
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled'
      })
    ),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),

    provideVex({
      /**
       * The config that will be used by default.
       * This can be changed at runtime via the config panel or using the VexConfigService.
       */
      config: vexConfigs.poseidon,
      /**
       * Only themes that are available in the config in tailwind.config.ts should be listed here.
       * Any theme not listed here will not be available in the config panel.
       */
      availableThemes: [
        {
          name: 'Default',
          className: 'vex-theme-default'
        },
        {
          name: 'Teal',
          className: 'vex-theme-teal'
        },
        {
          name: 'Green',
          className: 'vex-theme-green'
        },
        {
          name: 'Purple',
          className: 'vex-theme-purple'
        },
        {
          name: 'Red',
          className: 'vex-theme-red'
        },
        {
          name: 'Orange',
          className: 'vex-theme-orange'
        }
      ]
    }),
    provideNavigation(),
    provideIcons(),
    provideLuxon(),
    provideQuillConfig({
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ['clean'],
          ['link', 'image']
        ]
      }
    }),
    
    { 
      provide: HTTP_INTERCEPTORS,
      useClass: TokenceptorService,
      multi: true
    },
    { 
      provide: HTTP_INTERCEPTORS, 
      useClass: LoadingInterceptor, 
      multi: true 
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    //  { provide: PreloadingStrategy, useClass: QuicklinkStrategy },

    // Services
    LocaleService,
 
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [LocaleService],
      multi: true
    },
    // Add new APP_INITIALIZER for UserService to load user on startup
    {
      provide: APP_INITIALIZER,
      useFactory: userInitializerFactory,
      deps: [UserService],
      multi: true
    },
    // Add APP_INITIALIZER for translations
    {
      provide: APP_INITIALIZER,
      useFactory: initializeTranslations,
      deps: [TranslateService],
      multi: true
    },
    {
      provide: LOCALE_ID,
      useFactory: (localeService: LocaleService) => localeService.getLocale(),
      deps: [LocaleService]
    }
  ],
};
