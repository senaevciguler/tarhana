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

  it('should apply proper animation classes', () => {
    fixture.componentRef.setInput('animation', 'breath');
    fixture.detectChanges();
    const imgEl = fixture.debugElement.query(By.css('img')).nativeElement as HTMLImageElement;
    expect(imgEl.className).toContain('animate-ella-breath');

    fixture.componentRef.setInput('animation', 'rotate');
    fixture.detectChanges();
    expect(imgEl.className).toContain('animate-ella-rotate');
  });

  it('should apply floating animation class when floating is true', () => {
    fixture.componentRef.setInput('floating', true);
    fixture.detectChanges();
    const imgEl = fixture.debugElement.query(By.css('img')).nativeElement as HTMLImageElement;
    expect(imgEl.className).toContain('animate-ella-float');
  });

  it('should respect alignment changes', () => {
    fixture.componentRef.setInput('alignment', 'center');
    fixture.detectChanges();
    const containerEl = fixture.debugElement.query(By.css('div')).nativeElement as HTMLDivElement;
    expect(containerEl.className).toContain('mx-auto');
  });
});
