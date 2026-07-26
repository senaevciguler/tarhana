import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
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
  let originalService: string;
  let originalKey: string;

  beforeEach(async () => {
    originalService = SHOPIFY_CONFIG.contactFormService;
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
    SHOPIFY_CONFIG.contactFormService = originalService;
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

  it('should handle mock service newsletter subscription', fakeAsync(() => {
    SHOPIFY_CONFIG.contactFormService = 'mock';
    SHOPIFY_CONFIG.contactFormKey = '';

    component.email.set('test@example.com');
    component.subscribeNewsletter();

    expect(component.newsletterSubmitting()).toBeTrue();
    expect(component.newsletterSuccess()).toBeFalse();

    tick(1000);

    expect(component.newsletterSubmitting()).toBeFalse();
    expect(component.newsletterSuccess()).toBeTrue();
    expect(component.email()).toBe('');
  }));

  it('should handle web3forms service newsletter subscription success', () => {
    SHOPIFY_CONFIG.contactFormService = 'web3forms';
    SHOPIFY_CONFIG.contactFormKey = 'test-key';

    component.email.set('test@example.com');
    component.subscribeNewsletter();

    expect(component.newsletterSubmitting()).toBeTrue();

    const req = httpMock.expectOne('https://api.web3forms.com/submit');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.access_key).toBe('test-key');
    expect(req.request.body.email).toBe('test@example.com');

    req.flush({ success: true });

    expect(component.newsletterSubmitting()).toBeFalse();
    expect(component.newsletterSuccess()).toBeTrue();
    expect(component.email()).toBe('');
  });

  it('should handle web3forms service newsletter subscription failure', () => {
    SHOPIFY_CONFIG.contactFormService = 'web3forms';
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

  it('should handle formspree service newsletter subscription success', () => {
    SHOPIFY_CONFIG.contactFormService = 'formspree';
    SHOPIFY_CONFIG.contactFormKey = 'test-form-id';

    component.email.set('test@example.com');
    component.subscribeNewsletter();

    expect(component.newsletterSubmitting()).toBeTrue();

    const req = httpMock.expectOne('https://formspree.io/f/test-form-id');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.email).toBe('test@example.com');

    req.flush({});

    expect(component.newsletterSubmitting()).toBeFalse();
    expect(component.newsletterSuccess()).toBeTrue();
    expect(component.email()).toBe('');
  });

  it('should handle formspree service newsletter subscription failure', () => {
    SHOPIFY_CONFIG.contactFormService = 'formspree';
    SHOPIFY_CONFIG.contactFormKey = 'test-form-id';

    component.email.set('test@example.com');
    component.subscribeNewsletter();

    expect(component.newsletterSubmitting()).toBeTrue();

    const req = httpMock.expectOne('https://formspree.io/f/test-form-id');
    req.error(new ErrorEvent('Network error'));

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
