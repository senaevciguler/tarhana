import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EllaCharacterComponent } from './ella-character';
import { By } from '@angular/platform-browser';

describe('EllaCharacterComponent', () => {
  let component: EllaCharacterComponent;
  let fixture: ComponentFixture<EllaCharacterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EllaCharacterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EllaCharacterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the Ella character component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the default image and alt text', () => {
    const imgEl = fixture.debugElement.query(By.css('img')).nativeElement as HTMLImageElement;
    expect(imgEl.src).toContain('/assets/ella-character.png');
    expect(imgEl.alt).toBe('Ella Mascot');
  });

  it('should support dynamic size changes', () => {
    fixture.componentRef.setInput('size', 'large');
    fixture.detectChanges();
    const containerEl = fixture.debugElement.query(By.css('div')).nativeElement as HTMLDivElement;
    expect(containerEl.className).toContain('w-44');
    expect(containerEl.className).toContain('h-44');

    fixture.componentRef.setInput('size', 'small');
    fixture.detectChanges();
    expect(containerEl.className).toContain('w-16');
    expect(containerEl.className).toContain('h-16');
  });

  it('should apply proper entry animation classes on the entry wrapper layer', () => {
    component.isVisible.set(true);
    fixture.componentRef.setInput('animation', 'fade');
    fixture.detectChanges();
    const entryEl = fixture.debugElement.queryAll(By.css('div'))[1].nativeElement as HTMLDivElement;
    expect(entryEl.className).toContain('animate-ella-fade');
  });

  it('should apply proper looping animation classes on the loop wrapper layer', () => {
    fixture.componentRef.setInput('animation', 'idle');
    fixture.detectChanges();
    const loopEl = fixture.debugElement.queryAll(By.css('div'))[2].nativeElement as HTMLDivElement;
    expect(loopEl.className).toContain('animate-ella-idle');

    fixture.componentRef.setInput('animation', 'float');
    fixture.detectChanges();
    expect(loopEl.className).toContain('animate-ella-float');
  });

  it('should apply floating animation class when floating is true', () => {
    fixture.componentRef.setInput('floating', true);
    fixture.detectChanges();
    const loopEl = fixture.debugElement.queryAll(By.css('div'))[2].nativeElement as HTMLDivElement;
    expect(loopEl.className).toContain('animate-ella-float');
  });

  it('should respect alignment changes', () => {
    fixture.componentRef.setInput('alignment', 'center');
    fixture.detectChanges();
    const containerEl = fixture.debugElement.query(By.css('div')).nativeElement as HTMLDivElement;
    expect(containerEl.className).toContain('mx-auto');
  });

  it('should apply custom hover scale and rotate transition classes on image element', () => {
    fixture.componentRef.setInput('hoverEffect', true);
    fixture.detectChanges();
    const imgEl = fixture.debugElement.query(By.css('img')).nativeElement as HTMLImageElement;
    expect(imgEl.className).toContain('hover:scale-[1.02]');
    expect(imgEl.className).toContain('hover:rotate-[1deg]');
  });

  it('should resolve different poses to correct URLs', () => {
    fixture.componentRef.setInput('pose', 'cooking');
    fixture.detectChanges();
    const imgEl = fixture.debugElement.query(By.css('img')).nativeElement as HTMLImageElement;
    expect(imgEl.src).toContain('/assets/pose1.png');

    fixture.componentRef.setInput('pose', 'standing-soup');
    fixture.detectChanges();
    const imgEl2 = fixture.debugElement.query(By.css('img')).nativeElement as HTMLImageElement;
    expect(imgEl2.src).toContain('/assets/fullFigure.png');
  });
});
