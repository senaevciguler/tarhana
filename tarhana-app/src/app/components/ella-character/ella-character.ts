import { Component, Input, ChangeDetectionStrategy, ElementRef, OnInit, OnDestroy, signal, inject } from '@angular/core';

@Component({
  selector: 'app-ella-character',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="getContainerClasses()" class="inline-block relative">
      <img
        [src]="getImageSrc()"
        [alt]="altText"
        [loading]="lazy ? 'lazy' : 'eager'"
        [class]="getImageClasses()"
      />
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
      width: auto;
      height: auto;
    }
  `]
})
export class EllaCharacterComponent implements OnInit, OnDestroy {
  @Input() size: 'small' | 'medium' | 'large' | string = 'medium';
  @Input() alignment: 'left' | 'right' | 'center' | 'none' = 'none';
  @Input() animation: 'float' | 'breath' | 'rotate' | 'fade-in' | 'none' = 'none';
  @Input() floating: boolean = false;
  @Input() hoverEffect: boolean = true;
  @Input() lazy: boolean = true;
  @Input() pose: 'default' | 'cooking' | 'stirring' | 'waving' | string = 'default';
  @Input() altText: string = 'Ella Mascot';

  private el = inject(ElementRef);
  private observer: IntersectionObserver | null = null;

  // Track if element has entered the viewport for soft fade-in
  isVisible = signal(false);

  // Centralized pose mapping. This makes it extremely easy to replace this single PNG with multiple Ella poses later without changing the implementations!
  private poseMap: Record<string, string> = {
    'default': '/assets/ella-character.png',
    'cooking': '/assets/ella-character.png',
    'stirring': '/assets/ella-character.png',
    'waving': '/assets/ella-character.png'
  };

  ngOnInit() {
    this.setupIntersectionObserver();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupIntersectionObserver() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          this.isVisible.set(true);
          // Once visible, we can disconnect if we only want a one-time fade-in
          this.observer?.disconnect();
        }
      }, {
        threshold: 0.1
      });
      this.observer.observe(this.el.nativeElement);
    } else {
      // Fallback if IntersectionObserver is not available (e.g. SSR or older environment)
      this.isVisible.set(true);
    }
  }

  getImageSrc(): string {
    return this.poseMap[this.pose] || this.poseMap['default'];
  }

  getContainerClasses(): string {
    const classes: string[] = [];

    // Size styling preserving aspect ratio, comfortable spacing, scaled for mobile
    switch (this.size) {
      case 'small':
        classes.push('w-16 h-16 sm:w-20 sm:h-20 p-1');
        break;
      case 'medium':
        classes.push('w-28 h-28 sm:w-36 sm:h-36 p-2');
        break;
      case 'large':
        classes.push('w-44 h-44 sm:w-56 sm:h-56 p-3');
        break;
      default:
        // Accept direct custom tailwind classes if passed
        if (this.size.includes('w-') || this.size.includes('h-')) {
          classes.push(this.size);
        } else {
          classes.push('w-28 h-28 sm:w-36 sm:h-36 p-2');
        }
    }

    // Alignment classes
    switch (this.alignment) {
      case 'left':
        classes.push('mx-0 mr-auto flex');
        break;
      case 'right':
        classes.push('mx-0 ml-auto flex');
        break;
      case 'center':
        classes.push('mx-auto flex justify-center');
        break;
    }

    return classes.join(' ');
  }

  getImageClasses(): string {
    const classes: string[] = [
      'w-full h-full object-contain transition-all duration-700 ease-out select-none pointer-events-auto'
    ];

    // Initial opacity state based on visibility signal to allow soft fade-in
    if (this.isVisible()) {
      classes.push('opacity-100');
    } else {
      classes.push('opacity-0 scale-95');
    }

    // Floating effect (boolean input) - 2-4px vertical movement
    if (this.floating) {
      classes.push('animate-ella-float');
    }

    // Specific animations
    switch (this.animation) {
      case 'float':
        // Only add if not already added by floating boolean
        if (!this.floating) {
          classes.push('animate-ella-float');
        }
        break;
      case 'breath':
        classes.push('animate-ella-breath');
        break;
      case 'rotate':
        classes.push('animate-ella-rotate');
        break;
      case 'fade-in':
        classes.push('animate-ella-fade-in');
        break;
    }

    // Hover effect: slight scale on hover (2-3%) and very subtle rotation (1-2 degrees)
    if (this.hoverEffect) {
      classes.push('hover:scale-[1.025] hover:rotate-[1deg]');
    }

    return classes.join(' ');
  }
}
