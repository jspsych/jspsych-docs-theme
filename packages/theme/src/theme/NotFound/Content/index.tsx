import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';

import styles from './styles.module.css';

/**
 * Swizzled 404 page. Keeps the stock job — get a lost visitor back on track —
 * dressed in the site's identity: a big solid forest-green "404", one rare
 * orange accent, a clear way home, and the docs search (the fastest recovery
 * when a page was renamed or the URL was mistyped).
 */

/**
 * Open the site's existing search rather than mounting a second instance:
 * click the navbar DocSearch button, falling back to its ⌘K/Ctrl-K shortcut.
 */
function openSearch() {
  const btn = document.querySelector<HTMLButtonElement>('.DocSearch-Button');
  if (btn) {
    btn.click();
    return;
  }
  document.dispatchEvent(
    new KeyboardEvent('keydown', {key: 'k', metaKey: true, ctrlKey: true, bubbles: true}),
  );
}

export default function NotFoundContent({className}: {className?: string}): ReactNode {
  return (
    <main className={clsx(styles.notFound, className)}>
      <div className="container">
        <div className={styles.inner}>
          <Heading as="h1" className={styles.code}>
            404
          </Heading>
          <p className={styles.title}>
            Page not found<span className={styles.accent}>.</span>
          </p>
          <p className={styles.lead}>
            The page you&apos;re looking for isn&apos;t here. It may have moved,
            or the link might be out of date.
          </p>
          <div className={styles.ctaRow}>
            <Link className={styles.primaryCta} to="/">
              Back to home
            </Link>
            <button
              type="button"
              className={styles.secondaryCta}
              onClick={openSearch}>
              Search the docs
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
