import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { By } from '@angular/platform-browser';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with mobile menu closed', () => {
    expect(component.isMenuOpen()).toBeFalse();
  });

  it('should toggle mobile menu open and closed', () => {
    component.toggleMenu();
    expect(component.isMenuOpen()).toBeTrue();
    expect(document.body.style.overflow).toBe('hidden');

    component.toggleMenu();
    expect(component.isMenuOpen()).toBeFalse();
    expect(document.body.style.overflow).toBe('');
  });

  it('should close mobile menu on closeMenu() call', () => {
    component.isMenuOpen.set(true);
    document.body.style.overflow = 'hidden';

    component.closeMenu();
    expect(component.isMenuOpen()).toBeFalse();
    expect(document.body.style.overflow).toBe('');
  });

  it('should toggle menu when hamburger button is clicked', () => {
    spyOn(component, 'toggleMenu').and.callThrough();
    fixture.detectChanges();

    const hamburgerButton = fixture.debugElement.query(By.css('button[aria-controls="mobile-menu"]'));
    expect(hamburgerButton).toBeTruthy();

    hamburgerButton.nativeElement.click();
    fixture.detectChanges();

    expect(component.toggleMenu).toHaveBeenCalled();
    expect(component.isMenuOpen()).toBeTrue();
  });

  it('should close menu when mobile navigation links are clicked', () => {
    spyOn(component, 'closeMenu').and.callThrough();
    component.isMenuOpen.set(true);
    fixture.detectChanges();

    // Select first link inside mobile menu container
    const mobileMenuLinks = fixture.debugElement.queryAll(By.css('#mobile-menu a'));
    expect(mobileMenuLinks.length).toBeGreaterThan(0);

    mobileMenuLinks[0].nativeElement.click();
    fixture.detectChanges();

    expect(component.closeMenu).toHaveBeenCalled();
    expect(component.isMenuOpen()).toBeFalse();
  });

  it('should close menu and open cart when cart option inside mobile menu is clicked', () => {
    spyOn(component, 'closeMenu').and.callThrough();
    spyOn(component, 'toggleCart').and.callThrough();
    component.isMenuOpen.set(true);
    fixture.detectChanges();

    // Select the cart button inside mobile-menu
    const cartButton = fixture.debugElement.query(By.css('#mobile-menu button[aria-label="Öppna varukorg"], #mobile-menu button[aria-label="Open cart"]'));
    expect(cartButton).toBeTruthy();

    cartButton.nativeElement.click();
    fixture.detectChanges();

    expect(component.closeMenu).toHaveBeenCalled();
    expect(component.toggleCart).toHaveBeenCalled();
    expect(component.isMenuOpen()).toBeFalse();
  });
});
