// HOME PAGE: hero + work section + about/skills sections.
// The HTML is in home.component.html. This class only adds the animations:
//   - fade in on scroll, scrolling tickers (shared code in core/lib/page-effects.ts)
//   - card tilt (flattens project thumbnails on scroll)
//   - typing text (cycles through job titles in the hero)
import { Component, AfterViewInit, OnDestroy, ElementRef, NgZone, ViewEncapsulation, inject } from '@angular/core';
import { HeroComponent } from './hero/hero.component';
import { WorkComponent } from './work/work.component';
import { PageCursorGridComponent } from '../../shared/page-cursor-grid/page-cursor-grid.component';
import { initFadeIn, initTickers } from '../../core/lib/page-effects';

@Component({
  selector: 'app-home',
  imports: [HeroComponent, WorkComponent, PageCursorGridComponent],
  templateUrl: './home.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);

  // Everything started in ngAfterViewInit is stopped here when the page is left
  private cleanups: (() => void)[] = [];

  ngAfterViewInit(): void {
    const page = this.el.nativeElement;
    // Animations run outside Angular so they don't trigger needless UI checks
    this.zone.runOutsideAngular(() => {
      this.cleanups.push(initFadeIn(page));
      this.cleanups.push(initTickers(page));
      this.cleanups.push(this.initCardTilt(page));
      this.cleanups.push(this.initTypingRoles(page));
    });
  }

  ngOnDestroy(): void {
    this.cleanups.forEach((stop) => stop());
    this.cleanups = [];
  }

  /** Project thumbnails start tilted; when 40% visible they get "card-tilt-flat" (flat). */
  private initCardTilt(page: HTMLElement): () => void {
    const cards = Array.from(page.querySelectorAll<HTMLElement>('.card-tilt-tilted'));
    if (!cards.length) return () => {};

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('card-tilt-flat', entry.isIntersecting);
        });
      },
      { threshold: 0.4 },
    );
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }

  /**
   * Typing effect. In the HTML: <span data-typing-roles="UI Designer|Developer"> ... </span>
   * It types a role letter by letter, waits, deletes it, then types the next role.
   */
  private initTypingRoles(page: HTMLElement): () => void {
    const containers = Array.from(page.querySelectorAll<HTMLElement>('[data-typing-roles]'));
    if (!containers.length) return () => {};

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Respect users who asked their device to reduce animations
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Speeds in milliseconds
    const TYPE_MS = 70;
    const DELETE_MS = 40;
    const PAUSE_AFTER_TYPE_MS = 1400;
    const PAUSE_AFTER_DELETE_MS = 300;

    containers.forEach((container) => {
      // "A|B|C" -> ['A', 'B', 'C']
      const roles = (container.dataset['typingRoles'] || '')
        .split('|')
        .map((role) => role.trim())
        .filter(Boolean);
      const textEl = container.querySelector<HTMLElement>('.typing-role-text');
      if (!roles.length || !textEl) return;

      if (reduceMotion) {
        textEl.textContent = roles[0]; // no animation: just show the first role
        return;
      }

      let roleIndex = 0; // which role we are on
      let charCount = 0; // how many letters are visible
      let deleting = false;

      // One "frame" of typing; schedules the next frame itself
      const tick = (): void => {
        const role = roles[roleIndex];
        let nextDelay: number;

        if (!deleting) {
          charCount++;
          textEl.textContent = role.slice(0, charCount);
          if (charCount === role.length) {
            deleting = true; // fully typed: pause, then start deleting
            nextDelay = PAUSE_AFTER_TYPE_MS;
          } else {
            nextDelay = TYPE_MS;
          }
        } else {
          charCount--;
          textEl.textContent = role.slice(0, charCount);
          if (charCount === 0) {
            deleting = false; // fully deleted: move on to the next role
            roleIndex = (roleIndex + 1) % roles.length;
            nextDelay = PAUSE_AFTER_DELETE_MS;
          } else {
            nextDelay = DELETE_MS;
          }
        }
        timers.push(setTimeout(tick, nextDelay));
      };

      tick();
    });

    return () => timers.forEach((t) => clearTimeout(t));
  }
}
