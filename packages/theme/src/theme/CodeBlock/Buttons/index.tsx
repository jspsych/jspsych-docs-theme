/**
 * Swizzled (ejected) from @theme/CodeBlock/Buttons to add a "Open & run in new
 * tab" icon button to the code-block button group, alongside the default
 * word-wrap and copy buttons. The run button only appears for blocks the
 * wrapper flagged as `runnable` (see ../index.tsx and ../runnableContext).
 *
 * It blobs the exact code and opens it in a new tab — no generated HTML files,
 * no external services (the same approach as the PluginExample component).
 * Relative asset paths are rewritten to absolute site URLs first, since a blob:
 * document has an opaque origin; this covers both HTML attributes and the
 * JavaScript string references jsPsych uses (timeline variables, preload, etc.).
 */
import React, {type ReactNode, useContext} from 'react';
import clsx from 'clsx';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {useCodeBlockContext} from '@docusaurus/theme-common/internal';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import CopyButton from '@theme/CodeBlock/Buttons/CopyButton';
import WordWrapButton from '@theme/CodeBlock/Buttons/WordWrapButton';
import Button from '@theme/CodeBlock/Buttons/Button';
import {RunnableContext} from '../runnableContext';
import styles from './styles.module.css';

const ASSET_DIRS = 'img|images|audio|video|sound|media|assets|stimuli';

function absolutizeAssets(code: string, base: string): string {
  const re = new RegExp(`(["'])\\/?((?:${ASSET_DIRS})\\/[^"']+)\\1`, 'g');
  return code.replace(re, (_match, quote, path) => `${quote}${base}${path}${quote}`);
}

function RunButton(): ReactNode {
  const runnable = useContext(RunnableContext);
  const {
    metadata: {code},
  } = useCodeBlockContext();
  const {siteConfig} = useDocusaurusContext();

  if (!runnable) {
    return null;
  }

  const base = siteConfig.url + siteConfig.baseUrl; // e.g. https://host/my-site/

  const onClick = () => {
    const html = absolutizeAssets(code, base);
    const url = URL.createObjectURL(new Blob([html], {type: 'text/html'}));
    window.open(url, '_blank', 'noopener,noreferrer');
    // Release the object URL once the new tab has had time to load it.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  return (
    <Button
      aria-label="Open and run this example in a new tab"
      title="Open & run in new tab"
      className={styles.runButton}
      onClick={onClick}>
      <svg
        className={styles.runButtonIcon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </Button>
  );
}

export default function CodeBlockButtons({className}: {className?: string}): ReactNode {
  return (
    <BrowserOnly>
      {() => (
        <div className={clsx(className, styles.buttonGroup)}>
          <RunButton />
          <WordWrapButton />
          <CopyButton />
        </div>
      )}
    </BrowserOnly>
  );
}
