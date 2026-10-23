import { Injectable, NgZone, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ScrollTrigger } from '../gsap';

/** Which nav link the home page scroll position corresponds to. */
export type NavSection = 'home' | 'work' | 'tools' | null;

/**
 * Butter-smooth momentum scroll for the Home page, with zero secondary jumps or delayed snapping.
 * (was js/section-scroll.js and the `window.__momentumScroll` global it exposed)
 *
 * - wheel input is turned into an eased glide (lerp)
 * - ↑ ↓ PageUp PageDown Space Home End step through checkpoints (hero → intro → each work card → tools → contact)
 * - in-page anchors (`#work`, `#hero`, `[data-top]`) glide instead of jumping
 * - publishes which section is under the viewport through `activeNav$` (the nav listens to it)
 *
 * Only the Home page calls start()/destroy().
 */
@Injectable({ providedIn: 'root' })
export class MomentumScrollService {
  private readonly zone = inject(NgZone);

  /** Replaces the original `.nav-links a.active` DOM toggling. */
  readonly activeNav$ = new BehaviorSubject<NavSection>('home');

  private sections: HTMLElement[] = [];
  private currentY = 0;
  private targetY = 0;
  private isRunning = false;
  private rafId: number | null = null;
  private lastWheelTime = 0;
  private started = false;

  // Smooth inertia lerp factor (0.095 = silky, responsive, weightless feel)
  private readonly LERP_EASE = 0.095;

  get active(): boolean {
    return this.started;
  }

  // ───────────────────────── public API (was window.__momentumScroll) ─────────────────────────

  isScrolling(): boolean {
    return this.isRunning || Date.now() - this.lastWheelTime < 350;
  }

  syncPosition(y: number): void {
    this.targetY = Math.max(0, Math.min(this.getMaxScroll(), y));
    this.currentY = this.targetY;
    this.isRunning = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    window.scrollTo(0, this.targetY);
    ScrollTrigger.update();
    this.updateNavActive(this.targetY);
  }

  glideTo(y: number): void {
    this.targetY = Math.max(0, Math.min(this.getMaxScroll(), y));
    this.startLoop();
  }

  /** Jump (no animation) to a section id such as `work` / `playground` — used when arriving with `/#work`. */
  jumpToFragment(fragment: string): void {
    if (!fragment || fragment === 'hero') {
      this.syncPosition(0);
      return;
    }
    const el = document.getElementById(fragment);
    if (el) this.syncPosition(this.getSectionTop(el));
  }

  // ───────────────────────── lifecycle ─────────────────────────

  start(): void {
    if (this.started) return;
    this.sections = Array.from(document.querySelectorAll<HTMLElement>('#hero, #intro, #work, #combined-section, #contact'));
    if (!this.sections.length) return;
    this.started = true;
    this.currentY = window.scrollY;
    this.targetY = window.scrollY;

    this.zone.runOutsideAngular(() => {
      window.addEventListener('resize', this.onResize);
      window.addEventListener('scroll', this.onScroll, { passive: true });
    });
    this.updateNavActive(window.scrollY);
  }

  destroy(): void {
    if (!this.started) return;
    this.started = false;
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('scroll', this.onScroll);
    this.isRunning = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.sections = [];
    this.activeNav$.next('home');
  }

  // ───────────────────────── internals ─────────────────────────

