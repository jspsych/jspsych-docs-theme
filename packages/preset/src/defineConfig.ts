import path from 'node:path';
import type {Config, ThemeConfig} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {themes as prismThemes} from 'prism-react-renderer';
import {DEFAULT_ALGOLIA} from './search';

type ClassicThemeConfig = Preset.ThemeConfig;
type FooterLinks = NonNullable<ClassicThemeConfig['footer']>['links'];

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
  /**
   * Append the shared "Ecosystem" switcher dropdown (jsPsych family sites) to
   * the right of the navbar. Default `true`; set `false` to opt out.
   */
  ecosystemSwitcher?: boolean;
  /**
   * Target of the GitHub icon link in the header. When set, a
   * `.header-github-link` item (rendered as the GitHub mark by the brand CSS)
   * is appended to the right of the navbar.
   */
  githubUrl?: string;
  /**
   * Full footer override. When provided it is used verbatim; otherwise the
   * factory emits the branded skeleton footer from `footerLinks`/`copyright`.
   */
  footer?: ClassicThemeConfig['footer'];
  /** Footer link columns for the branded skeleton footer (when `footer` is unset). */
  footerLinks?: FooterLinks;
  /** Footer copyright line for the branded skeleton footer (when `footer` is unset). */
  copyright?: string;
  /**
   * Override/extend the shared Algolia defaults (shallow-merged over them).
   * Keep `contextualSearch: false` for cross-site results — see ./search.ts.
   */
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

  // Navbar: keep the site's own items, then append the shared right-side
  // items in the family-standard order — search, ecosystem switcher, GitHub.
  const baseNavbar = options.navbar ?? {};
  const baseItems = baseNavbar.items ?? [];
  const hasSearch = baseItems.some(
    (item) => (item as {type?: string}).type === 'search',
  );

  const appendedItems: NonNullable<ClassicThemeConfig['navbar']>['items'] = [];
  // Docusaurus DocSearch/Algolia navbar item. Skip if the site already placed
  // its own search item.
  if (!hasSearch) {
    appendedItems.push({type: 'search', position: 'right'});
  }
  if (options.ecosystemSwitcher !== false) {
    appendedItems.push({type: 'custom-jspsychEcosystem', position: 'right'});
  }
  if (options.githubUrl != null) {
    appendedItems.push({
      href: options.githubUrl,
      position: 'right',
      className: 'header-github-link',
      'aria-label': `${options.title} on GitHub`,
    });
  }

  const navbar: ClassicThemeConfig['navbar'] = {
    ...baseNavbar,
    items: [...baseItems, ...appendedItems],
  };

  // Shared Algolia defaults, overridable per-site. Search is always present, so
  // always emit the search config.
  const algolia: ClassicThemeConfig['algolia'] = {
    ...DEFAULT_ALGOLIA,
    ...options.algolia,
  };

  // Every family site gets the branded footer. Use a full `footer` override if
  // given; otherwise build the skeleton from footerLinks/copyright (both
  // optional — an empty links list + copyright line is a valid skeleton).
  const footer: ClassicThemeConfig['footer'] = options.footer ?? {
    style: 'dark',
    links: options.footerLinks ?? [],
    copyright:
      options.copyright ??
      `Copyright © ${new Date().getFullYear()} jsPsych contributors. Built with Docusaurus.`,
  };

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
      navbar,
      footer,
      algolia,
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
