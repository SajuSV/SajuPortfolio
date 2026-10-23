// FOOTER: contact section at the bottom of every page (except the gallery).
// The animation code is shared with other components: see core/lib/page-effects.ts
import { Component, AfterViewInit, OnDestroy, ElementRef, NgZone, ViewEncapsulation, inject } from '@angular/core';
import { PageCursorGridComponent } from '../../shared/page-cursor-grid/page-cursor-grid.component';
import { initEyeTracking, initFadeIn, initTickers } from '../../core/lib/page-effects';

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
  }

  ngOnDestroy(): void {
    this.cleanups.forEach((stop) => stop());
    this.cleanups = [];
  }

  // "Back to top" button (called from footer.component.html)
  backToTop(): void {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
}
