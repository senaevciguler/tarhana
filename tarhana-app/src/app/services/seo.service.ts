import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);

  /**
   * Update the document title, meta description, Open Graph tags, and canonical URL.
   */
  updateMeta(title: string, description: string, image?: string, type = 'website') {
    // 1. Title
    this.titleService.setTitle(title);

    // 2. Meta description
    this.metaService.updateTag({ name: 'description', content: description });

    // 3. Open Graph Tags
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const defaultImage = typeof window !== 'undefined' ? `${window.location.origin}/assets/hero-tarhana-soup.png` : '';
    const imageUrl = image || defaultImage;

    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    if (url) {
      this.metaService.updateTag({ property: 'og:url', content: url });
    }
    this.metaService.updateTag({ property: 'og:type', content: type });
    if (imageUrl) {
      this.metaService.updateTag({ property: 'og:image', content: imageUrl });
    }
  }

  /**
   * Update canonical link tag.
   */
  updateCanonical(customUrl?: string) {
    const url = customUrl || (typeof window !== 'undefined' ? window.location.href : '');
    if (!url) return;

    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  /**
   * Inject/Update dynamic script JSON-LD schema tag in the head.
   */
  updateJsonLd(schema: any) {
    let script: HTMLScriptElement | null = this.document.querySelector('script[type="application/ld+json"]');
    if (schema) {
      if (!script) {
        script = this.document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        this.document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema, null, 2);
    } else {
      if (script) {
        script.remove();
      }
    }
  }
}
