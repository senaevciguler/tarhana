import { Routes } from '@angular/router';
import { RecipesComponent } from './pages/recipes/recipes';
import { ProductsComponent } from './pages/products/products';
import { StoryComponent } from './pages/story/story';
import { HealthComponent } from './pages/health/health';
import { HomeComponent } from './pages/home/home';
import { CheckoutComponent } from './pages/checkout/checkout';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { ContactComponent } from './pages/contact/contact';
import { PrivacyComponent } from './pages/privacy/privacy';
import { TermsComponent } from './pages/terms/terms';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'recipes', component: RecipesComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'story', component: StoryComponent },
  { path: 'health', component: HealthComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'terms', component: TermsComponent },
  {
  path: 'products/:handle',
  component: ProductDetailComponent
},
];
