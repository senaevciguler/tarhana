import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home';
import { provideRouter } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { signal } from '@angular/core';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        {
          provide: LanguageService,
          useValue: {
            translate: (key: string) => {
              const mockTranslations: Record<string, string> = {
                'HOME_HERO_TITLE': 'Traditional Tarhana — Now Crafted in Sweden',
                'HOME_VERSATILE_TITLE': 'More than soup',
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

  it('should display the More than soup section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const headings = Array.from(compiled.querySelectorAll('h2'));
    const hasMoreThanSoup = headings.some((h) => h.textContent?.includes('More than soup'));
    expect(hasMoreThanSoup).toBeTrue();
  });
});
