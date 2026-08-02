import {
  Component,
  OnDestroy,
  inject,
  effect,
  ChangeDetectionStrategy,
  ViewChild
} from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { LanguageService } from '../../services/language.service';
import { EllaTipComponent } from '../../components/ella-tip/ella-tip';
import { Recipe, RecipeMediaComponent } from '../../components/recipe-media/recipe-media';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, TranslatePipe, RouterLink, EllaTipComponent, RecipeMediaComponent],
  templateUrl: './recipes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipesComponent implements OnDestroy {
  private seoService = inject(SeoService);
  public langService = inject(LanguageService);

  @ViewChild('featuredMedia') featuredMedia!: RecipeMediaComponent;

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
      videos: {
        en: 'https://cdn.shopify.com/videos/c/o/v/aa10862f880b4990a63d5cd5aaa17a12.mp4',
        sv: 'https://cdn.shopify.com/videos/c/o/v/1f5c698418754931bb1bca943535479f.mp4',
      },
      posters: {
        en: '/assets/hero-tarhana-soup.png',
        sv: '/assets/hero-tarhana-soup.png',
      },
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

  selectedRecipe: Recipe | null = null;

  openRecipe(recipe: Recipe) {
    this.selectedRecipe = recipe;
    document.body.style.overflow = 'hidden';

    this.featuredMedia?.pause();
  }

  closeRecipe() {
    this.selectedRecipe = null;
    document.body.style.overflow = 'auto';
  }

  ngOnDestroy() {
    document.body.style.overflow = 'auto';
  }
}
