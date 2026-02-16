import { Routes } from '@angular/router';
import { RecipesComponent } from './pages/recipes/recipes';
import { ShopComponent } from './pages/shop/shop';
import { StoryComponent } from './pages/story/story';
import { HealthComponent } from './pages/health/health';

export const routes: Routes = [
  { path: 'story', component: StoryComponent, pathMatch: 'full' },
  { path: 'health', component: HealthComponent, pathMatch: 'full' },
  { path: 'recipes', component: RecipesComponent, pathMatch: 'full' },
  { path: 'shop', component: ShopComponent, pathMatch: 'full' },
  { path: '', redirectTo: 'recipes', pathMatch: 'full' },
];
