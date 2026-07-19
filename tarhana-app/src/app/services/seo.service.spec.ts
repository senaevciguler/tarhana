import { TestBed } from '@angular/core/testing';
import { SeoService } from './seo.service';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

describe('SeoService', () => {
  let service: SeoService;
  let titleService: Title;
  let metaService: Meta;
  let doc: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SeoService, Title, Meta]
    });
    service = TestBed.inject(SeoService);
    titleService = TestBed.inject(Title);
    metaService = TestBed.inject(Meta);
    doc = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    const links = doc.querySelectorAll('link[rel="canonical"]');
    links.forEach(link => link.remove());

    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach(script => script.remove());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update dynamic title and description meta', () => {
    const testTitle = 'Test Title - Ella’s Pantry';
    const testDesc = 'Test description of Ella’s Pantry product.';

    service.updateMeta(testTitle, testDesc);

    expect(titleService.getTitle()).toBe(testTitle);

    const descMeta = metaService.getTag('name="description"');
    expect(descMeta).toBeTruthy();
    expect(descMeta?.content).toBe(testDesc);
  });

  it('should update Open Graph tags', () => {
    const testTitle = 'OG Title';
    const testDesc = 'OG Description';
    const testImage = 'https://example.com/test-img.png';

    service.updateMeta(testTitle, testDesc, testImage, 'product');

    const ogTitle = metaService.getTag('property="og:title"');
    expect(ogTitle?.content).toBe(testTitle);

    const ogDesc = metaService.getTag('property="og:description"');
    expect(ogDesc?.content).toBe(testDesc);

    const ogType = metaService.getTag('property="og:type"');
    expect(ogType?.content).toBe('product');

    const ogImage = metaService.getTag('property="og:image"');
    expect(ogImage?.content).toBe(testImage);
  });

  it('should create and update canonical URL link tag', () => {
    const testUrl1 = 'https://example.com/page1';
    const testUrl2 = 'https://example.com/page2';

    let canonicalLink = doc.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonicalLink) {
      canonicalLink.remove();
    }

    service.updateCanonical(testUrl1);
    canonicalLink = doc.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    expect(canonicalLink).toBeTruthy();
    expect(canonicalLink.getAttribute('href')).toBe(testUrl1);

    service.updateCanonical(testUrl2);
    canonicalLink = doc.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    expect(canonicalLink).toBeTruthy();
    expect(canonicalLink.getAttribute('href')).toBe(testUrl2);
  });

  it('should inject, update and remove JSON-LD schema script', () => {
    const schema1 = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Test product"
    };
    const schema2 = {
      "@context": "https://schema.org",
      "@type": "ItemList"
    };

    let script = doc.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
    if (script) {
      script.remove();
    }

    service.updateJsonLd(schema1);
    script = doc.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
    expect(script).toBeTruthy();
    expect(JSON.parse(script.textContent || '{}')).toEqual(schema1);

    service.updateJsonLd(schema2);
    script = doc.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
    expect(script).toBeTruthy();
    expect(JSON.parse(script.textContent || '{}')).toEqual(schema2);

    service.updateJsonLd(null);
    script = doc.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
    expect(script).toBeNull();
  });
});
