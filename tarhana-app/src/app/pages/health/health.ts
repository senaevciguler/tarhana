import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, TranslatePipe],
  templateUrl: './health.component.html',
})
export class HealthComponent {}
