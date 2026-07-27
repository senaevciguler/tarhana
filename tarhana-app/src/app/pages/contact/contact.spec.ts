import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ContactComponent } from './contact';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SHOPIFY_CONFIG } from '../../shopify.config';

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;
  let httpMock: HttpTestingController;
  let originalKey: string;

  beforeEach(async () => {
    originalKey = SHOPIFY_CONFIG.contactFormKey;

    await TestBed.configureTestingModule({
      imports: [ContactComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            queryParams: of({})
          }
        },
        LanguageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    // Flush any automatic translation requests
    const translateRequests = httpMock.match(req => req.url.startsWith('/assets/i18n/'));
    translateRequests.forEach(req => req.flush({}));
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

  it('should validate form fields correctly', () => {
    const nameInput = component.contactForm.get('name');
    const emailInput = component.contactForm.get('email');
    const messageInput = component.contactForm.get('message');

    nameInput?.setValue('');
    emailInput?.setValue('invalid-email');
    messageInput?.setValue('short');

    expect(component.contactForm.valid).toBeFalse();

    nameInput?.setValue('Ella');
    emailInput?.setValue('info@ellaspantry.se');
    messageInput?.setValue('Hello, I would love to ask about your delicious fermented soup mixes!');

    expect(component.contactForm.valid).toBeTrue();
  });

  it('should trigger submit success state on valid Web3Forms submission', () => {
    SHOPIFY_CONFIG.contactFormKey = 'test-web3-key';

    component.contactForm.get('name')?.setValue('Ella');
    component.contactForm.get('email')?.setValue('info@ellaspantry.se');
    component.contactForm.get('message')?.setValue('Hello, I would love to ask about your delicious fermented soup mixes!');

    component.onSubmit();
    expect(component.isSubmitting()).toBeTrue();

    const req = httpMock.expectOne('https://api.web3forms.com/submit');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.get('access_key')).toBe('test-web3-key');
    expect(req.request.body.get('name')).toBe('Ella');

    req.flush({ success: true });
    fixture.detectChanges();

    expect(component.isSubmitting()).toBeFalse();
    expect(component.submitSuccess()).toBeTrue();
    expect(component.submitError()).toBeFalse();
  });

  it('should trigger submit error state on failed Web3Forms submission', () => {
    SHOPIFY_CONFIG.contactFormKey = 'test-web3-key';

    component.contactForm.get('name')?.setValue('Ella');
    component.contactForm.get('email')?.setValue('info@ellaspantry.se');
    component.contactForm.get('message')?.setValue('Hello, I would love to ask about your delicious fermented soup mixes!');

    component.onSubmit();
    expect(component.isSubmitting()).toBeTrue();

    const req = httpMock.expectOne('https://api.web3forms.com/submit');
    req.flush({ success: false, message: 'Invalid API key' });
    fixture.detectChanges();

    expect(component.isSubmitting()).toBeFalse();
    expect(component.submitSuccess()).toBeFalse();
    expect(component.submitError()).toBeTrue();
    expect(component.submitErrorMessage()).toBe('Invalid API key');
  });
});
