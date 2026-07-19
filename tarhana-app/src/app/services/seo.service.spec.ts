import { TestBed } from '@angular/core/testing';
import { SeoService } from './seo.service';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

describe('SeoService', () => {
  let service: SeoService;
  let titleService: Title;
  let metaService: Meta;
  let dom: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SeoService,
        Title,
        Meta
      ]
    });

    service = TestBed.inject(SeoService);
    titleService = TestBed.inject(Title);
    metaService = TestBed.inject(Meta);
    dom = TestBed.inject(DOCUMENT);

    // Clean up any dynamically added scripts/links from other tests to have a pristine state
    dom.querySelectorAll('script[type="application/ld+json"]').forEach(s => s.remove());
    dom.querySelectorAll('link[rel="canonical"]').forEach(l => l.remove());
  });

  afterEach(() => {
    // Clean up after each test
    dom.querySelectorAll('script[type="application/ld+json"]').forEach(s => s.remove());
    dom.querySelectorAll('link[rel="canonical"]').forEach(l => l.remove());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update document title and description', () => {
    spyOn(titleService, 'setTitle').and.callThrough();
    spyOn(metaService, 'updateTag').and.callThrough();

    const title = 'Test Title | Ella’s Pantry';
    const description = 'Test description of the delicious fermented soup mix.';

    service.updateMetaTags({ title, description });

    expect(titleService.setTitle).toHaveBeenCalledWith(title);
    expect(metaService.updateTag).toHaveBeenCalledWith({ name: 'description', content: description });
  });

  it('should update Open Graph tags correctly', () => {
    spyOn(metaService, 'updateTag').and.callThrough();

    const config = {
      title: 'OG Title',
      description: 'OG Description',
      image: 'https://example.com/image.jpg',
      url: 'https://example.com/test-page',
      type: 'article'
    };

    service.updateMetaTags(config);

    expect(metaService.updateTag).toHaveBeenCalledWith({ property: 'og:title', content: config.title });
    expect(metaService.updateTag).toHaveBeenCalledWith({ property: 'og:description', content: config.description });
    expect(metaService.updateTag).toHaveBeenCalledWith({ property: 'og:type', content: config.type });
    expect(metaService.updateTag).toHaveBeenCalledWith({ property: 'og:url', content: config.url });
    expect(metaService.updateTag).toHaveBeenCalledWith({ property: 'og:image', content: config.image });
  });

  it('should add and update canonical URL in head', () => {
    const canonicalUrl1 = 'https://example.com/first-url';
    const canonicalUrl2 = 'https://example.com/second-url';

    service.updateMetaTags({ title: 'T', description: 'D', url: canonicalUrl1 });
    let canonicalLink = dom.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    expect(canonicalLink).toBeTruthy();
    expect(canonicalLink.getAttribute('href')).toBe(canonicalUrl1);

    // Update with second URL and check if it gets updated instead of adding a new one
    service.updateMetaTags({ title: 'T', description: 'D', url: canonicalUrl2 });
    const allCanonicalLinks = dom.querySelectorAll('link[rel="canonical"]');
    expect(allCanonicalLinks.length).toBe(1);
    expect(allCanonicalLinks[0].getAttribute('href')).toBe(canonicalUrl2);
  });

  it('should dynamically insert and update JSON-LD schema script tags', () => {
    const schemaObj = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': 'Test Product'
    };

    service.updateMetaTags({ title: 'T', description: 'D', schema: schemaObj });

    let schemaScripts = dom.querySelectorAll('script[type="application/ld+json"]');
    expect(schemaScripts.length).toBe(1);
    expect(schemaScripts[0].textContent).toContain('Test Product');

    // Update schema object and verify old is replaced by the new one
    const newSchemaObj = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': 'Awesome Fermented Soup'
    };

    service.updateMetaTags({ title: 'T', description: 'D', schema: newSchemaObj });

    schemaScripts = dom.querySelectorAll('script[type="application/ld+json"]');
    expect(schemaScripts.length).toBe(1);
    expect(schemaScripts[0].textContent).toContain('Awesome Fermented Soup');
    expect(schemaScripts[0].textContent).not.toContain('Test Product');
  });
});
