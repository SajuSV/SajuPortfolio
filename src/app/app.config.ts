// APP-WIDE SETTINGS: "providers" are services/features available everywhere in the app.
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // Angular checks for UI changes after events (clicks, timers...). "eventCoalescing" groups
    // several events into one check, which is faster.
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Turns on routing (see app.routes.ts) and scrolls to the top on every page change.
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
  ],
};
