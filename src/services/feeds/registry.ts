import type { RegionCode, SectionId } from '../../types/models';

export type FeedDef = {
  id: string;
  url: string;
  section: SectionId;
  region: RegionCode;
  source: string;
  limit: number;
};

/**
 * Flux HTTPS publics. Pas de Sage / Nectari / Jitterbit / Power BI :
 * ces rubriques restent des essais éditoriaux, sans chiffre inventé.
 */
export const FEEDS: FeedDef[] = [
  {
    id: 'rc-une',
    url: 'https://ici.radio-canada.ca/rss/4159',
    section: 'nouvelles_quebecoises',
    region: 'QC',
    source: 'Radio-Canada',
    limit: 6,
  },
  {
    id: 'ledevoir',
    url: 'https://www.ledevoir.com/rss/manchettes.xml',
    section: 'politique_quebecoise',
    region: 'QC',
    source: 'Le Devoir',
    limit: 6,
  },
  {
    id: 'cbc-canada',
    url: 'https://www.cbc.ca/webfeed/rss/rss-canada',
    section: 'nouvelles_canadiennes',
    region: 'CA',
    source: 'CBC',
    limit: 5,
  },
  {
    id: 'cbc-politics',
    url: 'https://www.cbc.ca/webfeed/rss/rss-politics',
    section: 'politique_canadienne',
    region: 'CA',
    source: 'CBC Politics',
    limit: 5,
  },
  {
    id: 'bbc-world',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    section: 'nouvelles_internationales',
    region: 'INTL',
    source: 'BBC World',
    limit: 5,
  },
  {
    id: 'lemonde-intl',
    url: 'https://www.lemonde.fr/international/rss_full.xml',
    section: 'politique_internationale',
    region: 'INTL',
    source: 'Le Monde',
    limit: 5,
  },
  {
    id: 'npr',
    url: 'https://feeds.npr.org/1001/rss.xml',
    section: 'nouvelles_americaines',
    region: 'US',
    source: 'NPR',
    limit: 5,
  },
  {
    id: 'hn',
    url: 'https://hnrss.org/frontpage',
    section: 'programmation',
    region: 'TECH',
    source: 'Hacker News',
    limit: 5,
  },
  {
    id: 'ars',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    section: 'informatique',
    region: 'TECH',
    source: 'Ars Technica',
    limit: 5,
  },
  {
    id: 'aeon',
    url: 'https://aeon.co/feed.rss',
    section: 'philosophie',
    region: 'CULTURE',
    source: 'Aeon',
    limit: 4,
  },
  {
    id: 'pitchfork',
    url: 'https://pitchfork.com/feed/feed-news/rss',
    section: 'hip_hop',
    region: 'CULTURE',
    source: 'Pitchfork',
    limit: 4,
  },
];
