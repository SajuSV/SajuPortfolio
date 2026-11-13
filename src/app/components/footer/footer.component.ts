// FOOTER: contact section at the bottom of every page (except the gallery).
// The animation code is shared with other components: see core/lib/page-effects.ts
import { Component, AfterViewInit, OnDestroy, ElementRef, NgZone, ViewEncapsulation, inject, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { PageCursorGridComponent } from '../../shared/page-cursor-grid/page-cursor-grid.component';
import { initEyeTracking, initFadeIn, initTickers } from '../../core/lib/page-effects';

const PAGE_ROUTES = [
  '/',
  '/about',
  '/projects',
  '/projects/webdesign',
  '/projects/posterdesign',
  '/projects/webdev',
  // '/projects/logodesign',
];

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [PageCursorGridComponent],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class FooterComponent implements AfterViewInit, OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly router = inject(Router);

  @ViewChild('nextPageSection') nextPageSection?: ElementRef<HTMLElement>;

  progress = 0;
  private progressInterval?: ReturnType<typeof setInterval>;
  private observer?: IntersectionObserver;
  private isNavigating = false;

  // Every effect gives back a "stop" function; we collect them here and run them on destroy.
  private cleanups: (() => void)[] = [];

  // Runs once the footer HTML exists. Animations run outside Angular so they don't slow it down.
  ngAfterViewInit(): void {
    const footer = this.el.nativeElement;
    this.zone.runOutsideAngular(() => {
      this.cleanups.push(initFadeIn(footer));
      this.cleanups.push(initTickers(footer));
      this.cleanups.push(initEyeTracking(footer, '.footer-eyes .eye', 26, 'pointermove'));
    });

    if (this.nextPageSection?.nativeElement) {
      this.observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting && !this.isNavigating) {
            this.startProgress();
          } else if (!entry.isIntersecting && !this.isNavigating) {
            this.stopProgress();
          }
        },
        { threshold: 0.2 }
      );
      this.observer.observe(this.nextPageSection.nativeElement);
    }

    const navSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.stopProgress();
        this.isNavigating = false;
        this.progress = 0;
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
    this.cleanups.push(() => navSub.unsubscribe());
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.stopProgress();
    this.cleanups.forEach((stop) => stop());
    this.cleanups = [];
  }

  // "Back to top" button (called from footer.component.html)
  backToTop(): void {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  triggerNextPage(): void {
    if (this.nextPageSection?.nativeElement) {
      this.nextPageSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  private startProgress(): void {
    if (this.progressInterval || this.isNavigating) return;
    const startTime = Date.now();
    const duration = 750;
    this.zone.runOutsideAngular(() => {
      this.progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(100, Math.round((elapsed / duration) * 100));
        this.zone.run(() => {
          this.progress = pct;
          if (pct >= 100) {
            this.stopProgress();
            this.navigateToNext();
          }
        });
      }, 25);
    });
  }

  private stopProgress(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = undefined;
    }
    if (!this.isNavigating) {
      this.progress = 0;
    }
  }

  private navigateToNext(): void {
    if (this.isNavigating) return;
    this.isNavigating = true;
    const target = this.getNextRoute();
    this.router.navigateByUrl(target).then(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      this.isNavigating = false;
      this.progress = 0;
    });
  }

  private getNextRoute(): string {
    const raw = this.router.url.split('?')[0].split('#')[0];
    const current = raw.length > 1 ? raw.replace(/\/$/, '') : raw;
    const idx = PAGE_ROUTES.indexOf(current);
    if (idx !== -1) {
      return PAGE_ROUTES[(idx + 1) % PAGE_ROUTES.length];
    }
    return '/';
  }
}
