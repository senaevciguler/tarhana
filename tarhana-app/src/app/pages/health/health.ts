import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [NavbarComponent, FooterComponent],
  templateUrl: './health.component.html',
})
export class HealthComponent {}
