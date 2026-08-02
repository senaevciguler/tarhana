import {
  Component,
  Input,
  inject,
  ChangeDetectionStrategy,
  signal,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
  effect
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

export interface Recipe {
  id: number;
  titleKey: string;
  descKey: string;
  ingredientsKey: string;
  stepsKey: string;
  servingKey: string;
  timeKey: string;
  difficultyKey: string;
  servingsKey: string;
  image: string;
  videos?: {
    en?: string;
    sv?: string;
  };
  posters?: {
    en?: string;
    sv?: string;
  };
}

@Component({
  selector: 'app-recipe-media',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (getActiveVideo()) {
      <!-- Playable Hero Video Container -->
      <div
        #heroRecipeImage
        (click)="onVideoContainerClick($event)"
        class="w-full h-full relative group cursor-pointer transition-all duration-1000 bg-stone-900 overflow-hidden"
        [class.opacity-0]="!isVideoVisible()"
        [class.scale-95]="!isVideoVisible()"
        [class.opacity-100]="isVideoVisible()"
        [class.scale-100]="isVideoVisible()"
      >
        <video
          #featuredVideo
          class="w-full h-full object-contain transition-transform duration-700 ease-out motion-reduce:transition-none"
          [src]="getActiveVideo()"
          [poster]="getActivePoster()"
          [controls]="showControls()"
          (play)="onVideoPlay()"
          (pause)="onVideoPause()"
          (ended)="onVideoEnded()"
          playsinline
          preload="metadata"
        ></video>

        @if (showPlayButton()) {
          <!-- Large Centered Play Button Overlay -->
          <div class="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/25 transition-colors pointer-events-none">
            <button
              type="button"
              class="w-20 h-20 rounded-full bg-white/95 text-stone-900 shadow-2xl flex items-center justify-center transform hover:scale-110 active:scale-95 transition-all duration-300 pointer-events-auto"
              (click)="startPlayback($event)"
              aria-label="Play video"
            >
              <span class="material-icons text-5xl translate-x-0.5">play_arrow</span>
            </button>
          </div>
        }

        <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
        <div class="absolute bottom-6 left-6 pointer-events-none">
          <span class="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            {{ 'RECIPES_FEATURED_BADGE' | translate }}
          </span>
        </div>
      </div>
    } @else {
      <!-- Static Fallback Hero Image Container -->
      <div
        #heroRecipeImage
        class="w-full h-full relative group transition-all duration-1000 overflow-hidden"
        [class.opacity-0]="!isVideoVisible()"
        [class.scale-95]="!isVideoVisible()"
        [class.opacity-100]="isVideoVisible()"
        [class.scale-100]="isVideoVisible()"
      >
        <img
          [src]="recipe.image"
          [alt]="recipe.titleKey | translate"
          class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
          loading="lazy"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
        <div class="absolute bottom-6 left-6 pointer-events-none">
          <span class="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            {{ 'RECIPES_FEATURED_BADGE' | translate }}
          </span>
        </div>
      </div>
    }
  `
})
export class RecipeMediaComponent implements AfterViewInit, OnDestroy {
  public langService = inject(LanguageService);
  private platformId = inject(PLATFORM_ID);
  private observer: IntersectionObserver | null = null;

  @Input() recipe!: Recipe;

  @ViewChild('featuredVideo') featuredVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('heroRecipeImage') heroRecipeImage!: ElementRef<HTMLDivElement>;

  isVideoVisible = signal(false);
  showPlayButton = signal(true);
  showControls = signal(false);
  isPlaying = signal(false);

  constructor() {
    effect(() => {
      // Access language signal to react on language changes
      this.langService.language();

      // Reset video playback state when language changes
      this.showPlayButton.set(true);
      this.showControls.set(false);
      this.isPlaying.set(false);

      const video = this.featuredVideo?.nativeElement;
      if (video) {
        video.pause();
        video.currentTime = 0;
        video.load();
      }
    });
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.setupIntersectionObserver();
    } else {
      this.isVideoVisible.set(true);
    }
  }

  private setupIntersectionObserver() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video = this.featuredVideo?.nativeElement;
            if (entry.isIntersecting) {
              this.isVideoVisible.set(true);
            } else {
              if (video) {
                video.pause();
              }
            }
          });
        },
        {
          threshold: 0.1,
        }
      );

      if (this.heroRecipeImage) {
        this.observer.observe(this.heroRecipeImage.nativeElement);
      }
    } else {
      this.isVideoVisible.set(true);
    }
  }

  getActiveVideo(): string | undefined {
    if (!this.recipe?.videos) return undefined;
    const lang = this.langService.language().toLowerCase() as 'en' | 'sv';
    return this.recipe.videos[lang];
  }

  getActivePoster(): string | undefined {
    if (!this.recipe?.posters) return undefined;
    const lang = this.langService.language().toLowerCase() as 'en' | 'sv';
    return this.recipe.posters[lang] || this.recipe.image;
  }

  startPlayback(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    const video = this.featuredVideo?.nativeElement;
    if (video) {
      video.play().catch((err) => {
        console.debug('Playback failed:', err);
      });
    }
  }

  onVideoContainerClick(event: MouseEvent) {
    if (this.showControls()) {
      return;
    }
    const video = this.featuredVideo?.nativeElement;
    if (video && video.paused) {
      this.startPlayback(event);
    }
  }

  onVideoPlay() {
    this.isPlaying.set(true);
    this.showPlayButton.set(false);
    this.showControls.set(true);
  }

  onVideoPause() {
    this.isPlaying.set(false);
  }

  onVideoEnded() {
    const video = this.featuredVideo?.nativeElement;
    if (video) {
      video.currentTime = 0;
      video.load();
    }
    this.isPlaying.set(false);
    this.showControls.set(false);
    this.showPlayButton.set(true);
  }

  public pause() {
    const video = this.featuredVideo?.nativeElement;
    if (video) {
      video.pause();
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
