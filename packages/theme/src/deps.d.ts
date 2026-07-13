/// <reference types="@docusaurus/module-type-aliases" />
/// <reference types="@docusaurus/theme-classic" />

// `@theme-init/*` is the alias a theme package uses to enhance a component
// provided by a lower theme (theme-classic). Types mirror the enhanced
// component; the alias itself has no published declarations.
declare module '@theme-init/CodeBlock' {
  import type CodeBlock from '@theme/CodeBlock';

  const CodeBlockInit: typeof CodeBlock;
  export default CodeBlockInit;
}

// `moduleResolution: "node"` (classic) doesn't honor package.json "exports"
// subpath maps, so deep-import specifiers like `@docusaurus/theme-common/internal`
// and `@docusaurus/plugin-content-docs/client` can't be resolved directly even
// though the compiled .d.ts files exist on disk. Re-export from the real `lib/`
// path (which classic resolution *can* walk) so the public subpath still
// type-checks.
declare module '@docusaurus/theme-common/internal' {
  export * from '@docusaurus/theme-common/lib/internal';
}

declare module '@docusaurus/plugin-content-docs/client' {
  export * from '@docusaurus/plugin-content-docs/lib/client';
}

declare module '*.module.css' {
  const classes: {readonly [key: string]: string};
  export default classes;
}

// Plain CSS side-effect imports (e.g. @fontsource-variable packages).
declare module '*.css';
