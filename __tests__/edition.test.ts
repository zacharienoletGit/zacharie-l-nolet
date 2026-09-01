import { CATALOG } from '../src/data/articles';
import {
  EDITION_SIZE,
  articlesForEdition,
  buildEdition,
  fallbackEdition,
  hash32,
} from '../src/domain/edition';

describe('édition du jour', () => {
  it('tient exactement dix textes pour le 1er septembre 2026', () => {
    const edition = buildEdition(CATALOG, '2026-09-01');
    expect(edition.articleIds).toHaveLength(EDITION_SIZE);
    expect(articlesForEdition(CATALOG, edition)).toHaveLength(EDITION_SIZE);
  });

  it('respecte le rang éditorial', () => {
    const items = articlesForEdition(CATALOG, buildEdition(CATALOG, '2026-09-01'));
    expect(items.map(a => a.id)).toEqual([
      'a-01',
      'a-02',
      'a-03',
      'a-04',
      'a-05',
      'a-06',
      'a-07',
      'a-08',
      'a-09',
      'a-10',
    ]);
  });

  it('le repli est déterministe', () => {
    const a = fallbackEdition(CATALOG, '2026-09-02').map(x => x.id);
    const b = fallbackEdition(CATALOG, '2026-09-02').map(x => x.id);
    expect(a).toEqual(b);
    expect(a).toHaveLength(EDITION_SIZE);
  });

  it('hash32 est stable', () => {
    expect(hash32('zln')).toBe(hash32('zln'));
    expect(hash32('a')).not.toBe(hash32('b'));
  });
});
