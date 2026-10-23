// PROJECTS PAGE: the list of project cards (/projects).
import { Component, OnInit, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { PageCursorGridComponent } from '../../shared/page-cursor-grid/page-cursor-grid.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [RouterLink, PageCursorGridComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
})
export class ProjectsComponent implements OnInit {
  private readonly title = inject(Title); // service that sets the browser tab title

  // Runs once when the page opens
  ngOnInit(): void {
    this.title.setTitle('Projects — Saju S V');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}
