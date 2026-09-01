import { config } from '../config';
import { mapRssItem } from './mapArticle';
import { parseFeedXml } from './parseRss';
import { FEEDS, type FeedDef } from './registry';
import type { Article } from '../../types/models';

export type FeedPull = {
  articles: Article[];
  failures: string[];
};

export async function fetchEditorialFeeds(): Promise<FeedPull> {
  const results = await Promise.allSettled(FEEDS.map(pullFeed));
  const articles: Article[] = [];
  const failures: string[] = [];

  results.forEach((result, index) => {
    const feed = FEEDS[index];
    if (result.status === 'fulfilled') {
      articles.push(...result.value);
      return;
    }
    failures.push(feed.id);
  });

  return { articles, failures };
}

async function pullFeed(feed: FeedDef): Promise<Article[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.requestTimeoutMs);
  try {
    const response = await fetch(feed.url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml',
        'User-Agent': 'ZacharieLNolet/0.1 (cahier-de-lecture; iPhone)',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const xml = await response.text();
    return parseFeedXml(xml)
      .slice(0, feed.limit)
      .map(item => mapRssItem(item, feed))
      .filter((article): article is Article => Boolean(article));
  } finally {
    clearTimeout(timer);
  }
}
