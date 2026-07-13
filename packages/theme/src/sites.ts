/**
 * Registry of the jsPsych ecosystem documentation sites.
 *
 * Client-safe: no node imports, so this can be consumed from both the
 * client-side navbar/footer components and any node-side code that wants the
 * canonical list (e.g. building a synthesized dropdown in the preset).
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
    id: 'contrib',
    label: 'jsPsych Contrib',
    url: 'https://jspsych.github.io/jspsych-contrib/',
    description: 'Community plugins & extensions',
  },
  {
    id: 'timelines',
    label: 'jsPsych Timelines',
    url: 'https://jspsych.github.io/jspsych-timelines/',
    description: 'Shareable timelines & tasks',
  },
  {
    id: 'datapipe',
    label: 'DataPipe',
    url: 'https://pipe.jspsych.org/',
    description: 'Free data collection for online experiments',
  },
];
