import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
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
    // We expect the translation key or the translated text.
    // Since we are not providing real translations in this test yet, it will return the key.
    // However, if we want to be robust, we can check for the key.
    expect(compiled.querySelector('h1')?.textContent).toContain('HOME.HERO.TITLE');
  });

  it('should display the Not only soup section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const headings = Array.from(compiled.querySelectorAll('h2'));
    const hasNotOnlySoup = headings.some((h) => h.textContent?.includes('HOME.VERSATILITY.TITLE'));
    expect(hasNotOnlySoup).toBeTrue();
  });
});
