import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { SHOPIFY_CONFIG } from '../../shopify.config';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let httpMock: HttpTestingController;
  let originalKey: string;

  beforeEach(async () => {
    originalKey = SHOPIFY_CONFIG.contactFormKey;

    await TestBed.configureTestingModule({
      imports: [FooterComponent, FormsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    // Flush any automatic translation requests
    fixture.detectChanges();
    const translateRequests = httpMock.match(req => req.url.startsWith('/assets/i18n/'));
    translateRequests.forEach(req => req.flush({}));

    await fixture.whenStable();
  });

  afterEach(() => {
    SHOPIFY_CONFIG.contactFormKey = originalKey;

    // Flush any residual translation requests that may have been triggered
    const translateRequests = httpMock.match(req => req.url.startsWith('/assets/i18n/'));
    translateRequests.forEach(req => req.flush({}));

    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle invalid newsletter subscription', () => {
    component.email.set('invalid-email');
    component.subscribeNewsletter();
    expect(component.newsletterError()).toBeTrue();
    expect(component.newsletterSuccess()).toBeFalse();
  });

  it('should handle web3forms service newsletter subscription success', () => {
    SHOPIFY_CONFIG.contactFormKey = 'test-key';

    component.email.set('test@example.com');
    component.subscribeNewsletter();

    expect(component.newsletterSubmitting()).toBeTrue();

    const req = httpMock.expectOne('https://api.web3forms.com/submit');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.get('access_key')).toBe('test-key');
    expect(req.request.body.get('email')).toBe('test@example.com');

    req.flush({ success: true });

    expect(component.newsletterSubmitting()).toBeFalse();
    expect(component.newsletterSuccess()).toBeTrue();
    expect(component.email()).toBe('');
  });

  it('should handle web3forms service newsletter subscription failure', () => {
    SHOPIFY_CONFIG.contactFormKey = 'test-key';

    component.email.set('test@example.com');
    component.subscribeNewsletter();

    expect(component.newsletterSubmitting()).toBeTrue();

    const req = httpMock.expectOne('https://api.web3forms.com/submit');
    req.flush({ success: false });

    expect(component.newsletterSubmitting()).toBeFalse();
    expect(component.newsletterError()).toBeTrue();
    expect(component.newsletterSuccess()).toBeFalse();
  });

  it('should render brand name and copyright info', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.font-display')?.textContent).toContain('Ella’s Pantry');
  });
});
