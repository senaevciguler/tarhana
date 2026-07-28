import { Component, Input, ChangeDetectionStrategy, ElementRef, OnInit, OnDestroy, signal, inject } from '@angular/core';

@Component({
  selector: 'app-ella-character',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="getContainerClasses()" class="inline-block relative overflow-visible">
      <!-- Decoupled viewport entry layer -->
      <div [class]="getEntryClasses()" class="w-full h-full">
        <!-- Decoupled loop animation layer -->
        <div [class]="getLoopingClasses()">
          <!-- Interactive image layer with smooth hover response -->
          <img
            [src]="getImageSrc()"
            [alt]="altText"
            [loading]="lazy ? 'lazy' : 'eager'"
            [class]="getImageClasses()"
          />
        </div>
      </div>
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
  @Input() animation: 'float' | 'idle' | 'fade' | 'fade-in' | 'breath' | 'rotate' | 'none' = 'none';
  @Input() floating: boolean = false;
  @Input() hoverEffect: boolean = true;
  @Input() lazy: boolean = true;
  @Input() pose: 'default' | 'cooking' | 'stirring' | 'waving' | 'wave' | 'shopping' | 'reading' | string = 'default';
  @Input() altText: string = 'Ella Mascot';

  private el = inject(ElementRef);
  private observer: IntersectionObserver | null = null;

  // Track if element has entered the viewport for soft fade-in
  isVisible = signal(false);

  // Centralized pose mapping. This makes it extremely easy to replace this single PNG with multiple Ella poses later without changing the implementations!
  private poseMap: Record<string, string> = {
    'default': '/assets/ella-character.png',
    'cooking': '/assets/pose1.png',
    'stirring': '/assets/pose1.png',
    'cooking-stirring': '/assets/pose1.png',
    'standing-soup': '/assets/fullFigure.png',
    'waving': '/assets/ella-character.png',
    'wave': '/assets/ella-character.png',
    'shopping': '/assets/ella-character.png',
    'reading': '/assets/ella-character.png'
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

  getEntryClasses(): string {
    const classes: string[] = ['transition-all duration-1000 ease-out'];
    if (this.isVisible()) {
      if (this.animation === 'fade') {
        classes.push('animate-ella-fade');
      } else if (this.animation === 'fade-in') {
        classes.push('animate-ella-fade-in');
      } else {
        classes.push('opacity-100 scale-100');
      }
    } else {
      if (this.animation === 'fade' || this.animation === 'fade-in') {
        classes.push('opacity-0');
      } else {
        classes.push('opacity-0 scale-95');
      }
    }
    return classes.join(' ');
  }

  getLoopingClasses(): string {
    const classes: string[] = ['w-full h-full'];

    if (this.animation === 'float' || this.floating) {
      classes.push('animate-ella-float');
    } else if (this.animation === 'idle') {
      classes.push('animate-ella-idle');
    } else if (this.animation === 'breath') {
      classes.push('animate-ella-breath');
    } else if (this.animation === 'rotate') {
      classes.push('animate-ella-rotate');
    }

    return classes.join(' ');
  }

  getImageClasses(): string {
    const classes: string[] = [
      'w-full h-full object-contain transition-transform duration-700 ease-out select-none pointer-events-auto'
    ];

    // Hover effect: slight scale on hover (2%) and very subtle rotation (1 degree)
    if (this.hoverEffect) {
      classes.push('hover:scale-[1.02] hover:rotate-[1deg]');
    }

    return classes.join(' ');
  }
}
