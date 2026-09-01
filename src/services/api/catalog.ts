import { CATALOG } from '../../data/articles';
import { buildEdition } from '../../domain/edition';
import { civilDate } from '../../lib/dates';
import type { Article, Bookmark, Edition, Note } from '../../types/models';
import { config, isRemoteEnabled } from '../config';
import { fetchEditorialFeeds } from '../feeds/fetchFeeds';
import { mergeCatalog } from '../feeds/mapArticle';
import { loadFeedCache, saveFeedCache } from '../storage/persist';
import { request } from './client';

export async function fetchArticles(): Promise<Article[]> {
  const base = await loadBaseCatalog();
  if (!config.feedsEnabled) {
    return tagEditorial(base);
  }

  const cached = await loadFeedCache();
  try {
    const pull = await fetchEditorialFeeds();
    if (pull.articles.length) {
      await saveFeedCache({
        fetchedAt: new Date().toISOString(),
        articles: pull.articles,
        failures: pull.failures,
      });
      return mergeCatalog(base, pull.articles);
    }
    return mergeCatalog(base, cached?.articles ?? []);
  } catch {
    return mergeCatalog(base, cached?.articles ?? []);
  }
}

async function loadBaseCatalog(): Promise<Article[]> {
  if (!isRemoteEnabled()) {
    return CATALOG;
  }
  try {
    const payload = await request<{ articles: Article[] }>('/articles');
    return payload.articles.length ? payload.articles : CATALOG;
  } catch {
    return CATALOG;
  }
}

function tagEditorial(articles: Article[]): Article[] {
  return articles.map(article => ({
    ...article,
    origin: article.origin ?? 'editorial',
  }));
}

export async function fetchEdition(date: string = civilDate()): Promise<{
  edition: Edition;
  articles: Article[];
}> {
  const catalog = await fetchArticles();
  const edition = buildEdition(catalog, date);
  const map = new Map(catalog.map(a => [a.id, a]));
  return {
    edition,
    articles: edition.articleIds
      .map(id => map.get(id))
      .filter((a): a is Article => Boolean(a)),
  };
}

export async function fetchArticle(id: string): Promise<Article | null> {
  const catalog = await fetchArticles();
  return catalog.find(article => article.id === id) ?? null;
}

export async function pullNotes(): Promise<Note[]> {
  const payload = await request<{ notes: Note[] }>('/notes');
  return payload.notes;
}

export async function pushNote(note: Note): Promise<Note> {
  return request<Note>('/notes', {
    method: 'POST',
    body: JSON.stringify(note),
  });
}

export async function destroyRemoteNote(id: string): Promise<void> {
  await request<void>(`/notes/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function pullBookmarks(): Promise<Bookmark[]> {
  const payload = await request<{ bookmarks: Bookmark[] }>('/bookmarks');
  return payload.bookmarks;
}

export async function pushBookmark(bookmark: Bookmark): Promise<Bookmark> {
  return request<Bookmark>('/bookmarks', {
    method: 'POST',
    body: JSON.stringify(bookmark),
  });
}

export async function destroyRemoteBookmark(articleId: string): Promise<void> {
  await request<void>(`/bookmarks/${encodeURIComponent(articleId)}`, {
    method: 'DELETE',
  });
}
