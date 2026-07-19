import { Component, OnDestroy, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, NavbarComponent, FooterComponent, TranslatePipe, RouterLink],
  templateUrl: './recipes.component.html',
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
      titleKey: 'RECIPES_CARD2_TITLE',
      descKey: 'RECIPES_CARD2_DESC',
      ingredientsKey: 'RECIPES_CARD2_INGREDIENTS',
      stepsKey: 'RECIPES_CARD2_STEPS',
      servingKey: 'RECIPES_CARD2_SERVING',
      timeKey: 'RECIPES_TIME_10',
      difficultyKey: 'RECIPES_EASY',
      image: 'https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 3,
      titleKey: 'RECIPES_CARD3_TITLE',
      descKey: 'RECIPES_CARD3_DESC',
      ingredientsKey: 'RECIPES_CARD3_INGREDIENTS',
      stepsKey: 'RECIPES_CARD3_STEPS',
      servingKey: 'RECIPES_CARD3_SERVING',
      timeKey: 'RECIPES_TIME_15',
      difficultyKey: 'RECIPES_EASY',
      image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 4,
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
      id: 5,
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

  selectedRecipe: Recipe | null = null;

  constructor() {
    effect(() => {
      this.langService.language();
      this.seoService.updateMetaTags({
        title: this.langService.translate('SEO_RECIPES_TITLE'),
        description: this.langService.translate('SEO_RECIPES_DESC'),
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=600'
      });
    });
  }

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
