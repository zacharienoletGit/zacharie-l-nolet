/**
 * Configuration runtime — pas de secrets.
 * Pour le PHP local : apiBaseUrl = 'http://127.0.0.1:8080/v1'
 * iOS simulateur : localhost pointe vers la machine hôte.
 */
export const config = {
  apiBaseUrl: '',
  requestTimeoutMs: 8000,
  catalogVersion: '2026-09-01',
  /** Flux RSS publics. Les rubriques métier (Sage, Nectari…) restent des essais. */
  feedsEnabled: true,
} as const;

export function isRemoteEnabled(): boolean {
  return config.apiBaseUrl.trim().length > 0;
}
