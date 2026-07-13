import path from 'node:path';
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

  // Brand CSS first, site CSS after — sites override the brand at equal
  // specificity because customCss preserves array order (and always loads
  // after Infima).
  const customCss = [
    require.resolve('@jspsych/docusaurus-theme/css/jspsych.css'),
    ...siteCustomCss,
  ];

  const config: Config = {
    title: options.title,
    ...(options.tagline != null && {tagline: options.tagline}),
    url: options.url,
    baseUrl: options.baseUrl,
    ...(options.organizationName != null && {organizationName: options.organizationName}),
    ...(options.projectName != null && {projectName: options.projectName}),
    ...(options.favicon != null && {favicon: options.favicon}),

    // Mounts the theme's own static/ (e.g. the PluginExample demo harness
    // assets) alongside the site's static/, so themeConfig.jspsych.pluginExample
    // paths like /demos/docs-demo-timeline.js resolve without every site
    // having to copy those files in. 'static' stays second so a site's own
    // static/ can still shadow/override the theme's files at equal paths.
    // NOTE: if Docusaurus ever rejects an absolute staticDirectories entry,
    // fall back to documenting a copy-into-static step for consuming sites
    // instead of trying to work around it here.
    staticDirectories: [
      path.join(
        path.dirname(require.resolve('@jspsych/docusaurus-theme/package.json')),
        'static',
      ),
      'static',
    ],

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
          theme: {customCss},
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
