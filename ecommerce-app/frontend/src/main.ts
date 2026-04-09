import { bootstrapApplication } from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import { AppComponent } from './app/app.component';
import { 
  provideRouter, 
  withInMemoryScrolling // Use this instead
} from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './app/core/interceptors/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(
      routes, 
      // This is the correct way to handle scroll restoration in Standalone
      withInMemoryScrolling({ 
        scrollPositionRestoration: 'top' 
      })
    ),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ]
}).catch(err => console.error(err));