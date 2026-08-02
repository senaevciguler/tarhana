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
    expect(component.recipes.length).toBe(3);
  });

  it('should have videos defined for the first recipe and undefined for others', () => {
    expect(component.recipes[0].videos?.en).toBe('https://cdn.shopify.com/videos/c/o/v/aa10862f880b4990a63d5cd5aaa17a12.mp4');
    expect(component.recipes[1].videos).toBeUndefined();
    expect(component.recipes[2].videos).toBeUndefined();
  });

  it('should have gridRecipes filtered down to 2 recipes', () => {
    expect(component.gridRecipes.length).toBe(2);
    expect(component.gridRecipes[0].titleKey).toBe('RECIPES_CARD4_TITLE'); // Tarhana Bread
    expect(component.gridRecipes[1].titleKey).toBe('RECIPES_CARD5_TITLE'); // Tarhana Chips
  });

  it('should have the featured hero recipe as the first item in the main array', () => {
    expect(component.recipes[0].titleKey).toBe('RECIPES_CARD1_TITLE'); // Traditional Tarhana Soup
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

  it('should pause the video when opening recipe modal', () => {
    const mockMediaComponent = jasmine.createSpyObj('RecipeMediaComponent', ['pause']);
    component.featuredMedia = mockMediaComponent;

    component.openRecipe(component.recipes[0]);
    expect(mockMediaComponent.pause).toHaveBeenCalled();
  });
});
