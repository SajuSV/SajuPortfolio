// FOOTER: contact section at the bottom of every page (except the gallery).
// The animation code is shared with other components: see core/lib/page-effects.ts
import { Component, AfterViewInit, OnDestroy, ElementRef, NgZone, ViewEncapsulation, inject, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { PageCursorGridComponent } from '../../shared/page-cursor-grid/page-cursor-grid.component';
import { initEyeTracking, initFadeIn, initTickers } from '../../core/lib/page-effects';

interface PageRouteInfo {
  path: string;
  name: string;
}

const PAGE_FLOW: PageRouteInfo[] = [
  { path: '/', name: 'Home' },
  { path: '/about', name: 'About' },
  { path: '/projects', name: 'Projects' },
  { path: '/projects/webdesign', name: 'Web Design' },
  { path: '/projects/posterdesign', name: 'Poster Design' },
  { path: '/projects/webdev', name: 'Web Development' },
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
  isNextPageOpen = false;

  private isArmed = false;
  private settleTimer?: ReturnType<typeof setTimeout>;
  private progressInterval?: ReturnType<typeof setInterval>;
  private freezeTimeout?: ReturnType<typeof setTimeout>;
  private isNavigating = false;
  private isActivating = false;

  // Every effect gives back a "stop" function; we collect them here and run them on destroy.
  private cleanups: (() => void)[] = [];

  ngAfterViewInit(): void {
    const footer = this.el.nativeElement;
    this.zone.runOutsideAngular(() => {
      this.cleanups.push(initFadeIn(footer));
      this.cleanups.push(initTickers(footer));
      this.cleanups.push(initEyeTracking(footer, '.footer-eyes .eye', 26, 'pointermove'));
      this.initScrollArmingListener();
    });

    const navSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.resetState();
      });
    this.cleanups.push(() => navSub.unsubscribe());
  }

  ngOnDestroy(): void {
    this.resetState();
    this.cleanups.forEach((stop) => stop());
    this.cleanups = [];
  }

  // "Back to top" button (called from footer.component.html)
  backToTop(): void {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  // Triggered by clicking "Keep scrolling ↓"
  triggerNextPage(): void {
    this.activateNextPage();
  }

  private checkAtBottom(): boolean {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    return scrollY + viewportHeight >= docHeight - 35;
  }

  private initScrollArmingListener(): void {
    const onScrollOrWheelMotion = () => {
      const atBottom = this.checkAtBottom();
      if (!atBottom) {
        this.isArmed = false;
        if (this.settleTimer) {
          clearTimeout(this.settleTimer);
          this.settleTimer = undefined;
        }
      } else {
        // While fast scrolling / momentum is running at the bottom, keep resetting the timer.
        // It arms after scrolling motion has settled at the bottom (tuned for touchpads).
        if (!this.isArmed && !this.isActivating && !this.isNavigating) {
          if (this.settleTimer) clearTimeout(this.settleTimer);
          this.settleTimer = setTimeout(() => {
            if (this.checkAtBottom() && !this.isActivating && !this.isNavigating) {
              this.isArmed = true; // Armed! First scroll has stopped at footer end.
            }
          }, 180);
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      // Scrolling upwards disarms
      if (e.deltaY < 0) {
        this.isArmed = false;
        if (this.settleTimer) {
          clearTimeout(this.settleTimer);
          this.settleTimer = undefined;
        }
        return;
      }

      if (e.deltaY <= 0) return;
      if (this.isActivating || this.isNavigating) return;

      // ONLY IF user stopped at bottom and deliberately scrolls again:
      if (this.isArmed && this.checkAtBottom()) {
        this.isArmed = false;
        this.zone.run(() => {
          this.activateNextPage();
        });
        return;
      }

      // Otherwise treat as ongoing motion
      onScrollOrWheelMotion();
    };

    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (this.isActivating || this.isNavigating) return;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartY - touchEndY; // swipe up = scroll down
      if (deltaY > 25 && this.isArmed && this.checkAtBottom()) {
        this.isArmed = false;
        this.zone.run(() => {
          this.activateNextPage();
        });
      }
    };

    window.addEventListener('scroll', onScrollOrWheelMotion, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    this.cleanups.push(() => {
      window.removeEventListener('scroll', onScrollOrWheelMotion);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    });
  }

  activateNextPage(): void {
    if (this.isActivating || this.isNavigating) return;
    this.isActivating = true;
    this.isNextPageOpen = true;

    // Expand the container and smoothly scroll down into it
    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
      });
    }, 40);

    const startTime = Date.now();
    const duration = 650;
    this.zone.runOutsideAngular(() => {
      this.progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(100, Math.round((elapsed / duration) * 100));
        this.zone.run(() => {
          this.progress = pct;
          if (pct >= 100) {
            if (this.progressInterval) {
              clearInterval(this.progressInterval);
              this.progressInterval = undefined;
            }

            // Freeze for a second so user clearly sees and feels entering the next page
            this.freezeTimeout = setTimeout(() => {
              this.navigateToNext();
            }, 800);
          }
        });
      }, 25);
    });
  }

  private resetState(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = undefined;
    }
    if (this.freezeTimeout) {
      clearTimeout(this.freezeTimeout);
      this.freezeTimeout = undefined;
    }
    if (this.settleTimer) {
      clearTimeout(this.settleTimer);
      this.settleTimer = undefined;
    }
    this.progress = 0;
    this.isArmed = false;
    this.isActivating = false;
    this.isNavigating = false;
    this.isNextPageOpen = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  get nextPageName(): string {
    return this.getNextPage().name;
  }

  private navigateToNext(): void {
    if (this.isNavigating) return;
    this.isNavigating = true;
    const target = this.getNextPage().path;
    this.router.navigateByUrl(target).then(() => {
      this.resetState();
    });
  }

  private getNextPage(): PageRouteInfo {
    const raw = this.router.url.split('?')[0].split('#')[0];
    const current = raw.length > 1 ? raw.replace(/\/$/, '') : raw;
    const idx = PAGE_FLOW.findIndex((p) => p.path === current);
    if (idx !== -1) {
      return PAGE_FLOW[(idx + 1) % PAGE_FLOW.length];
    }
    return PAGE_FLOW[0];
  }
}
