import { Injectable, signal, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type Language = 'SV' | 'EN';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private http = inject(HttpClient);
  private currentLang = signal<Language>('SV');
  private translations = signal<Record<string, string>>({});

  constructor() {
    const savedLang = localStorage.getItem('lang') as Language;
    if (savedLang && (savedLang === 'SV' || savedLang === 'EN')) {
      this.setLanguage(savedLang);
    } else {
      this.loadTranslations('SV');
    }

    // Persist language changes
    effect(() => {
      localStorage.setItem('lang', this.currentLang());
    });
  }

  async setLanguage(lang: Language) {
    this.currentLang.set(lang);
    await this.loadTranslations(lang);
  }

  get language() {
    return this.currentLang.asReadonly();
  }

  private async loadTranslations(lang: Language) {
    try {
      const translations = await firstValueFrom(
        this.http.get<Record<string, string>>(`/assets/i18n/${lang.toLowerCase()}.json`)
      );
      this.translations.set(translations);
    } catch (error) {
      console.error(`Could not load translations for ${lang}`, error);
    }
  }

  translate(key: string): string {
    return this.translations()[key] || key;
  }
}
