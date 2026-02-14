import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [], // Removed RouterLink as it was unused and caused a warning
  templateUrl: './footer.component.html',
})
export class FooterComponent {}
