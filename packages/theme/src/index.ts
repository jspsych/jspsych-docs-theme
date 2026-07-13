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
      return [];
    },
  };
}
