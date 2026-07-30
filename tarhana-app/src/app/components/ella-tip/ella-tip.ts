import { Component, Input, inject, ChangeDetectionStrategy } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { EllaCharacterComponent } from '../ella-character/ella-character';

@Component({
  selector: 'app-ella-tip',
  standalone: true,
  imports: [EllaCharacterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative max-w-4xl mx-auto my-16 bg-[#FAF8F4] dark:bg-stone-900/60 rounded-3xl p-8 md:p-12 shadow-md border border-stone-200/40 dark:border-stone-800/40 flex flex-col md:flex-row items-center gap-8 md:gap-12 overflow-visible">
      <!-- Mascot image container overlapping the left/top side -->
      <div class="flex-shrink-0 -mt-16 md:-mt-0 md:-ml-16 z-10">
        <app-ella-character
          size="w-[120px] h-[120px] md:w-[144px] md:h-[144px]"
          alignment="center"
          animation="idle"
          [hoverEffect]="true"
          pose="cooking-stirring"
          altText="Ella Cooking"
        ></app-ella-character>
      </div>
      <div class="space-y-3 text-center md:text-left flex-grow">
        <h4 class="text-sm uppercase tracking-wider text-primary font-bold dark:text-red-400">
          @if (langService.language() === 'SV') { Ellas Tips } @else { Ella's Tip }
        </h4>
        <p class="text-stone-700 dark:text-stone-300 font-serif italic leading-relaxed text-base md:text-lg">
          "{{ getTipText() }}"
        </p>
      </div>
    </div>
  `
})
export class EllaTipComponent {
  public langService = inject(LanguageService);

  @Input() tipEn: string = "For the most comforting tarhana soup, whisk in a dollop of butter or finish with a spoonful of creamy yogurt and fresh mint at the end.";
  @Input() tipSv: string = "För den mest krämiga tarhanasoppan, vispa i en klick smör eller toppa med krämig yoghurt och färsk mynta i slutet av tillagningen.";

  getTipText(): string {
    return this.langService.language() === 'SV' ? this.tipSv : this.tipEn;
  }
}
