import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecipeMediaComponent, Recipe } from './recipe-media';
import { provideHttpClient } from '@angular/common/http';
import { LanguageService } from '../../services/language.service';
import { By } from '@angular/platform-browser';

describe('RecipeMediaComponent', () => {
  let component: RecipeMediaComponent;
  let fixture: ComponentFixture<RecipeMediaComponent>;
  let langService: LanguageService;

  const mockRecipeWithVideo: Recipe = {
    id: 1,
    titleKey: 'RECIPES_CARD1_TITLE',
    descKey: 'RECIPES_CARD1_DESC',
    ingredientsKey: 'RECIPES_CARD1_INGREDIENTS',
    stepsKey: 'RECIPES_CARD1_STEPS',
    servingKey: 'RECIPES_CARD1_SERVING',
    timeKey: 'RECIPES_TIME_10',
    difficultyKey: 'RECIPES_EASY',
    servingsKey: 'RECIPES_SERVINGS_1',
    image: '/assets/hero-tarhana-soup.png',
    videos: {
      en: 'https://cdn.shopify.com/videos/c/o/v/en-video.mp4',
      sv: 'https://cdn.shopify.com/videos/c/o/v/sv-video.mp4'
    },
    posters: {
      en: '/assets/en-poster.png',
      sv: '/assets/sv-poster.png'
    }
  };

  const mockRecipeWithoutVideo: Recipe = {
    id: 2,
    titleKey: 'RECIPES_CARD4_TITLE',
    descKey: 'RECIPES_CARD4_DESC',
    ingredientsKey: 'RECIPES_CARD4_INGREDIENTS',
    stepsKey: 'RECIPES_CARD4_STEPS',
    servingKey: 'RECIPES_CARD4_SERVING',
    timeKey: 'RECIPES_TIME_30',
    difficultyKey: 'RECIPES_EASY',
    servingsKey: 'RECIPES_SERVINGS_4',
    image: '/assets/tarhana-bread.png'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeMediaComponent],
      providers: [provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeMediaComponent);
    component = fixture.componentInstance;
    langService = TestBed.inject(LanguageService);
  });

  it('should create', () => {
    component.recipe = mockRecipeWithVideo;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should resolve correct video and poster according to current language', () => {
    component.recipe = mockRecipeWithVideo;

    // Test Swedish
    langService.setLanguage('SV');
    fixture.detectChanges();
    expect(component.getActiveVideo()).toBe('https://cdn.shopify.com/videos/c/o/v/sv-video.mp4');
    expect(component.getActivePoster()).toBe('/assets/sv-poster.png');

    // Test English
    langService.setLanguage('EN');
    fixture.detectChanges();
    expect(component.getActiveVideo()).toBe('https://cdn.shopify.com/videos/c/o/v/en-video.mp4');
    expect(component.getActivePoster()).toBe('/assets/en-poster.png');
  });

  it('should fallback to image when no video is configured', () => {
    component.recipe = mockRecipeWithoutVideo;
    fixture.detectChanges();

    expect(component.getActiveVideo()).toBeUndefined();
    expect(component.getActivePoster()).toBeUndefined();

    const imgEl = fixture.debugElement.query(By.css('img'));
    expect(imgEl).toBeTruthy();
    expect(imgEl.nativeElement.getAttribute('src')).toBe('/assets/tarhana-bread.png');
  });

  it('should display poster initially and show play button overlay', () => {
    component.recipe = mockRecipeWithVideo;
    fixture.detectChanges();

    const videoEl = fixture.debugElement.query(By.css('video'));
    expect(videoEl).toBeTruthy();
    expect(component.showPlayButton()).toBeTrue();
    expect(component.showControls()).toBeFalse();

    const playButton = fixture.debugElement.query(By.css('button[aria-label="Play video"]'));
    expect(playButton).toBeTruthy();
  });

  it('should start playback, hide overlay play button and show controls on play', () => {
    component.recipe = mockRecipeWithVideo;
    fixture.detectChanges();

    spyOn(component, 'startPlayback').and.callThrough();
    const playButton = fixture.debugElement.query(By.css('button[aria-label="Play video"]'));
    playButton.nativeElement.click();
    fixture.detectChanges();

    expect(component.startPlayback).toHaveBeenCalled();
  });

  it('should reset playback state when language is changed', () => {
    component.recipe = mockRecipeWithVideo;
    fixture.detectChanges();

    // Set playing states manually to simulate video playing
    component.showPlayButton.set(false);
    component.showControls.set(true);
    component.isPlaying.set(true);

    // Trigger language change
    langService.setLanguage('SV');
    fixture.detectChanges();

    // Expect states to reset
    expect(component.showPlayButton()).toBeTrue();
    expect(component.showControls()).toBeFalse();
    expect(component.isPlaying()).toBeFalse();
  });

  it('should keep native controls and hide play button on pause', () => {
    component.recipe = mockRecipeWithVideo;
    fixture.detectChanges();

    // Simulate play start
    component.onVideoPlay();
    expect(component.showPlayButton()).toBeFalse();
    expect(component.showControls()).toBeTrue();
    expect(component.isPlaying()).toBeTrue();

    // Simulate pause (manual pause)
    component.onVideoPause();
    // Native controls stay visible, play button overlay is not shown again
    expect(component.showPlayButton()).toBeFalse();
    expect(component.showControls()).toBeTrue();
    expect(component.isPlaying()).toBeFalse();
  });

  it('should reset video and display play button again on ended', () => {
    component.recipe = mockRecipeWithVideo;
    fixture.detectChanges();

    // Simulate play
    component.onVideoPlay();

    // Simulate ended
    component.onVideoEnded();
    expect(component.showPlayButton()).toBeTrue();
    expect(component.showControls()).toBeFalse();
    expect(component.isPlaying()).toBeFalse();
  });
});
