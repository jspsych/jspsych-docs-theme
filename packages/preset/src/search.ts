import type * as Preset from '@docusaurus/preset-classic';

/**
 * Shared Algolia DocSearch defaults for the jsPsych family of sites.
 *
 * `apiKey` is a search-only public key (safe to ship in the client bundle).
 *
 * IMPORTANT: `contextualSearch` MUST stay `false`. Contextual search scopes
 * results to the current site's version/locale facets, which would prevent
 * cross-site results. The shared index (`docusaurus_jspsych`) will later be
 * replaced by a multi-site `jspsych_ecosystem` crawl so a single search box
 * surfaces hits across the whole ecosystem; keeping contextualSearch off now
 * keeps that behavior consistent.
 */
export const DEFAULT_ALGOLIA: NonNullable<Preset.ThemeConfig['algolia']> = {
  appId: 'G73E906FBW',
  apiKey: '677a628d1fa8113d588d4e5c2ae9a83d',
  indexName: 'docusaurus_jspsych',
  contextualSearch: false,
};
