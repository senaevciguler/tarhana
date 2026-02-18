import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-story',
  standalone: true,
  imports: [NavbarComponent, FooterComponent],
  templateUrl: './story.component.html',
})
export class StoryComponent {}
