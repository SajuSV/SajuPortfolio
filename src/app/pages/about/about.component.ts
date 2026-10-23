// ABOUT PAGE (/about): a header plus a grid of 7 "tiles".
//
// Everything for this page lives in this folder:
//   about.component.ts    <- this file (logic: page title + fade-in-on-scroll)
//   about.component.html  <- the layout: header and all 7 tiles
//   about.component.css   <- all styles, in labelled sections
//   about.data.ts         <- the lists shown in the tiles (jobs, skills, stats, tools, clients)
import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { PageCursorGridComponent } from '../../shared/page-cursor-grid/page-cursor-grid.component';
import { CounterDirective } from '../../shared/counter/counter.directive';
import { CLIENT_LOGOS, JOBS, SKILLS, STATS, TOOLS } from './about.data';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [PageCursorGridComponent, CounterDirective, RouterLink], // needed because the HTML uses appCursorGrid, appCounter, and routerLink
  encapsulation: ViewEncapsulation.None,
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly title = inject(Title);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);

  // Lists the HTML loops over (the real data is in about.data.ts)
  readonly jobs = JOBS;
  readonly skills = SKILLS;
  readonly stats = STATS;
  readonly tools = TOOLS;
  readonly clientLogos = CLIENT_LOGOS;

  // IntersectionObserver = browser tool that tells us when an element becomes visible
  private observer: IntersectionObserver | null = null;

  // Runs once when the page opens
  ngOnInit(): void {
    this.title.setTitle('About — Saju S V');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // Runs once the HTML exists: set up the "tiles fade up when scrolled into view" effect
  ngAfterViewInit(): void {
    const tiles = Array.from(this.el.nativeElement.querySelectorAll<HTMLElement>('.tile'));

    // Each tile gets a small delay (--d) so they appear one after another: 0, 0.08s, 0.16s, 0.24s, 0, ...
    tiles.forEach((tile, index) => tile.style.setProperty('--d', `${(index % 4) * 0.08}s`));

    // Very old browsers: just show the tiles right away
    if (!('IntersectionObserver' in window)) {
      tiles.forEach((tile) => tile.classList.add('in-view'));
      return;
    }

    // Runs outside Angular so scrolling doesn't trigger needless UI checks
    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view'); // CSS animates tiles that have this class
              this.observer?.unobserve(entry.target); // reveal only once
            }
          });
        },
        { threshold: 0.15 }, // reveal when 15% of the tile is visible
      );
      tiles.forEach((tile) => this.observer!.observe(tile));
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
