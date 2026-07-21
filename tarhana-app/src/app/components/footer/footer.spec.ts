import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent, FormsModule],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
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

  it('should handle valid newsletter subscription', () => {
    component.email.set('test@example.com');
    component.subscribeNewsletter();
    expect(component.newsletterError()).toBeFalse();
    expect(component.newsletterSuccess()).toBeTrue();
    expect(component.email()).toBe('');
  });

  it('should render brand name and copyright info', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.font-display')?.textContent).toContain('Ella’s Pantry');
  });
});
