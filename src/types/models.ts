/**
 * Contrats de données — grain stable pour l’app, l’API PHP et les tests.
 * Versionner ces types plutôt que les élargir implicitement dans les écrans.
 */

export type SectionId =
  | 'informatique'
  | 'programmation'
  | 'intelligence_affaires'
  | 'domaine_informatique'
  | 'sage_x3'
  | 'nectari'
  | 'jitterbit'
  | 'cpq'
  | 'power_bi'
  | 'nouvelles_internationales'
  | 'nouvelles_canadiennes'
  | 'nouvelles_americaines'
  | 'nouvelles_quebecoises'
  | 'politique_internationale'
  | 'politique_quebecoise'
  | 'politique_canadienne'
  | 'philosophie'
  | 'hip_hop';

export type RegionCode = 'QC' | 'CA' | 'US' | 'INTL' | 'TECH' | 'CULTURE';

export type ArticleOrigin = 'editorial' | 'rss' | 'api';

export type Article = {
  id: string;
  slug: string;
  title: string;
  dek: string;
  body: string;
  section: SectionId;
  publishedAt: string;
  /** Date civile de l’édition (YYYY-MM-DD). Absente = hors Top 10 du jour. */
  editionDate?: string;
  rank?: number;
  readingMinutes: number;
  source: string;
  region: RegionCode;
  keywords: string[];
  origin?: ArticleOrigin;
  /** Lien canonique. Un flux RSS ne remplace pas l’article source. */
  canonicalUrl?: string;
};

export type FeedCache = {
  fetchedAt: string;
  articles: Article[];
  failures: string[];
};

export type Note = {
  id: string;
  articleId?: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  /** Horodatage serveur après sync ; absent = jamais poussé. */
  remoteUpdatedAt?: string;
};

export type Bookmark = {
  articleId: string;
  savedAt: string;
  remoteUpdatedAt?: string;
};

export type ThemeMode = 'system' | 'light' | 'dark';
export type FontScaleId = 'regular' | 'large' | 'xlarge';

export type AppSettings = {
  themeMode: ThemeMode;
  fontScale: FontScaleId;
  onboardingDone: boolean;
  lastOpenedEditionDate?: string;
};

export type SyncEntity = 'note' | 'bookmark';
export type SyncAction = 'upsert' | 'delete';

export type SyncOp = {
  id: string;
  entity: SyncEntity;
  action: SyncAction;
  payload: unknown;
  updatedAt: string;
};

export type Edition = {
  date: string;
  title: string;
  kicker: string;
  articleIds: string[];
};
