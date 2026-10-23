// LOGO DESIGN PAGE (standalone version).
// Note: the page routed at /projects/logodesign is built by ProjectComponent (pages/project).
// This component is kept as a separate version of the page; it shows the
// "other projects" cards using <app-project-section>.
import { Component } from '@angular/core';
import { ProjectSectionComponent } from '../../components/project-section/project-section.component';

@Component({
  selector: 'app-logodesign',
  imports: [ProjectSectionComponent],
  templateUrl: './logodesign.component.html',
  styleUrl: './logodesign.component.css',
})
export class LogodesignComponent {}
