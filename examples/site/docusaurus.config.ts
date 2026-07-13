import {defineJspsychConfig} from '@jspsych/docusaurus-preset';

/**
 * Development / e2e site for the shared theme + preset. Every shared feature
 * (runnable code fences, PluginExample, Citation, version chip, 404, ecosystem
 * switcher) should have a page here that exercises it.
 */
export default defineJspsychConfig({
  title: 'jsPsych Theme Example',
  tagline: 'Exercises every feature of the shared jsPsych docs theme',
  url: 'https://jspsych.github.io',
  baseUrl: '/',
  organizationName: 'jspsych',
  projectName: 'jspsych-docs-theme',

  navbar: {
    title: 'Theme Example',
    items: [
      {
        type: 'docSidebar',
        sidebarId: 'docs',
        position: 'left',
        label: 'Docs',
      },
    ],
  },

  docs: {
    sidebarPath: './sidebars.ts',
  },

  extraConfig: {
    onBrokenLinks: 'warn',
  },
});
