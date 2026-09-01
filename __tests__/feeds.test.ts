import { composeDiverseEdition, EDITION_SIZE } from '../src/domain/edition';
import { mergeCatalog, mapRssItem } from '../src/services/feeds/mapArticle';
import { parseFeedXml } from '../src/services/feeds/parseRss';
import type { FeedDef } from '../src/services/feeds/registry';
import type { Article } from '../src/types/models';

const RSS = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>Test</title>
    <item>
      <title><![CDATA[ Le grain avant le fil ]]></title>
      <link>https://example.test/grain</link>
      <guid>https://example.test/grain</guid>
      <description><![CDATA[ <p>Un chapeau, pas un KPI.</p> ]]></description>
      <pubDate>Tue, 01 Sep 2026 12:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

const feed: FeedDef = {
  id: 'test',
  url: 'https://example.test/rss',
  section: 'programmation',
  region: 'TECH',
  source: 'Exemple',
  limit: 4,
};

const essay = (id: string, section: Article['section']): Article => ({
  id,
  slug: id,
  title: `Essai ${id}`,
  dek: 'Texte éditorial, sans chiffre inventé.',
  body: 'Paragraphe.\n\nAutre paragraphe.',
  section,
  publishedAt: '2026-08-01T12:00:00.000Z',
  readingMinutes: 5,
  source: 'Cabinet',
  region: 'TECH',
  keywords: [],
  origin: 'editorial',
});

describe('flux RSS', () => {
  it('parse un item Radio-Canada-like', () => {
    const [item] = parseFeedXml(RSS);
    expect(item.title).toBe('Le grain avant le fil');
    expect(item.link).toContain('example.test');
    expect(item.summary).toContain('chapeau');
    expect(item.summary).not.toMatch(/<p>/);
  });

  it('mappe vers Article sans inventer un corps', () => {
    const [item] = parseFeedXml(RSS);
    const article = mapRssItem(item, feed);
    expect(article?.origin).toBe('rss');
    expect(article?.id.startsWith('rss:test:')).toBe(true);
    expect(article?.canonicalUrl).toBe('https://example.test/grain');
    expect(article?.body).toContain('Source : Exemple');
    expect(article?.body).not.toMatch(/\d+\s*%/);
  });

  it('merge ne laisse pas un RSS écraser un essai a-01', () => {
    const editorial = [essay('a-01', 'philosophie')];
    const rss = mapRssItem(parseFeedXml(RSS)[0], feed);
    const merged = mergeCatalog(editorial, rss ? [rss] : []);
    expect(merged.find(a => a.id === 'a-01')?.title).toBe('Essai a-01');
    expect(merged.some(a => a.origin === 'rss')).toBe(true);
  });

  it('édition diverse tient 10 et mélange les étagères', () => {
    const rss: Article[] = [
      {
        id: 'rss:qc',
        slug: 'qc',
        title: 'Titre Québec assez long',
        dek: 'Chapeau.',
        body: 'Chapeau.',
        section: 'nouvelles_quebecoises',
        publishedAt: '2026-09-01T15:00:00.000Z',
        readingMinutes: 3,
        source: 'RC',
        region: 'QC',
        keywords: [],
        origin: 'rss',
      },
      {
        id: 'rss:code',
        slug: 'code',
        title: 'Titre code assez long',
        dek: 'Chapeau.',
        body: 'Chapeau.',
        section: 'programmation',
        publishedAt: '2026-09-01T14:00:00.000Z',
        readingMinutes: 3,
        source: 'HN',
        region: 'TECH',
        keywords: [],
        origin: 'rss',
      },
    ];
    const mixed = [...rss, essay('a-01', 'philosophie'), essay('a-04', 'intelligence_affaires')];
    const edition = composeDiverseEdition(mixed, '2026-09-01');
    expect(edition).toHaveLength(Math.min(EDITION_SIZE, mixed.length));
    expect(edition.map(a => a.id)).toContain('rss:qc');
    expect(edition.map(a => a.id)).toContain('rss:code');
  });
});
