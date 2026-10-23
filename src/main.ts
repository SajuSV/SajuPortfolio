// ENTRY POINT: the browser starts here.
// "bootstrapApplication" starts Angular and shows AppComponent (<app-root> in index.html).
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
