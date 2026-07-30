import { TestBed, ComponentFixture } from '@angular/core/testing';
import { EllaTipComponent } from './ella-tip';
import { LanguageService } from '../../services/language.service';
import { signal } from '@angular/core';

describe('EllaTipComponent', () => {
  let component: EllaTipComponent;
  let fixture: ComponentFixture<EllaTipComponent>;
  let mockLanguageService: jasmine.SpyObj<LanguageService>;
  const mockLanguageSignal = signal<'EN' | 'SV'>('EN');

  beforeEach(async () => {
    mockLanguageService = jasmine.createSpyObj('LanguageService', ['language', 'translate']);
    Object.defineProperty(mockLanguageService, 'language', { value: mockLanguageSignal });

    await TestBed.configureTestingModule({
      imports: [EllaTipComponent],
      providers: [
        { provide: LanguageService, useValue: mockLanguageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EllaTipComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display English tip text by default when language is EN', () => {
    mockLanguageSignal.set('EN');
    component.tipEn = 'English tip';
    component.tipSv = 'Swedish tip';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const h4 = compiled.querySelector('h4');
    const p = compiled.querySelector('p');

    expect(h4?.textContent?.trim()).toBe("Ella's Tip");
    expect(p?.textContent?.trim()).toContain('English tip');
  });

  it('should display Swedish tip text when language is SV', () => {
    mockLanguageSignal.set('SV');
    component.tipEn = 'English tip';
    component.tipSv = 'Swedish tip';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const h4 = compiled.querySelector('h4');
    const p = compiled.querySelector('p');

    expect(h4?.textContent?.trim()).toBe('Ellas Tips');
    expect(p?.textContent?.trim()).toContain('Swedish tip');
  });
});
