import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [NavbarComponent, FooterComponent],
  templateUrl: './shop.component.html',
})
export class ShopComponent {}
