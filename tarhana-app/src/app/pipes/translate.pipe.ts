import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../services/language.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false, // Set to false to react to translation changes in the service
})
export class TranslatePipe implements PipeTransform {
  private langService = inject(LanguageService);

  transform(key: string): string {
    return this.langService.translate(key);
  }
}
