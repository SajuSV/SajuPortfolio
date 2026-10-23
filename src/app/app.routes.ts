// ROUTES: which component is shown for which URL.
// Example: visiting  /about  shows AboutComponent inside <router-outlet> (see app.component.html).
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { ProjectComponent } from './pages/project/project.component';
import { MygallaryComponent } from './pages/mygallary/mygallary.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  // Home page  ->  "/"
  { path: '', component: HomeComponent },

  { path: 'about', title: 'About — Saju S V', component: AboutComponent },
  { path: 'projects', title: 'Projects — Saju S V', component: ProjectsComponent },

  // The 4 project pages share ONE component (ProjectComponent).
  // The "slug" in `data` tells it which project to display (content lives in project.data.ts).
  { path: 'projects/webdesign', title: 'Web Design — Saju S V', data: { slug: 'webdesign' }, component: ProjectComponent },
  { path: 'projects/webdev', title: 'Web Development — Saju S V', data: { slug: 'webdev' }, component: ProjectComponent },
  { path: 'projects/logodesign', title: 'Logo Design — Saju S V', data: { slug: 'logodesign' }, component: ProjectComponent },
  { path: 'projects/posterdesign', title: 'Poster Design — Saju S V', data: { slug: 'posterdesign' }, component: ProjectComponent },

  // Gallery page (full screen, navbar and footer are hidden - see app.component.ts)
  { path: 'projects/gallery', component: MygallaryComponent },

  // "**" matches any other URL -> 404 page. It must stay LAST.
  { path: '**', component: NotFoundComponent },
];
