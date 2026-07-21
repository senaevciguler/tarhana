import { Component, OnDestroy, inject, effect, ChangeDetectionStrategy } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { LanguageService } from '../../services/language.service';

interface Recipe {
  id: number;
  titleKey: string;
  descKey: string;
  ingredientsKey: string;
  stepsKey: string;
  servingKey: string;
  timeKey: string;
  difficultyKey: string;
  image: string;
}

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, TranslatePipe, RouterLink],
  templateUrl: './recipes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipesComponent implements OnDestroy {
  private seoService = inject(SeoService);
  private langService = inject(LanguageService);

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
      image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 2,
      titleKey: 'RECIPES_CARD4_TITLE',
      descKey: 'RECIPES_CARD4_DESC',
      ingredientsKey: 'RECIPES_CARD4_INGREDIENTS',
      stepsKey: 'RECIPES_CARD4_STEPS',
      servingKey: 'RECIPES_CARD4_SERVING',
      timeKey: 'RECIPES_TIME_35',
      difficultyKey: 'RECIPES_MEDIUM',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 3,
      titleKey: 'RECIPES_CARD5_TITLE',
      descKey: 'RECIPES_CARD5_DESC',
      ingredientsKey: 'RECIPES_CARD5_INGREDIENTS',
      stepsKey: 'RECIPES_CARD5_STEPS',
      servingKey: 'RECIPES_CARD5_SERVING',
      timeKey: 'RECIPES_TIME_10',
      difficultyKey: 'RECIPES_EASY',
      image: 'https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?auto=format&fit=crop&q=80&w=600',
    },
  ];

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
  }

  closeRecipe() {
    this.selectedRecipe = null;
    document.body.style.overflow = 'auto';
  }

  ngOnDestroy() {
    document.body.style.overflow = 'auto';
  }
}