  private getMaxScroll(): number {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  private getSectionTop(el: HTMLElement | null): number {
    if (!el) return 0;
    if (el.id === 'work') {
      const st = ScrollTrigger.getById('workTrigger');
      if (st) return st.start;
    }
    if (el.id === 'combined-section' || el.id === 'playground') {
      const st = ScrollTrigger.getById('toolsTrigger') || ScrollTrigger.getById('toolsTriggerMobile');
      if (st) return st.start;
    }
    const pinSpacer = el.closest ? el.closest('.pin-spacer') : null;
    if (pinSpacer) {
      const rect = pinSpacer.getBoundingClientRect();
      return rect.top + window.scrollY;
    }
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const h = el.offsetHeight;
    if (el.id === 'intro' && h > window.innerHeight) {
      return Math.max(0, top + (h - window.innerHeight) / 2);
    }
    return top;
  }

  private getCheckpoints(): number[] {
    const stops: number[] = [];

    // 1. Hero
    stops.push(0);

    // 2. Intro
    const intro = document.getElementById('intro');
    if (intro) {
      stops.push(this.getSectionTop(intro));
    }

    // 3. Work Section (3 cards progressive expansion)
    const workST = ScrollTrigger.getById('workTrigger') || null;
    const workSec = document.getElementById('work');
    if (workST) {
      const wStart = workST.start;
      const wSpan = workST.end - workST.start;
      stops.push(wStart); // Card 0 (Web Design)
      stops.push(wStart + wSpan * 0.40); // Card 1 (Poster Design)
      stops.push(wStart + wSpan * 0.75); // Card 2 (Web Development)
    } else if (workSec) {
      stops.push(this.getSectionTop(workSec));
    }

    // 4. Tools & Skills Showcase (Expands, stops, then moves down)
    const toolsST = ScrollTrigger.getById('toolsTrigger') || ScrollTrigger.getById('toolsTriggerMobile') || null;
    const toolsSec = document.getElementById('combined-section');
    if (toolsST) {
      const tStart = toolsST.start;
      const tSpan = toolsST.end - toolsST.start;
      stops.push(tStart); // Tools Start (clustered)
      stops.push(tStart + tSpan * 0.6); // Tools Expanded & Stopped
    } else if (toolsSec) {
      stops.push(this.getSectionTop(toolsSec));
    }

    // 5. Contact Section
    const contact = document.getElementById('contact');
    if (contact) {
      stops.push(this.getSectionTop(contact));
    }

    const maxScroll = this.getMaxScroll();
    const sorted = stops
      .filter((y) => !isNaN(y) && y >= 0)
      .map((y) => Math.round(Math.min(maxScroll, y)))
      .sort((a, b) => a - b);

    const unique: number[] = [];
    for (const s of sorted) {
      if (!unique.length || s - unique[unique.length - 1] > 20) {
        unique.push(s);
      }
    }

    return unique;
  }

  private getClosestSection(y: number): HTMLElement {
    let closest = this.sections[0];
    let minDiff = Infinity;
    for (const sec of this.sections) {
      const pinSpacer = sec.closest ? sec.closest('.pin-spacer') : null;
      const target = (pinSpacer as HTMLElement | null) || sec;
      const top = target.getBoundingClientRect().top + window.scrollY;
      const height = target.offsetHeight;

      // If inside section scroll bounds (accounting for pin duration)
      if (y >= top - 80 && y < top + height - 80) {
        return sec;
      }
      const diff = Math.abs(top - y);
      if (diff < minDiff) {
        minDiff = diff;
        closest = sec;
      }
    }
    return closest;
  }

  private updateNavActive(y: number): void {
    if (!this.sections.length) return;
    const closest = this.getClosestSection(y);
    let next: NavSection = null;
    if (closest.id === 'hero' || closest.id === 'intro') next = 'home';
    else if (closest.id === 'work') next = 'work';
    else if (closest.id === 'playground' || closest.id === 'combined-section') next = 'tools';
    if (this.activeNav$.value !== next) this.activeNav$.next(next);
  }

  private readonly animationLoop = (): void => {
    if (!this.isRunning) return;

    const maxScroll = this.getMaxScroll();
    this.targetY = Math.max(0, Math.min(maxScroll, this.targetY));

    const diff = this.targetY - this.currentY;

    if (Math.abs(diff) > 0.3) {
      this.currentY += diff * this.LERP_EASE;
      window.scrollTo(0, this.currentY);
      ScrollTrigger.update();
      this.updateNavActive(this.currentY);
      this.rafId = requestAnimationFrame(this.animationLoop);
    } else {
      this.currentY = this.targetY;
      window.scrollTo(0, this.currentY);
      ScrollTrigger.update();
      this.updateNavActive(this.currentY);
      this.isRunning = false;
      this.rafId = null;
    }
  };

  private startLoop(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.currentY = window.scrollY;
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = requestAnimationFrame(this.animationLoop);
    }
  }

  private readonly onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    this.lastWheelTime = Date.now();

    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 30;
    if (e.deltaMode === 2) delta *= window.innerHeight;

    // Smooth momentum accumulation
    this.targetY = Math.max(0, Math.min(this.getMaxScroll(), this.targetY + delta * 1.05));
    this.startLoop();
  };

  // Keyboard navigation: step through work cards one by one and tools expansion
  private readonly onKeyDown = (e: KeyboardEvent): void => {
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      const stops = this.getCheckpoints();
      const nextStop = stops.find((s) => s > this.targetY + 25);
      if (nextStop !== undefined) {
        this.glideTo(nextStop);
      } else {
        this.glideTo(this.getMaxScroll());
      }
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      const stops = this.getCheckpoints();
      const prevStops = stops.filter((s) => s < this.targetY - 25);
      if (prevStops.length > 0) {
        this.glideTo(prevStops[prevStops.length - 1]);
      } else {
        this.glideTo(0);
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      this.glideTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      this.glideTo(this.getMaxScroll());
    }
  };

  // Anchor clicks
  private readonly onClick = (e: MouseEvent): void => {
    const anchor = (e.target as HTMLElement | null)?.closest?.('a[href^="#"], [data-top]') as HTMLElement | null;
    if (!anchor) return;

    const href = anchor.getAttribute('href') || '';
    const isDataTop = anchor.hasAttribute('data-top') || anchor.classList.contains('footer-top');

    if (isDataTop || href === '#' || href === '#hero') {
      e.preventDefault();
      this.glideTo(0);
      return;
    }

    const hash = href.includes('#') ? '#' + href.split('#')[1] : null;
    if (hash) {
      const targetEl = document.querySelector<HTMLElement>(hash);
      if (targetEl) {
        e.preventDefault();
        this.glideTo(this.getSectionTop(targetEl));
      }
    }
  };

  // Sync on resize or programmatic scroll
  private readonly onResize = (): void => {
    this.currentY = window.scrollY;
    this.targetY = window.scrollY;
    this.updateNavActive(this.currentY);
  };

  private readonly onScroll = (): void => {
    if (!this.isRunning) {
      this.currentY = window.scrollY;
      this.targetY = window.scrollY;
      this.updateNavActive(this.currentY);
    }
  };
}
