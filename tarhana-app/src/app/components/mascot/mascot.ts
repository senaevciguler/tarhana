import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-mascot',
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
export class MascotComponent {
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | string = 'md';
  @Input() align: 'left' | 'right' | 'center' | 'none' = 'none';
  @Input() animate: 'float' | 'breath' | 'none' = 'none';
  @Input() hoverEffect: boolean = true;
  @Input() lazy: boolean = true;
  @Input() pose: 'default' | 'cooking' | 'stirring' | 'waving' = 'default';
  @Input() altText: string = 'Ella Mascot';

  // Map of poses to their respective asset URLs. Currently, all map to figur.png,
  // but this is future-proof and ready for additional poses.
  private poseMap: Record<string, string> = {
    'default': '/assets/figur.png',
    'cooking': '/assets/figur.png',
    'stirring': '/assets/figur.png',
    'waving': '/assets/figur.png'
  };

  getImageSrc(): string {
    return this.poseMap[this.pose] || this.poseMap['default'];
  }

  getContainerClasses(): string {
    const classes: string[] = [];

    // Size styling (responsive)
    switch (this.size) {
      case 'sm':
        classes.push('w-16 h-16 md:w-20 md:h-20');
        break;
      case 'md':
        classes.push('w-24 h-24 md:w-32 md:h-32');
        break;
      case 'lg':
        classes.push('w-36 h-36 md:w-48 md:h-48');
        break;
      case 'xl':
        classes.push('w-48 h-48 md:w-64 md:h-64');
        break;
      default:
        // Allow custom classes if passed as string directly (e.g. sizing classes)
        if (this.size.includes('w-') || this.size.includes('h-')) {
          classes.push(this.size);
        } else {
          classes.push('w-24 h-24 md:w-32 md:h-32');
        }
    }

    // Alignment classes
    switch (this.align) {
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
    const classes: string[] = ['w-full h-full object-contain transition-all duration-[800ms] ease-out select-none pointer-events-auto'];

    // Animations (defined in Tailwind config)
    if (this.animate === 'float') {
      classes.push('animate-mascot-float');
    } else if (this.animate === 'breath') {
      classes.push('animate-mascot-breath');
    }

    // Hover effects (very subtle scale and rotation 1-2 degrees)
    if (this.hoverEffect) {
      classes.push('hover:scale-105 hover:rotate-2');
    }

    return classes.join(' ');
  }
}
