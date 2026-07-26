/**
 * Registry of the jsPsych ecosystem documentation sites.
 *
 * Client-safe: no node imports, so this can be consumed from both the
 * client-side navbar/footer components and any node-side code that wants the
 * canonical list. The preset imports it via the `@jspsych/docusaurus-theme/sites`
 * subpath (not `/components`, which pulls in React) to build the navbar
 * switcher item and the Ecosystem footer column.
 */

export type EcosystemSite = {
  id: string;
  label: string;
  url: string;
  description: string;
};

export const ECOSYSTEM_SITES: readonly EcosystemSite[] = [
  {
    id: 'jspsych',
    label: 'jsPsych',
    url: 'https://www.jspsych.org/',
    description: 'Core library documentation',
  },
  {
    id: 'metadata',
    label: 'jsPsych Metadata',
    url: 'https://metadata.jspsych.org/',
    description: 'Psych-DS metadata for experiment data',
  },
  {
    id: 'multiplayer',
    label: 'jsPsych Multiplayer',
    url: 'https://multiplayer.jspsych.org/',
    description: 'Real-time multiplayer experiments',
  },
  {
    id: 'datapipe',
    label: 'DataPipe',
    url: 'https://pipe.jspsych.org/',
    description: 'Free data collection for online experiments',
  },
];

/**
 * Where the family sends financial support. Shared so the donate link reads
 * the same everywhere (it was previously hard-coded in the DataPipe footer).
 */
export const DONATE_URL = 'https://opencollective.com/jspsych';
export const DONATE_LABEL = 'Donate on Open Collective';
