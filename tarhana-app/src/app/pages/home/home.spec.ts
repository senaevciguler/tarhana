import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home';
import { provideRouter } from '@angular/router';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([])]
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

  it('should display the Not only soup section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const headings = Array.from(compiled.querySelectorAll('h2'));
    const hasNotOnlySoup = headings.some((h) => h.textContent?.includes('Not only soup!'));
    expect(hasNotOnlySoup).toBeTrue();
  });
});
