import type { Article, SectionId } from '../types/models';
import { SECTIONS } from '../data/sections';

export function normalizeQuery(query: string): string {
  return query
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function filterArticles(
  articles: Article[],
  query: string,
  section?: SectionId,
): Article[] {
  const q = normalizeQuery(query);
  return articles.filter(article => {
    if (section && article.section !== section) {
      return false;
    }
    if (!q) {
      return true;
    }
    const hay = normalizeQuery(
      [
        article.title,
        article.dek,
        article.source,
        article.slug,
        SECTIONS[article.section].label,
        ...article.keywords,
      ].join(' '),
    );
    return hay.includes(q);
  });
}
