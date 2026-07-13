/**
 * "Ecosystem" navbar dropdown listing the jsPsych family of documentation
 * sites (see src/sites.ts). Registered under the navbar item `type` value
 * `custom-jspsychEcosystem` via the enhanced ComponentTypes registry.
 *
 * Composed from the stock DropdownNavbarItem so it inherits all of the base
 * theme's dropdown behavior, styling, and mobile handling for free — each
 * ecosystem site becomes an external-link dropdown item.
 *
 * The entry matching the *current* site is marked active: we compare each
 * site's origin + path prefix against this site's own `url + baseUrl`. Sites
 * whose url/baseUrl aren't in the registry (e.g. the dev example site) simply
 * get no active entry, which is fine.
 */
import React, {type ReactNode} from 'react';
import DropdownNavbarItem from '@theme/NavbarItem/DropdownNavbarItem';
import type {Props as DropdownNavbarItemProps} from '@theme/NavbarItem/DropdownNavbarItem';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {ECOSYSTEM_SITES} from '../../../sites';

type Props = Omit<DropdownNavbarItemProps, 'items'> & {
  readonly label?: string;
};

/** Normalize to `origin + pathname` with a single trailing slash, no query/hash. */
function normalize(rawUrl: string, rawBase = '/'): string {
  try {
    const u = new URL(rawBase, rawUrl);
    const withSlash = u.origin + (u.pathname.endsWith('/') ? u.pathname : `${u.pathname}/`);
    return withSlash;
  } catch {
    return '';
  }
}

export default function EcosystemSwitcher({
  label = 'Ecosystem',
  ...props
}: Props): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const current = normalize(siteConfig.url, siteConfig.baseUrl);

  const items = ECOSYSTEM_SITES.map((site) => {
    const isCurrent = current !== '' && normalize(site.url) === current;
    return {
      label: site.label,
      href: site.url,
      // Mark the current site's entry as active so users can see where they are.
      ...(isCurrent && {className: 'dropdown__link--active'}),
    };
  });

  return <DropdownNavbarItem {...props} label={label} items={items} />;
}
