import { CATALOG } from '../src/data/articles';
import { filterArticles, normalizeQuery } from '../src/domain/search';

describe('recherche', () => {
  it('ignore les accents', () => {
    expect(normalizeQuery('Québec')).toBe('quebec');
  });

  it('filtre par rubrique', () => {
    const hits = filterArticles(CATALOG, '', 'philosophie');
    expect(hits.every(a => a.section === 'philosophie')).toBe(true);
    expect(hits.length).toBeGreaterThan(0);
  });

  it('trouve Nectari via le mot Netari', () => {
    const hits = filterArticles(CATALOG, 'netari');
    expect(hits.some(a => a.section === 'nectari')).toBe(true);
  });

  it('ne mélange pas une rubrique étrangère', () => {
    expect(filterArticles(CATALOG, 'hip-hop', 'sage_x3')).toHaveLength(0);
  });
});
