import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  inject,
} from '@angular/core';

/**
 * Animated number counter directive.
 * Usage:
 *   <strong [appCounter]="s.value">{{ s.value }}</strong>
 *   <strong appCounter>{{ s.value }}</strong>
 *   <strong [appCounter]="100" [duration]="1400" [delay]="100">+</strong>
 *
 * Automatically parses numeric values, prefixes, suffixes (e.g. "2+", "10+", "$50k", "99%"),
 * respects prefers-reduced-motion, and triggers via IntersectionObserver when scrolled into view.
 */
@Directive({
  selector: '[appCounter], [appCountUp]',
  standalone: true,
})
export class CounterDirective implements AfterViewInit, OnChanges, OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);

  @Input('appCounter') target?: string | number;
  @Input('appCountUp') targetAlias?: string | number;
  @Input() duration = 1400; // Animation duration in milliseconds
  @Input() delay = 0; // Delay before animation starts (ms)
  @Input() once = true; // Animate only once when entering viewport

  private observer: IntersectionObserver | null = null;
  private rafId: number | null = null;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private hasAnimated = false;
  private isViewInitialized = false;

  ngAfterViewInit(): void {
    this.isViewInitialized = true;
    this.initCounter();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isViewInitialized && (changes['target'] || changes['targetAlias'])) {
      this.initCounter();
    }
  }

  private getRawValue(): string {
    if (this.target !== undefined && this.target !== null && this.target !== '') {
      return String(this.target);
    }
    if (this.targetAlias !== undefined && this.targetAlias !== null && this.targetAlias !== '') {
      return String(this.targetAlias);
    }
    return this.el.nativeElement.textContent?.trim() || '';
  }

  private parseValue(raw: string): {
    prefix: string;
    value: number;
    suffix: string;
    decimals: number;
    hasComma: boolean;
  } | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;

    // Matches optional prefix, numbers (with optional commas/decimals), and optional suffix
    const match = trimmed.match(/^([^\d.-]*)([-+]?[0-9,]*\.?[0-9]+)(.*)$/);
    if (!match) return null;

    const prefix = match[1] || '';
    const numPart = match[2] || '';
    const suffix = match[3] || '';

    const hasComma = numPart.includes(',');
    const sanitized = numPart.replace(/,/g, '');
    const value = parseFloat(sanitized);

    if (isNaN(value)) return null;

    const decimals = sanitized.includes('.') ? sanitized.split('.')[1].length : 0;

    return { prefix, value, suffix, decimals, hasComma };
  }

  private initCounter(): void {
    this.cleanup();

    const raw = this.getRawValue();
    const parsed = this.parseValue(raw);

    if (!parsed) {
      return;
    }

    const { prefix, value, suffix, decimals, hasComma } = parsed;

    // Accessibility: immediately display target value if reduced motion is preferred
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      this.setText(prefix, value, suffix, decimals, hasComma);
      return;
    }

    // Set initial display to 0 before scroll into view
    this.setText(prefix, 0, suffix, decimals, hasComma);

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      this.runAnimation(prefix, 0, value, suffix, decimals, hasComma);
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (this.once) {
                this.observer?.disconnect();
                this.observer = null;
              }
              if (!this.hasAnimated || !this.once) {
                this.hasAnimated = true;
                this.runAnimation(prefix, 0, value, suffix, decimals, hasComma);
              }
            } else if (!this.once) {
              this.setText(prefix, 0, suffix, decimals, hasComma);
              this.hasAnimated = false;
            }
          });
        },
        { threshold: 0.15 }
      );

      this.observer.observe(this.el.nativeElement);
    });
  }

  private runAnimation(
    prefix: string,
    start: number,
    target: number,
    suffix: string,
    decimals: number,
    hasComma: boolean
  ): void {
    this.cleanupAnimation();

    this.zone.runOutsideAngular(() => {
      const startLoop = () => {
        const startTime = performance.now();

        const tick = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / Math.max(this.duration, 1), 1);

          // Smooth quadratic ease-out (natural deceleration)
          const eased = 1 - Math.pow(1 - progress, 2);
          const current = start + (target - start) * eased;

          this.setText(prefix, current, suffix, decimals, hasComma);

          if (progress < 1) {
            this.rafId = requestAnimationFrame(tick);
          } else {
            this.setText(prefix, target, suffix, decimals, hasComma);
            this.rafId = null;
          }
        };

        this.rafId = requestAnimationFrame(tick);
      };

      if (this.delay > 0) {
        this.timeoutId = setTimeout(startLoop, this.delay);
      } else {
        startLoop();
      }
    });
  }

  private setText(
    prefix: string,
    val: number,
    suffix: string,
    decimals: number,
    hasComma: boolean
  ): void {
    let numStr: string;
    if (decimals > 0) {
      numStr = val.toFixed(decimals);
    } else {
      numStr = Math.round(val).toString();
    }

    if (hasComma) {
      const parts = numStr.split('.');
      parts[0] = Number(parts[0]).toLocaleString('en-US');
      numStr = parts.join('.');
    }

    this.el.nativeElement.textContent = `${prefix}${numStr}${suffix}`;
  }

  private cleanupAnimation(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private cleanup(): void {
    this.cleanupAnimation();
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }
}

