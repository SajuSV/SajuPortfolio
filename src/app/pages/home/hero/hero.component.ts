// HERO: the big first screen of the home page.
// Two effects: "rub to reveal" (rub the screen with the mouse to uncover a picture)
// and cartoon eyes that follow the mouse.
import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { initRubReveal } from './rub-reveal';
import { initEyeTracking } from '../../../core/lib/page-effects';
import { PageCursorGridComponent } from '../../../shared/page-cursor-grid/page-cursor-grid.component';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [PageCursorGridComponent, RouterLink],
  encapsulation: ViewEncapsulation.None,
  host: { style: 'display: contents' },
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  private readonly zone = inject(NgZone);

  // @ViewChild finds an element in the HTML by its template reference (#hero, #rubDots)
  @ViewChild('hero', { static: true }) private hero!: ElementRef<HTMLElement>;
  @ViewChild('rubDots', { static: true }) private rubDots!: ElementRef<SVGGElement>;

  // "Stop" functions for the effects, called in ngOnDestroy
  private stopRub?: () => void;
  private stopEyes?: () => void;

  ngAfterViewInit(): void {
    const heroEl = this.hero.nativeElement;
    const hint = heroEl.querySelector<HTMLElement>('#cursorHint');

    // CSS uses this class on <body> to style the page while rubbing is possible
    document.body.classList.add('hero-rub-active');

    this.zone.runOutsideAngular(() => {
      this.stopRub = initRubReveal(heroEl, this.rubDots.nativeElement, hint);
      this.stopEyes = initEyeTracking(heroEl, '.eye', 28, 'mousemove');
    });
  }

  ngOnDestroy(): void {
    document.body.classList.remove('hero-rub-active', 'hero-revealed');
    this.stopRub?.();
    this.stopEyes?.();
  }
}
