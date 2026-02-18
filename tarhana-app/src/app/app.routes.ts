import { Routes } from '@angular/router';
import { RecipesComponent } from './pages/recipes/recipes';
import { ProductsComponent } from './pages/products/products';
import { StoryComponent } from './pages/story/story';
import { HealthComponent } from './pages/health/health';
import { HomeComponent } from './pages/home/home';

export const routes: Routes = [
    { path: '', component: HomeComponent, pathMatch: 'full' },
    { path: 'recipes', component: RecipesComponent },
    { path: 'products', component: ProductsComponent },
    { path: 'story', component: StoryComponent },
    { path: 'health', component: HealthComponent },
];
