# jsPsych docs theme

Shared Docusaurus core for jsPsych-ecosystem documentation sites: one brand
(palette, typography, components, code-block behavior), an ecosystem switcher
that links the family of sites together, and shared search — while each site
stays an independent repo.

## Packages

| Package | What it is |
| --- | --- |
| [`@jspsych/docusaurus-theme`](packages/theme) | Docusaurus theme: brand CSS + self-hosted fonts, swizzled components (navbar dot-brain logo, runnable code fences, doc metadata row, branded 404, ecosystem switcher), and MDX-importable components (`PluginExample`, `Citation`, `JspsychBrain`). |
| [`@jspsych/docusaurus-preset`](packages/preset) | `defineJspsychConfig()` — a config factory that wires `@docusaurus/preset-classic` + the theme and fills in every shared default (navbar assembly, footer skeleton, shared Algolia search, prism themes, `future.v4`), leaving only per-site facts to you. |

The [`examples/site`](examples/site) workspace is the development sandbox: every
shared feature has a page there that exercises it.

## Consumer quickstart

**Setting up a new ecosystem docs site? Follow [NEW_SITE.md](NEW_SITE.md)** —
the complete walkthrough with the minimal file set, required version pins,
deploy workflow, and how to join the ecosystem switcher + shared search.
The short version:

1. `npm install @jspsych/docusaurus-preset @jspsych/docusaurus-theme`
2. `docusaurus.config.ts`:

   ```ts
   import {defineJspsychConfig} from '@jspsych/docusaurus-preset';

   export default defineJspsychConfig({
     title: 'My jsPsych Tool',
     url: 'https://jspsych.github.io',
     baseUrl: '/my-tool/',
     organizationName: 'jspsych',
     projectName: 'my-tool',
     githubUrl: 'https://github.com/jspsych/my-tool',
     navbar: {
       title: 'My Tool',
       items: [{type: 'docSidebar', sidebarId: 'docs', position: 'left', label: 'Docs'}],
     },
     docs: {sidebarPath: './sidebars.ts'},
     footerLinks: [
       {title: 'Docs', items: [{label: 'Get Started', to: '/docs/intro'}]},
     ],
   });
   ```

3. Write docs. Live plugin demos: import `PluginExample` from
   `@jspsych/docusaurus-theme/components` in MDX. Runnable experiment listings:
   tag a fence ` ```html runnable `.
4. Deploy: copy [`templates/publish-docs.yml`](templates/publish-docs.yml) into
   `.github/workflows/` and adjust the working directory.
5. Join the family: PR this repo to add your site to
   `packages/theme/src/sites.ts` (the ecosystem switcher) and to
   [`crawler/config.json`](crawler/config.json) (shared search). Both ship to
   every site on its next rebuild.

## Development

```bash
npm install
npm run build            # theme + preset + example site
npm run start:example    # dev-serve the example site
```

`npm run watch` in `packages/theme` recompiles on change while the example
site dev server runs.

## Releasing

Versioned with [changesets](https://github.com/changesets/changesets), same
flow as the other jspsych repos: add a changeset with your PR
(`npx changeset`). On merge to `main`, the release workflow opens/updates a
"Version Packages" PR; merging that PR triggers `publish.yml`, which publishes
to npm via [trusted publishing](https://docs.npmjs.com/trusted-publishers)
(OIDC, no token) with provenance.

One-time bootstrap per package (already-published packages skip this): a
maintainer runs `npm publish` manually once, then configures the package's
Trusted Publisher on npmjs.com (GitHub Actions, repository
`jspsych/jspsych-docs-theme`, workflow `.github/workflows/publish.yml`).

Docusaurus upgrades are treated as theme releases — the swizzled components
track `@docusaurus/theme-classic` internals (currently pinned to 3.9.x).
