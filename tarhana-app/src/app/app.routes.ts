import { Routes } from '@angular/router';
import { RecipesComponent } from './pages/recipes/recipes';
import { ShopComponent } from './pages/shop/shop';

export const routes: Routes = [
    { path: '', redirectTo: 'recipes', pathMatch: 'full' },
    { path: 'recipes', component: RecipesComponent },
    { path: 'shop', component: ShopComponent },
];
