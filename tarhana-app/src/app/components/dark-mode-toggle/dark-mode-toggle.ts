import { Component, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-dark-mode-toggle',
  standalone: true,
  template: `
    <button (click)="toggleDarkMode()" class="fixed bottom-6 right-6 z-[100] w-12 h-12 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
      <span class="material-icons">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
    </button>
  `,
  styles: `
    :host {
      display: block;
    }
  `
})
export class DarkModeToggleComponent {
  isDark = false;

  constructor(@Inject(DOCUMENT) private document: Document) {
    // Check system preference
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
       // Optional: auto-enable if system is dark
       // this.toggleDarkMode();
    }
  }

  toggleDarkMode() {
    this.isDark = !this.isDark;
    if (this.isDark) {
      this.document.documentElement.classList.add('dark');
    } else {
      this.document.documentElement.classList.remove('dark');
    }
  }
}
