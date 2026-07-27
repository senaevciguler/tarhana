import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MascotComponent } from './mascot';
import { By } from '@angular/platform-browser';

describe('MascotComponent', () => {
  let component: MascotComponent;
  let fixture: ComponentFixture<MascotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MascotComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MascotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the mascot component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the default image and alt text', () => {
    const imgEl = fixture.debugElement.query(By.css('img')).nativeElement as HTMLImageElement;
    expect(imgEl.src).toContain('/assets/figur.png');
    expect(imgEl.alt).toBe('Ella Mascot');
  });

  it('should support dynamic size changes', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const containerEl = fixture.debugElement.query(By.css('div')).nativeElement as HTMLDivElement;
    expect(containerEl.className).toContain('w-36');
    expect(containerEl.className).toContain('h-36');

    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();
    expect(containerEl.className).toContain('w-16');
    expect(containerEl.className).toContain('h-16');
  });

  it('should apply proper animation classes', () => {
    fixture.componentRef.setInput('animate', 'float');
    fixture.detectChanges();
    const imgEl = fixture.debugElement.query(By.css('img')).nativeElement as HTMLImageElement;
    expect(imgEl.className).toContain('animate-mascot-float');

    fixture.componentRef.setInput('animate', 'breath');
    fixture.detectChanges();
    expect(imgEl.className).toContain('animate-mascot-breath');
  });

  it('should respect alignment changes', () => {
    fixture.componentRef.setInput('align', 'center');
    fixture.detectChanges();
    const containerEl = fixture.debugElement.query(By.css('div')).nativeElement as HTMLDivElement;
    expect(containerEl.className).toContain('mx-auto');
  });
});
