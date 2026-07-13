import type {Config, ThemeConfig} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {themes as prismThemes} from 'prism-react-renderer';

type ClassicThemeConfig = Preset.ThemeConfig;

export interface JspsychConfigOptions {
  /** Site title, shown in the browser tab and used as default meta title. */
  title: string;
  tagline?: string;
  /** Production origin, e.g. https://www.jspsych.org */
  url: string;
  /** Pathname the site is served under, e.g. '/' or '/docs-site/'. */
  baseUrl: string;
  organizationName?: string;
  projectName?: string;
  favicon?: string;
  /** Social-card image path (themeConfig.image). */
  image?: string;

  /** Per-site navbar: title and the site's own items (doc tabs etc.). */
  navbar?: ClassicThemeConfig['navbar'];
  /** Target of the GitHub icon link in the header. */
  githubUrl?: string;
  footer?: ClassicThemeConfig['footer'];
  /** Override/extend the shared Algolia defaults. */
  algolia?: ClassicThemeConfig['algolia'];

  /** Passed through to @docusaurus/preset-classic. */
  docs?: Preset.Options['docs'];
  /** Passed through to preset-classic; sites without a blog omit this. */
  blog?: Preset.Options['blog'];
  /** Extra site CSS file(s), loaded AFTER the shared jsPsych theme CSS. */
  customCss?: string | string[];

  /** Overrides for themeConfig.jspsych (see @jspsych/docusaurus-theme). */
  jspsych?: Record<string, unknown>;
  /** Additional themeConfig entries, shallow-merged last. */
  themeConfig?: ThemeConfig;
  /** Escape hatch: shallow-merged onto the final Config last. */
  extraConfig?: Partial<Config>;
}

/**
 * Builds a complete Docusaurus Config carrying the shared jsPsych-family
 * defaults (classic preset + @jspsych/docusaurus-theme, brand CSS/fonts,
 * prism themes, color-mode behavior, blog feed options), leaving only
 * per-site facts to the caller.
 *
 * A config *factory* rather than a Docusaurus preset because presets can only
 * contribute plugins/themes — they cannot set themeConfig or top-level fields
 * like `future`, which is where most of the shared value lives.
 */
export default function defineJspsychConfig(options: JspsychConfigOptions): Config {
  const siteCustomCss =
    options.customCss == null
      ? []
      : Array.isArray(options.customCss)
        ? options.customCss
        : [options.customCss];

  const config: Config = {
    title: options.title,
    ...(options.tagline != null && {tagline: options.tagline}),
    url: options.url,
    baseUrl: options.baseUrl,
    ...(options.organizationName != null && {organizationName: options.organizationName}),
    ...(options.projectName != null && {projectName: options.projectName}),
    ...(options.favicon != null && {favicon: options.favicon}),

    future: {
      v4: true,
    },

    onBrokenLinks: 'throw',

    i18n: {
      defaultLocale: 'en',
      locales: ['en'],
    },

    presets: [
      [
        require.resolve('@docusaurus/preset-classic'),
        {
          docs: options.docs,
          blog: options.blog ?? false,
          // preset-classic rejects an empty customCss array, so only pass the
          // theme block when there is something to load.
          ...(siteCustomCss.length > 0 && {theme: {customCss: siteCustomCss}}),
        } satisfies Preset.Options,
      ],
    ],

    themes: [require.resolve('@jspsych/docusaurus-theme')],

    themeConfig: {
      ...(options.image != null && {image: options.image}),
      colorMode: {
        respectPrefersColorScheme: true,
      },
      ...(options.navbar != null && {navbar: options.navbar}),
      ...(options.footer != null && {footer: options.footer}),
      ...(options.algolia != null && {algolia: options.algolia}),
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
      ...(options.jspsych != null && {jspsych: options.jspsych}),
      ...options.themeConfig,
    } satisfies ThemeConfig,

    ...options.extraConfig,
  };

  return config;
}
