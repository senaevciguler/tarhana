import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TermsComponent } from './terms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('TermsComponent', () => {
  let component: TermsComponent;
  let fixture: ComponentFixture<TermsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermsComponent, HttpClientTestingModule],
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

    fixture = TestBed.createComponent(TermsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
