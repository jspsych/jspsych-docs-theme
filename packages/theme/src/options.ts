/**
 * `themeConfig.jspsych` — the slice of site themeConfig this theme reads.
 * Validated (and defaulted) the same way @docusaurus/theme-classic validates
 * its own slice: a Joi schema run through the `validate` callback Docusaurus
 * passes to `validateThemeConfig`. Docusaurus itself calls the schema with
 * `.unknown()` applied at the top level (see `normalizeThemeConfig` in
 * `@docusaurus/utils-validation`) so other themes' themeConfig keys survive —
 * but that only covers the *top* level, so nested objects here mark their own
 * `.unknown(true)` where forward-compat extra keys should be tolerated.
 */
import {Joi} from '@docusaurus/utils-validation';
import type {ThemeConfigValidationContext} from '@docusaurus/types';

import {DEFAULT_PLUGIN_EXAMPLE_CONFIG} from './themeConfig';
import type {ThemeConfig} from './themeConfig';

// Types and defaults are re-exported for node-side consumers; client
// components must import from './themeConfig' directly (no Joi there).
export * from './themeConfig';

const HarnessSchema = Joi.object({
  timeline: Joi.string().default(DEFAULT_PLUGIN_EXAMPLE_CONFIG.harness.timeline),
  css: Joi.string().default(DEFAULT_PLUGIN_EXAMPLE_CONFIG.harness.css),
}).default(DEFAULT_PLUGIN_EXAMPLE_CONFIG.harness);

const PluginExampleSchema = Joi.object({
  jspsychVersion: Joi.string().default(
    DEFAULT_PLUGIN_EXAMPLE_CONFIG.jspsychVersion,
  ),
  controlsPlugin: Joi.string().default(
    DEFAULT_PLUGIN_EXAMPLE_CONFIG.controlsPlugin,
  ),
  harness: HarnessSchema,
}).default(DEFAULT_PLUGIN_EXAMPLE_CONFIG);

// No defaults here on purpose: when unset, <TimelineExample> falls back to
// pluginExample.jspsychVersion so one setting keeps both components in step.
const TimelineExampleSchema = Joi.object({
  jspsychVersion: Joi.string(),
}).unknown(true);

const JspsychSchema = Joi.object({
  pluginExample: PluginExampleSchema,
  timelineExample: TimelineExampleSchema,
})
  // Unknown keys inside `jspsych` are allowed for forward compat (future
  // component slices) rather than rejected as typos.
  .unknown(true)
  .default({pluginExample: DEFAULT_PLUGIN_EXAMPLE_CONFIG});

export const ThemeConfigSchema = Joi.object({
  jspsych: JspsychSchema,
});

export function validateThemeConfig({
  validate,
  themeConfig,
}: ThemeConfigValidationContext<ThemeConfig>): ThemeConfig {
  return validate(ThemeConfigSchema, themeConfig);
}
