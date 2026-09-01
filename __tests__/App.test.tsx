import { CATALOG } from '../src/data/articles';
import { SAMPLE_BOOKMARK, SAMPLE_NOTE } from '../src/data/samples';

/**
 * Le montage de <App /> exige Navigation + native modules.
 * Le contrat se teste ici ; les écrans se testent à la main / Detox.
 */
describe('contrats de démo', () => {
  it('chaque article a un grain lisible', () => {
    for (const article of CATALOG) {
      expect(article.id).toBeTruthy();
      expect(article.title.length).toBeGreaterThan(8);
      expect(article.dek.length).toBeGreaterThan(12);
      expect(article.body.split('\n\n').length).toBeGreaterThan(1);
      expect(article.readingMinutes).toBeGreaterThan(0);
    }
  });

  it('les exemples de classeur respectent le contrat', () => {
    expect(SAMPLE_NOTE.articleId).toBe('a-01');
    expect(SAMPLE_BOOKMARK.articleId).toBe('a-01');
  });
});
