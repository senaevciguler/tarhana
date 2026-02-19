import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterLink, TranslatePipe],
  templateUrl: './products.component.html',
})
export class ProductsComponent {}
