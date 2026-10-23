// NAVBAR: top menu with a "Projects" dropdown (desktop) and a hamburger menu (mobile).
import { Component, ElementRef, HostListener, ViewEncapsulation, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [RouterLink, RouterLinkActive],
  encapsulation: ViewEncapsulation.None, // CSS applies globally instead of only to this component
})
export class NavbarComponent {
  private readonly el = inject(ElementRef); // the <app-navbar> element itself
  readonly router = inject(Router); // public: the HTML reads router.url

  // The HTML shows/hides things based on these two flags
  isDropdownOpen = false; // "Projects" dropdown
  isMenuOpen = false; // mobile hamburger menu

  // Open/close the dropdown. Only one of dropdown / menu can be open at a time.
  toggleDropdown(event: Event): void {
    event.stopPropagation(); // stops the click reaching onDocumentClick below
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) this.isMenuOpen = false;
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) this.isDropdownOpen = false;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  closeAll(): void {
    this.isDropdownOpen = false;
    this.isMenuOpen = false;
  }

  // Clicking anywhere outside the navbar closes everything
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) this.closeAll();
  }

  // Pressing Esc closes everything
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeAll();
  }
}
