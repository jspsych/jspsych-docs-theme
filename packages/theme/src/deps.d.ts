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

declare module '*.module.css' {
  const classes: {readonly [key: string]: string};
  export default classes;
}
