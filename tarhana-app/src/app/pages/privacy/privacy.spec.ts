import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PrivacyComponent } from './privacy';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PrivacyComponent', () => {
  let component: PrivacyComponent;
  let fixture: ComponentFixture<PrivacyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyComponent, HttpClientTestingModule],
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

    fixture = TestBed.createComponent(PrivacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
