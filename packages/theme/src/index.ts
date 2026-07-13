import type {LoadContext, Plugin} from '@docusaurus/types';

export default function themeJspsych(context: LoadContext): Plugin<undefined> {
  return {
    name: '@jspsych/docusaurus-theme',

    getThemePath() {
      return '../lib/theme';
    },

    getTypeScriptThemePath() {
      return '../src/theme';
    },

    getClientModules() {
      // Self-hosted brand webfonts. @font-face rules are order-insensitive,
      // so loading them as a client module (after the site's own modules) is
      // safe — unlike the brand CSS, which must precede site customCss and is
      // therefore injected via preset-classic's customCss array instead (see
      // defineJspsychConfig in @jspsych/docusaurus-preset).
      return ['./fonts'];
    },
  };
}
