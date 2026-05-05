import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home';
import { provideRouter } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: LanguageService,
          useValue: {
            translate: (key: string) => {
              const mockTranslations: Record<string, string> = {
                'HOME_HERO_TITLE': 'Traditional Tarhana — Now Crafted in Sweden',
                'HOME_RECIPES_CTA_TITLE': 'Want more ideas?',
              };
              return mockTranslations[key] || key;
            },
            language: signal('EN'),
            setLanguage: () => Promise.resolve()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the main headline', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain(
      'Traditional Tarhana — Now Crafted in Sweden',
    );
  });

  it('should display the Recipes CTA section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const headings = Array.from(compiled.querySelectorAll('h2'));
    const hasRecipesCTA = headings.some((h) => h.textContent?.includes('Want more ideas?'));
    expect(hasRecipesCTA).toBeTrue();
  });
});
