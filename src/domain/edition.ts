import { SECTION_GROUPS } from '../data/sections';
import { civilFromTimestamp, shiftCivil } from '../lib/dates';
import type { Article, Edition } from '../types/models';

/**
 * Une édition = exactement 10 textes, rangés.
 * Pas de « for you », pas de pagination infinie.
 * S’il y a des flux RSS, on compose une diversité d’étagères
 * (récence, pas un « importance score » inventé).
 */
export const EDITION_SIZE = 10;

export function isFeedArticle(article: Article): boolean {
  return article.origin === 'rss';
}

export function isRecentForEdition(article: Article, date: string): boolean {
  const published = civilFromTimestamp(article.publishedAt);
  if (!published) {
    return false;
  }
  const yesterday = shiftCivil(date, -1);
  return published === date || published === yesterday;
}

export function buildEdition(
  articles: Article[],
  date: string,
): Edition {
  const live = articles.filter(
    article => isFeedArticle(article) && isRecentForEdition(article, date),
  );

  if (live.length > 0) {
    const picked = composeDiverseEdition(articles, date);
    return {
      date,
      title: 'Édition du jour',
      kicker: 'Titres du jour, un par étagère. Pas un classement.',
      articleIds: picked.map(a => a.id),
    };
  }

  const ranked = articles
    .filter(a => a.editionDate === date && typeof a.rank === 'number')
    .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))
    .slice(0, EDITION_SIZE);

  const picked = ranked.length === EDITION_SIZE ? ranked : fallbackEdition(articles, date);

  return {
    date,
    title: 'Édition du jour',
    kicker: 'Dix textes. Pas de fil.',
    articleIds: picked.map(a => a.id),
  };
}

/**
 * Tourne sur les groupes de rubriques. On ne « note » pas l’importance :
 * on refuse le tas d’une seule source.
 */
export function composeDiverseEdition(articles: Article[], date: string): Article[] {
  const recentFeed = articles
    .filter(article => isFeedArticle(article) && isRecentForEdition(article, date))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const essays = articles.filter(article => !isFeedArticle(article));
  const picked: Article[] = [];
  const seen = new Set<string>();

  const take = (article: Article | undefined) => {
    if (!article || seen.has(article.id) || picked.length >= EDITION_SIZE) {
      return;
    }
    seen.add(article.id);
    picked.push({ ...article, rank: picked.length + 1, editionDate: date });
  };

  for (const group of SECTION_GROUPS) {
    take(recentFeed.find(article => group.sections.includes(article.section)));
  }

  for (const group of SECTION_GROUPS) {
    if (picked.length >= EDITION_SIZE) {
      break;
    }
    take(
      recentFeed.find(
        article =>
          group.sections.includes(article.section) && !seen.has(article.id),
      ),
    );
  }

  for (const article of recentFeed) {
    take(article);
  }

  for (const article of essays) {
    take(article);
  }

  return picked.slice(0, EDITION_SIZE);
}

export function articlesForEdition(
  articles: Article[],
  edition: Edition,
): Article[] {
  const map = new Map(articles.map(a => [a.id, a]));
  return edition.articleIds
    .map(id => map.get(id))
    .filter((a): a is Article => Boolean(a));
}

/**
 * Repli déterministe : si le catalogue n’a pas 10 rangs pour la date,
 * on pioche 10 ids stables à partir de la date (reproductible, testable).
 */
export function fallbackEdition(articles: Article[], date: string): Article[] {
  const scored = [...articles]
    .map(article => ({
      article,
      score: hash32(`${date}:${article.id}`),
    }))
    .sort((a, b) => a.score - b.score || a.article.id.localeCompare(b.article.id));

  return scored.slice(0, EDITION_SIZE).map(s => s.article);
}

export function hash32(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
