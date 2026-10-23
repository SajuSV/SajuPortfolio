// PROJECT SECTION: a row of project cards, hiding the project you are already viewing.
// Usage in HTML:  <app-project-section currentProjectId="logodesign"></app-project-section>
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-project-section',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './project-section.component.html',
  styleUrl: './project-section.component.css',
})
export class ProjectSectionComponent {
  // INPUT: the id of the current project (passed in from the parent's HTML).
  // `input()` creates a "signal": read its value by calling it -> this.currentProjectId()
  currentProjectId = input<string>('');

  // All the cards that can be shown
  allProjects = [
    {
      id: 'webdev',
      tag: 'Frontend',
      title: 'Web Development',
      role: 'UI/UX Developer',
      link: '/projects/webdev',
      image: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/Web.webp',
      imageAlt: 'Web Development preview',
    },
    {
      id: 'webdesign',
      tag: 'Figma | Photoshop',
      title: 'Web Design',
      role: 'UI/UX Designer',
      link: '/projects/webdesign',
      image: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/webdesign.webp',
      imageAlt: 'Web Design preview',
    },
    {
      id: 'posterdesign',
      tag: 'Photoshop',
      title: 'Poster Design',
      role: 'Visual Designer',
      link: '/projects/posterdesign',
      image: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/posters.webp',
      imageAlt: 'Poster Design preview',
    },
  ];

  // COMPUTED: recalculates automatically whenever currentProjectId changes.
  // Keeps every card except the current project (max 3).
  displayedProjects = computed(() =>
    this.allProjects.filter((project) => project.id !== this.currentProjectId()).slice(0, 3),
  );
}
