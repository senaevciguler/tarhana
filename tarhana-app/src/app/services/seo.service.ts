import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);

  /**
   * Updates all relevant SEO elements for a page.
   * @param config SEO configuration for the page.
   */
  updateMetaTags(config: {
    title: string;
    description: string;
    image?: string;
    url?: string;
    type?: string;
    schema?: any;
  }) {
    // 1. Dynamic Title
    this.titleService.setTitle(config.title);

    // 2. Meta Description
    this.metaService.updateTag({ name: 'description', content: config.description });

    // 3. Open Graph Tags
    this.metaService.updateTag({ property: 'og:title', content: config.title });
    this.metaService.updateTag({ property: 'og:description', content: config.description });
    this.metaService.updateTag({ property: 'og:type', content: config.type || 'website' });

    const currentUrl = config.url || this.document.URL;
    this.metaService.updateTag({ property: 'og:url', content: currentUrl });

    if (config.image) {
      this.metaService.updateTag({ property: 'og:image', content: config.image });
    } else {
      // Fallback or remove
      this.metaService.removeTag("property='og:image'");
    }

    // 4. Canonical URL
    this.updateCanonicalUrl(currentUrl);

    // 5. Product or Custom Schema JSON-LD
    this.updateSchema(config.schema);
  }

  private updateCanonicalUrl(url: string) {
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private updateSchema(schema: any) {
    // Clean up existing schema scripts to avoid duplicates/stale data across navigations
    const existingScripts = this.document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    if (schema) {
      const script = this.document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.text = JSON.stringify(schema);
      this.document.head.appendChild(script);
    }
  }
}
