// PROJECT PAGE: ONE component that shows ANY of the 4 project pages
// (webdesign, webdev, logodesign, posterdesign).
//
// Everything for this page lives in this folder:
//   project.component.ts    <- this file (the logic)
//   project.component.html  <- the layout: hero, carousel, "more work" links, lightbox
//   project.component.css   <- all the styles for the page
//   project.data.ts         <- the TEXT and IMAGES of each project (edit content here)
//
// How it works:
//   1. The route (app.routes.ts) passes a "slug" such as 'logodesign'.
//   2. We look that slug up in PROJECTS (project.data.ts) to get the page content.
//   3. project.component.html draws it.
import { Component, HostListener, OnInit, OnDestroy, ViewEncapsulation, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { PageCursorGridComponent } from '../../shared/page-cursor-grid/page-cursor-grid.component';
import { ColumnsCarousel, PROJECTS, ProjectData, StripCarousel } from './project.data';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [RouterLink, PageCursorGridComponent],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css'],
})
export class ProjectComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute); // gives access to the current route
  private readonly meta = inject(Meta); // sets <meta> tags (page description)
  private readonly title = inject(Title); // sets the browser tab title
  private sub?: Subscription;

  // ---------- The project being shown (the HTML reads this) ----------
  project: ProjectData = PROJECTS[0];

  // The carousel is EITHER "columns" OR "strip". These two getters give the HTML the one
  // that matches the current project (the other one is null, so it is not drawn).
  get columnsCarousel(): ColumnsCarousel | null {
    return this.project.carousel.kind === 'columns' ? this.project.carousel : null;
  }
  get stripCarousel(): StripCarousel | null {
    return this.project.carousel.kind === 'strip' ? this.project.carousel : null;
  }

  // ---------- Lightbox (click an image to see it large) ----------
  lightboxSrc: string | null = null; // the image being shown; null = popup closed

  openLightbox(src: string): void {
    this.lightboxSrc = src;
  }

  closeLightbox(): void {
    this.lightboxSrc = null;
  }

  // Pressing Esc anywhere closes the popup
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeLightbox();
  }

  // ---------- Broken images ----------
  // Images that failed to load are remembered here and hidden by the HTML,
  // so visitors never see broken-image icons.
  failedImages = new Set<string>();

  markFailed(key: string): void {
    this.failedImages.add(key);
  }

  // ---------- Page start / end ----------
  ngOnInit(): void {
    // `route.data` emits whenever the route changes (e.g. webdesign -> logodesign)
    this.sub = this.route.data.subscribe((data) => {
      const slug = (data['slug'] as string) || '';

      // Find the project with this slug (fall back to the first one)
      this.project = PROJECTS.find((p) => p.slug === slug) ?? PROJECTS[0];

      // A different project may have different broken images, so start fresh
      this.failedImages.clear();

      this.title.setTitle(`${this.project.title} — Saju S V`);
      this.meta.updateTag({ name: 'description', content: this.project.metaDescription });
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }

  // Stop listening when the page is left (prevents memory leaks)
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
