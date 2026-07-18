import { Routes } from '@angular/router';
import { RecipesComponent } from './pages/recipes/recipes';
import { ProductsComponent } from './pages/products/products';
import { StoryComponent } from './pages/story/story';
import { HealthComponent } from './pages/health/health';
import { HomeComponent } from './pages/home/home';
import { CheckoutComponent } from './pages/checkout/checkout';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'recipes', component: RecipesComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'story', component: StoryComponent },
  { path: 'health', component: HealthComponent },
  {
  path: 'products/:handle',
  component: ProductDetailComponent
},
];
