import { ApplicationConfig } from '@angular/core';
import { provideRouter, withRouterConfig, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes,
    withRouterConfig({ onSameUrlNavigation: 'reload' }),
    withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }))
  ]
};
