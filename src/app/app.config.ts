import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http'; // 1. Importamos el módulo HTTP
import { authInterceptor } from './auth.interceptor';
import { withInterceptors } from '@angular/common/http';


// 🔥 1. Importar las herramientas de idioma de Angular
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';

// 🔥 2. Registrar el idioma español en el sistema
registerLocaleData(localeEs, 'es');

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])), // 2. Lo inyectamos aquí
    { provide: LOCALE_ID, useValue: 'es' }
  ]
};