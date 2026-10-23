import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, QueryList, ViewChildren, ViewEncapsulation, inject } from '@angular/core';
import { gsap, ScrollTrigger } from '../../../../core/gsap';
import { WorkPanelComponent } from '../work-panel/work-panel.component';
import { WORK_ITEMS } from '../work.data';

/**
 * Work accordion:
 *  - 3 cards gallery with both scroll expand and hover expand effects
 *  - section pins seamlessly on desktop while scrolling progressively expands each card
 *  - instant hover / focus / click opening without altering scroll position
 *  - panels fade in when scrolled into view
 * Attribute component: <div class="acc" id="workAcc" appWorkAccordion></div>
 */
@Component({
  selector: '[appWorkAccordion]',
  standalone: true,
  imports: [WorkPanelComponent],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './work-accordion.component.html',
  styleUrl: './work-accordion.component.css',
})
export class WorkAccordionComponent implements AfterViewInit, OnDestroy {
  readonly items = WORK_ITEMS;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  @ViewChildren(WorkPanelComponent, { read: ElementRef }) private panelRefs!: QueryList<ElementRef<HTMLElement>>;

  private panels: HTMLElement[] = [];
  private activeIndex = 0;
  private lastPointerX = -1;
  private lastPointerY = -1;
  private stInstance: ScrollTrigger | null = null;
  private mm: gsap.MatchMedia | null = null;
  private io: IntersectionObserver | null = null;
  private cleanups: Array<() => void> = [];

  ngAfterViewInit(): void {
    this.panels = this.panelRefs.map((r) => r.nativeElement);
    if (!this.panels.length) return;
    // First card starts open
    this.panels[0].classList.add('is-open');
    this.zone.runOutsideAngular(() => this.init());
  }

  ngOnDestroy(): void {
    this.cleanups.forEach((fn) => fn());
    this.io?.disconnect();
    this.mm?.revert();
    this.stInstance?.kill();
    this.stInstance = null;
    this.mm = null;
  }

  private listen<K extends keyof HTMLElementEventMap>(el: HTMLElement, type: K, fn: (e: HTMLElementEventMap[K]) => void, capture = false): void {
    el.addEventListener(type, fn as EventListener, capture);
    this.cleanups.push(() => el.removeEventListener(type, fn as EventListener, capture));
  }

  private open(panel: number | HTMLElement): void {
    const panels = this.panels;
    const idx = typeof panel === 'number' ? panel : panels.indexOf(panel);
    if (idx < 0 || idx >= panels.length) return;
    const targetPanel = panels[idx];

    if (this.activeIndex === idx && targetPanel.classList.contains('is-open')) return;

    this.activeIndex = idx;
    panels.forEach((p, i) => p.classList.toggle('is-open', i === idx));
  }

  private init(): void {
    const acc = this.host.nativeElement;
    const panels = this.panels;

    // Hover handling on pointer movement
    const onPointerMove = (e: PointerEvent): void => {
      if (e.clientX === this.lastPointerX && e.clientY === this.lastPointerY) return;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;

      const panel = (e.target as HTMLElement).closest('.acc-panel') as HTMLElement | null;
      if (!panel) return;
      const idx = panels.indexOf(panel);
      if (idx !== -1) this.open(idx);
    };

    this.listen(acc, 'pointerenter', onPointerMove);
    this.listen(acc, 'pointermove', onPointerMove);
    this.listen(acc, 'pointerleave', () => {
      this.lastPointerX = -1;
      this.lastPointerY = -1;
    });

    // Panel hover, focus, and click support
    panels.forEach((p, idx) => {
      this.listen(p, 'pointerenter', () => this.open(idx));
      this.listen(p, 'focus', () => this.open(idx));

      // Click: on desktop closed cards open on click; open card links work
      this.listen(
        p,
        'click',
        (e) => {
          const stacked = window.matchMedia('(max-width: 900px)').matches;
          if (!stacked && !p.classList.contains('is-open')) {
            e.preventDefault();
            e.stopPropagation();
            this.open(idx);
            return;
          }
          if (!(e.target as HTMLElement).closest('a')) {
            const link = p.querySelector<HTMLAnchorElement>('.work-go');
            if (link) window.open(link.href, '_blank', 'noopener');
          }
        },
        true,
      );

      this.listen(p, 'keydown', (e) => {
        if (e.key === 'Enter' && e.target === p) {
          const link = p.querySelector<HTMLAnchorElement>('.work-go');
          if (link) window.open(link.href, '_blank', 'noopener');
        }
      });
    });

    // Fade panels in when scrolling into view
    if (!('IntersectionObserver' in window)) {
      acc.classList.add('in-view');
    } else {
      this.io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            acc.classList.add('in-view');
            this.io?.disconnect();
          }
        },
        { threshold: 0.1 },
      );
      this.io.observe(acc);
    }

    // ScrollTrigger pinning & progressive one-by-one panel expansion on scroll
    this.mm = gsap.matchMedia();
    this.mm.add('(min-width: 901px)', () => {
      acc.classList.add('in-view');

      this.stInstance = ScrollTrigger.create({
        id: 'workTrigger',
        trigger: '#work',
        start: 'top top',
        end: '+=1500',
        pin: true,
        anticipatePin: 0,
        invalidateOnRefresh: true,
        onUpdate: (self: ScrollTrigger) => {
          const targetIndex = Math.min(panels.length - 1, Math.floor(self.progress * panels.length));
          if (targetIndex !== this.activeIndex) this.open(targetIndex);
        },
      });

      return () => {
        this.stInstance?.kill();
        this.stInstance = null;
      };
    });
  }
}
