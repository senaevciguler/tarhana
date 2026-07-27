import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
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
    // Flush any residual translation requests that may have been triggered
    const translateRequests = httpMock.match(req => req.url.startsWith('/assets/i18n/'));
    translateRequests.forEach(req => req.flush({}));

    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render brand name and copyright info', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.font-display')?.textContent).toContain('Ella’s Pantry');
  });
});
