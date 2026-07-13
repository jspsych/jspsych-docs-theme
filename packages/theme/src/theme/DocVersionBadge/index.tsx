import React from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {useDocsVersion} from '@docusaurus/plugin-content-docs/client';
import type {Props} from '@theme/DocVersionBadge';
import styles from './styles.module.css';

/**
 * Swizzled DocVersionBadge.
 *
 * Stock Docusaurus renders this as a gray Infima `badge badge--secondary` pill
 * reading "Version: Current", stacked as its own row between the breadcrumbs and
 * the page title — an orphan line that reads as out of place. Here it's a quiet,
 * two-part brand chip ("Version" muted · the value in brand green) designed to
 * sit on the breadcrumb metadata row (see theme/DocItem/Layout), right-aligned,
 * so location + version read as one orienting line above the title.
 */
export default function DocVersionBadge({
  className,
}: Props): React.ReactElement | null {
  const versionMetadata = useDocsVersion();
  if (!versionMetadata.badge) {
    return null;
  }
  return (
    <span
      className={clsx(
        className,
        ThemeClassNames.docs.docVersionBadge,
        styles.versionBadge,
      )}>
      <span className={styles.versionLabel}>Version</span>
      <span className={styles.versionValue}>{versionMetadata.label}</span>
    </span>
  );
}
