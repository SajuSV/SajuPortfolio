// ROOT COMPONENT: the shell around every page (navbar + current page + footer).
import { Component, AfterViewInit, OnDestroy, NgZone, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { initSplashCursor } from './core/lib/splash-cursor';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements AfterViewInit, OnDestroy {
  private readonly zone = inject(NgZone);

  // Function that stops the splash-cursor effect (called when the app is destroyed)
  private stopSplashCursor?: () => void;

  // true on the gallery page. app.component.html uses it to hide the navbar and footer.
  isGallaryPage = false;

  constructor(private router: Router) {
    // Runs after every finished navigation and checks whether we are on the gallery page.
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isGallaryPage = event.urlAfterRedirects === '/projects/gallery';
      });
  }

  // Runs once the page is drawn. The cursor effect is animation-heavy, so it runs
  // "outside Angular" to stop Angular from re-checking the UI on every animation frame.
  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.stopSplashCursor = initSplashCursor();
    });
  }

  ngOnDestroy(): void {
    this.stopSplashCursor?.();
  }
}
