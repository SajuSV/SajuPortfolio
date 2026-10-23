// CURSOR GRID: a canvas whose grid cells light up around the mouse.
// Add it to any element:  <div class="section-cursor-grid" appCursorGrid></div>
// The drawing code lives in core/lib/cursor-grid.ts.
import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewEncapsulation, inject } from '@angular/core';
import { PAGE_CURSOR_GRID_OPTIONS, initCursorGrid } from '../../core/lib/cursor-grid';

@Component({
  selector: '[appPageCursorGrid], [appCursorGrid]',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  template: '',
  styleUrl: './page-cursor-grid.component.css',
})
export class PageCursorGridComponent implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef); // the element this is attached to
  private readonly zone = inject(NgZone);
  private stopGrid?: () => void;

  // Start drawing once the element exists. It runs outside Angular for smooth animation.
  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.stopGrid = initCursorGrid(this.host.nativeElement, PAGE_CURSOR_GRID_OPTIONS);
    });
  }

  // Clean up when the component is removed
  ngOnDestroy(): void {
    this.stopGrid?.();
  }
}
