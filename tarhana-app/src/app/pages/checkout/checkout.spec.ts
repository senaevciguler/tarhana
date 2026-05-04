import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckoutComponent } from './checkout';
import { provideRouter } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: LanguageService,
          useValue: {
            translate: (key: string) => {
              const mockTranslations: Record<string, string> = {
                'CHECKOUT_TITLE': 'Checkout',
                'CHECKOUT_COMING_SOON': 'Coming Soon'
              };
              return mockTranslations[key] || key;
            },
            language: signal('EN'),
            setLanguage: () => Promise.resolve()
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render correct title based on checkout state', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    if (component.enableCheckout) {
      expect(compiled.querySelector('h1')?.textContent).toContain('Checkout');
    } else {
      expect(compiled.querySelector('h1')?.textContent).toContain('Coming Soon');
    }
  });
});
