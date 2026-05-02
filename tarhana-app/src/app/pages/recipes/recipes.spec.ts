import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecipesComponent } from './recipes';
import { provideRouter } from '@angular/router';

describe('RecipesComponent', () => {
  let component: RecipesComponent;
  let fixture: ComponentFixture<RecipesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipesComponent],
      providers: [provideRouter([]), provideHttpClient()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a list of recipes', () => {
    expect(component.recipes.length).toBe(5);
  });

  it('should open a recipe modal', () => {
    const recipe = component.recipes[0];
    component.openRecipe(recipe);
    expect(component.selectedRecipe).toEqual(recipe);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should close the recipe modal', () => {
    component.openRecipe(component.recipes[0]);
    component.closeRecipe();
    expect(component.selectedRecipe).toBeNull();
    expect(document.body.style.overflow).toBe('auto');
  });
});
