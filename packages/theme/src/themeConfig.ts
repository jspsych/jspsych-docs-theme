/**
 * Client-safe types and defaults for the `themeConfig.jspsych` slice.
 *
 * Deliberately free of node-land imports: client components (PluginExample)
 * import defaults from here, while the Joi validation schema lives in
 * ./options.ts — importing that from a client component would drag
 * @docusaurus/utils-validation (and its node built-ins) into the browser
 * bundle and break the webpack build.
 */

export type PluginExampleHarnessConfig = {
  /** baseUrl-relative path to the shared demo timeline script. */
  timeline: string;
  /** baseUrl-relative path to the shared demo stylesheet. */
  css: string;
};

export type PluginExampleThemeConfig = {
  /** Default jsPsych core version pulled from unpkg. */
  jspsychVersion: string;
  /** unpkg specifier for the plugin that powers the "Run demo" controls. */
  controlsPlugin: string;
  harness: PluginExampleHarnessConfig;
};

export type JspsychThemeConfig = {
  pluginExample: PluginExampleThemeConfig;
  // Forward-compat: future slices (e.g. other components) may add sibling
  // keys here without needing a schema change in lockstep.
  [key: string]: unknown;
};

/** The full themeConfig shape as seen by this theme (a partial view). */
export type ThemeConfig = {
  jspsych?: JspsychThemeConfig;
};

export const DEFAULT_PLUGIN_EXAMPLE_CONFIG: PluginExampleThemeConfig = {
  jspsychVersion: '8.2.2',
  controlsPlugin: '@jspsych/plugin-html-button-response@2.1.0',
  harness: {
    timeline: '/demos/docs-demo-timeline.js',
    css: '/demos/docs-demo.css',
  },
};
