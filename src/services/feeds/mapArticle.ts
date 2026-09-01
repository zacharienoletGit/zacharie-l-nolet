import { hash32 } from '../../domain/edition';
import { civilFromTimestamp } from '../../lib/dates';
import type { Article } from '../../types/models';
import { slugify, type RssItem } from './parseRss';
import type { FeedDef } from './registry';

const DEK_MAX = 220;

export function mapRssItem(item: RssItem, feed: FeedDef): Article | null {
  const title = item.title.trim();
  if (title.length < 8) {
    return null;
  }

  const text = item.content || item.summary;
  const dek = clip(item.summary || text, DEK_MAX);
  if (!dek) {
    return null;
  }

  const publishedAt = item.publishedAt ?? new Date().toISOString();
  const body = buildBody(text, dek, item.link, feed.source);
  const guid = item.guid || item.link;
  const id = `rss:${feed.id}:${hash32(guid).toString(16)}`;

  return {
    id,
    slug: slugify(title) || id,
    title,
    dek,
    body,
    section: feed.section,
    publishedAt,
    editionDate: civilFromTimestamp(publishedAt) ?? undefined,
    readingMinutes: readingMinutes(body),
    source: feed.source,
    region: feed.region,
    keywords: [feed.source.toLowerCase(), feed.section.replace(/_/g, ' ')],
    origin: 'rss',
    canonicalUrl: item.link,
  };
}

function buildBody(
  text: string,
  dek: string,
  url: string,
  source: string,
): string {
  const paragraphs = (text || dek)
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean);

  const unique = paragraphs.length ? paragraphs : [dek];
  return [
    ...unique,
    `Source : ${source}. Le flux ne livre parfois qu’un chapeau — le texte long reste à l’adresse d’origine.`,
    url,
  ].join('\n\n');
}

function clip(value: string, max: number): string {
  const text = value.replace(/\s+/g, ' ').trim();
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max).trim()}…`;
}

function readingMinutes(body: string): number {
  const chars = body.replace(/\s+/g, ' ').length;
  return Math.max(2, Math.min(20, Math.round(chars / 1100) || 2));
}

export function mergeCatalog(
  editorial: Article[],
  rss: Article[],
): Article[] {
  const map = new Map<string, Article>();
  for (const article of editorial) {
    map.set(article.id, { ...article, origin: article.origin ?? 'editorial' });
  }
  for (const article of rss) {
    if (!article.id.startsWith('rss:')) {
      continue;
    }
    map.set(article.id, article);
  }
  return [...map.values()];
}
