import { Routes } from '@angular/router';
import { RecipesComponent } from './pages/recipes/recipes';
import { ShopComponent } from './pages/shop/shop';
import { StoryComponent } from './pages/story/story';
import { HealthComponent } from './pages/health/health';
import { HomeComponent } from './pages/home/home';

export const routes: Routes = [
    { path: '', component: HomeComponent, pathMatch: 'full' },
    { path: 'recipes', component: RecipesComponent },
    { path: 'shop', component: ShopComponent },
    { path: 'story', component: StoryComponent },
    { path: 'health', component: HealthComponent },
];
