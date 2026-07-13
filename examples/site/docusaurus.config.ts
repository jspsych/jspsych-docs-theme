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

  // Exercises the header GitHub icon appended by the factory.
  githubUrl: 'https://github.com/jspsych/jspsych',
  // ecosystemSwitcher defaults on. Note: this site's url/baseUrl
  // (https://jspsych.github.io/) doesn't match any ECOSYSTEM_SITES entry, so
  // the switcher renders with no "current site" highlighted — that's expected.

  // Exercises the branded skeleton footer built by the factory.
  footerLinks: [
    {
      title: 'Docs',
      items: [{label: 'Introduction', to: '/docs/intro'}],
    },
    {
      title: 'Community',
      items: [
        {
          label: 'GitHub Discussions',
          href: 'https://github.com/jspsych/jspsych/discussions',
        },
      ],
    },
  ],

  docs: {
    sidebarPath: './sidebars.ts',
  },

  extraConfig: {
    onBrokenLinks: 'warn',
  },
});
