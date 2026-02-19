import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private http = inject(HttpClient);
  private currentLang = signal<string>(localStorage.getItem('lang') || 'sv');
  private translations = signal<any>({});

  constructor() {
    this.loadTranslations(this.currentLang());
  }

  loadTranslations(lang: string) {
    this.http.get(`/assets/i18n/${lang}.json`).subscribe({
      next: (data) => {
        this.translations.set(data);
        this.currentLang.set(lang);
        localStorage.setItem('lang', lang);
      },
      error: (err) => {
        console.error(`Could not load translations for ${lang}`, err);
      }
    });
  }

  switchLanguage(lang: string) {
    this.loadTranslations(lang);
  }

  getCurrentLang() {
    return this.currentLang;
  }

  translate(key: string): string {
    const keys = key.split('.');
    let result = this.translations();

    for (const k of keys) {
      if (result && result[k]) {
        result = result[k];
      } else {
        return key;
      }
    }

    return typeof result === 'string' ? result : key;
  }
}
