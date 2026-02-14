import { Routes } from '@angular/router';
import { RecipesComponent } from './pages/recipes/recipes';
import { ShopComponent } from './pages/shop/shop';
import { StoryComponent } from './pages/story/story';
import { HealthComponent } from './pages/health/health';

export const routes: Routes = [
  { path: '', redirectTo: 'recipes', pathMatch: 'full' },
  { path: 'recipes', component: RecipesComponent },
  { path: 'shop', component: ShopComponent },
  { path: 'story', component: StoryComponent },
  { path: 'health', component: HealthComponent },
  { path: '**', redirectTo: 'recipes' },
];
