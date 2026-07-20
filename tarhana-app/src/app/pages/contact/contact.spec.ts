import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { ContactComponent } from './contact';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;

  beforeEach(async () => {
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
    fixture.detectChanges();
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

  it('should trigger submit success state on valid form submission', fakeAsync(() => {
    component.contactForm.get('name')?.setValue('Ella');
    component.contactForm.get('email')?.setValue('info@ellaspantry.se');
    component.contactForm.get('message')?.setValue('Hello, I would love to ask about your delicious fermented soup mixes!');

    component.onSubmit();
    expect(component.isSubmitting()).toBeTrue();

    tick(1200);
    fixture.detectChanges();

    expect(component.isSubmitting()).toBeFalse();
    expect(component.submitSuccess()).toBeTrue();
  }));
});
