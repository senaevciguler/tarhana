import {
  Component,
  OnDestroy,
  inject,
  effect,
  ChangeDetectionStrategy,
  signal,
  ElementRef,
  ViewChild,
  AfterViewInit,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { LanguageService } from '../../services/language.service';
import { EllaTipComponent } from '../../components/ella-tip/ella-tip';

interface Recipe {
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
  videoUrl?: string;
  posterImage?: string;
}

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, TranslatePipe, RouterLink, EllaTipComponent],
  templateUrl: './recipes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipesComponent implements AfterViewInit, OnDestroy {
  private seoService = inject(SeoService);
  public langService = inject(LanguageService);
  private platformId = inject(PLATFORM_ID);
  private observer: IntersectionObserver | null = null;

  @ViewChild('featuredVideo') featuredVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('heroRecipeImage') heroRecipeImage!: ElementRef<HTMLDivElement>;

  isVideoVisible = signal(false);
  showPlayButton = signal(true);
  showControls = signal(false);
  isPlaying = signal(false);

  recipes: Recipe[] = [
    {
      id: 1,
      titleKey: 'RECIPES_CARD1_TITLE',
      descKey: 'RECIPES_CARD1_DESC',
      ingredientsKey: 'RECIPES_CARD1_INGREDIENTS',
      stepsKey: 'RECIPES_CARD1_STEPS',
      servingKey: 'RECIPES_CARD1_SERVING',
      timeKey: 'RECIPES_TIME_10',
      difficultyKey: 'RECIPES_EASY',
      servingsKey: 'RECIPES_SERVINGS_1',
      image: '/assets/hero-tarhana-soup.png',
      videoUrl: 'https://cdn.shopify.com/videos/c/o/v/aa10862f880b4990a63d5cd5aaa17a12.mp4',
      posterImage: '/assets/hero-tarhana-soup.png',
    },
    {
      id: 2,
      titleKey: 'RECIPES_CARD4_TITLE',
      descKey: 'RECIPES_CARD4_DESC',
      ingredientsKey: 'RECIPES_CARD4_INGREDIENTS',
      stepsKey: 'RECIPES_CARD4_STEPS',
      servingKey: 'RECIPES_CARD4_SERVING',
      timeKey: 'RECIPES_TIME_30',
      difficultyKey: 'RECIPES_EASY',
      servingsKey: 'RECIPES_SERVINGS_4',
      image: '/assets/tarhana-bread.png',
    },
    {
      id: 3,
      titleKey: 'RECIPES_CARD5_TITLE',
      descKey: 'RECIPES_CARD5_DESC',
      ingredientsKey: 'RECIPES_CARD5_INGREDIENTS',
      stepsKey: 'RECIPES_CARD5_STEPS',
      servingKey: 'RECIPES_CARD5_SERVING',
      timeKey: 'RECIPES_TIME_30',
      difficultyKey: 'RECIPES_EASY',
      servingsKey: 'RECIPES_SERVINGS_CHIPS',
      image: '/assets/tarhana-chips.png',
    },
  ];

  gridRecipes: Recipe[] = this.recipes.slice(1);

  constructor() {
    window.scrollTo(0, 0);
    effect(() => {
      const title = this.langService.translate('SEO_RECIPES_TITLE');
      const desc = this.langService.translate('SEO_RECIPES_DESC');

      this.seoService.updateMeta(title, desc);
      this.seoService.updateCanonical();
      this.seoService.updateJsonLd(null);
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

  selectedRecipe: Recipe | null = null;

  openRecipe(recipe: Recipe) {
    this.selectedRecipe = recipe;
    document.body.style.overflow = 'hidden';

    const video = this.featuredVideo?.nativeElement;
    if (video) {
      video.pause();
    }
  }

  closeRecipe() {
    this.selectedRecipe = null;
    document.body.style.overflow = 'auto';
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    document.body.style.overflow = 'auto';
  }
}
