// 404 PAGE: shown for any URL that matches no route (the "**" route in app.routes.ts).
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink], // needed because the HTML uses routerLink
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css',
})
export class NotFoundComponent {}
