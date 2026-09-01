export type RssItem = {
  title: string;
  link: string;
  guid?: string;
  publishedAt?: string;
  summary: string;
  content: string;
};

export function parseFeedXml(xml: string): RssItem[] {
  const blocks = collectBlocks(xml, 'item');
  return blocks
    .map(parseItemBlock)
    .filter((item): item is RssItem => Boolean(item));
}

function collectBlocks(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'gi');
  const out: string[] = [];
  let match: RegExpExecArray | null = re.exec(xml);
  while (match) {
    out.push(match[1]);
    match = re.exec(xml);
  }
  return out;
}

function parseItemBlock(block: string): RssItem | null {
  const title = cleanText(extractTag(block, 'title'));
  const link =
    cleanText(extractTag(block, 'link')) ||
    extractHref(block) ||
    cleanText(extractTag(block, 'guid'));
  if (!title || !link) {
    return null;
  }
  const encoded = extractTag(block, 'encoded');
  const description = extractTag(block, 'description');
  const summary = cleanText(description);
  const content = cleanText(encoded) || summary;
  const publishedAt =
    extractTag(block, 'pubDate') ||
    extractTag(block, 'date') ||
    extractTag(block, 'updated') ||
    extractTag(block, 'published');

  return {
    title,
    link,
    guid: cleanText(extractTag(block, 'guid')) || undefined,
    publishedAt: publishedAt ? toIsoDate(publishedAt) : undefined,
    summary,
    content,
  };
}

export function extractTag(block: string, tag: string): string {
  const re = new RegExp(
    `<(?:[\\w.-]+:)?${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:[\\w.-]+:)?${tag}>`,
    'i',
  );
  const match = re.exec(block);
  return match ? unwrapCdata(match[1]) : '';
}

function extractHref(block: string): string {
  const match = /<link\b[^>]*href=["']([^"']+)["']/i.exec(block);
  return match ? match[1] : '';
}

export function unwrapCdata(value: string): string {
  return value.replace(/<!\[CDATA\[([\s\S]*?)]]>/gi, '$1').trim();
}

export function stripHtml(html: string): string {
  return html
    .replace(/<(br|\/p|\/div|\/li)\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\u00a0/g, ' ');
}

export function decodeEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#039;/g, "'");
}

export function cleanText(value: string): string {
  return decodeEntities(stripHtml(unwrapCdata(value)))
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

export function toIsoDate(raw: string): string {
  const trimmed = cleanText(raw);
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }
  return trimmed;
}

export function slugify(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 72);
}
