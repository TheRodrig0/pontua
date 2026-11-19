---
name: seo-technical-audit
description: >-
  Audit and fix technical SEO, on-page structure, performance, social previews,
  and AI/LLM search visibility for websites and web apps—especially sites built
  with AI coding tools. Use when launching a site, debugging why Google or AI
  assistants do not index or show a site, or running an SEO checklist.
---

# Technical SEO & AI Search Audit

Execute this audit in strict priority order. **Block 1 is a hard prerequisite**: if search engines cannot crawl or index the site, Blocks 2 and 3 have zero effect.

## Block 1: Let Crawlers In (Highest Priority)

1. **Remove `noindex` tags:** Inspect HTML `<meta name="robots">`, framework config, and HTTP `X-Robots-Tag` headers. *Common trap:* many AI generators and starter templates leave `noindex` enabled by default, hiding the entire site from Google.
2. **Create `sitemap.xml`:** Expose all canonical public routes and keep it updated.
3. **Create `robots.txt`:** Allow crawling of public pages and reference the `sitemap.xml` URL.
4. **Force HTTPS:** Ensure all HTTP traffic redirects to `HTTPS` with valid SSL/TLS.

## Block 2: Help Crawlers Understand

5. **Single `<h1>` per page:** Use exactly one `<h1>` representing the main topic of each page.
6. **Heading hierarchy:** Nest headings logically (`<h1>` -> `<h2>` -> `<h3>`) without skipping levels.
7. **Meta `<title>`:** Unique, descriptive title per page.
8. **Meta `<meta name="description">`:** Unique, accurate summary per page.
9. **Canonical tags:** Add `<link rel="canonical" href="...">` to prevent duplicate-content issues.
10. **Clean URL slugs:** Use readable, lowercase, hyphen-separated paths without messy query parameters or IDs where avoidable.
11. **Internal links:** Connect related pages with descriptive anchor text so crawlers discover the full site graph.
12. **Fix broken links:** Eliminate `404` internal/external links and dead redirects.
13. **Image `alt` text:** Add descriptive `alt` attributes to all meaningful images.
14. **Schema markup (Structured Data):** Add JSON-LD (`schema.org`) so crawlers know whether a page is a Product, Article, Service, Organization, FAQ, etc.

## Block 3: Fast, Mobile-Ready & Shareable

15. **Compress images:** Use modern formats (WebP/AVIF) and appropriate dimensions.
16. **Core Web Vitals:** Optimize LCP, INP, and CLS so pages load fast and do not shift layout.
17. **Mobile responsiveness:** Verify layout, tap targets, and readability across mobile viewports.
18. **Open Graph (`og:image` & meta tags):** Add `og:title`, `og:description`, `og:image`, and `og:url` so links look professional (not broken) when shared on WhatsApp, Slack, or social media.
19. **Google Search Console:** Verify domain ownership and submit `sitemap.xml`.
20. **Backlink strategy:** Plan external links from relevant directories, partners, or content.

## Block 4: AI Search & LLM Crawler Visibility

- Many users now ask AI assistants instead of searching Google directly.
- Audit `robots.txt`, WAF/CDN rules (e.g., Cloudflare), and server headers to ensure AI/LLM search crawlers are **not** unintentionally blocked if the site should be discoverable by AI search.
- Verify that key product/service facts are rendered in crawlable HTML (not hidden behind client-only auth or empty JS shells).

## Verification

- [ ] No unintended `noindex` in HTML or response headers.
- [ ] `robots.txt` and `sitemap.xml` return `200 OK` and are valid.
- [ ] Every public page has 1 `<h1>`, valid heading order, `<title>`, `<meta name="description">`, `canonical`, and `og:image`.
- [ ] AI/LLM crawlers are not blocked unintentionally.
