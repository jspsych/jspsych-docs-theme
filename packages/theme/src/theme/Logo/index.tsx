import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useThemeConfig} from '@docusaurus/theme-common';
import type {Props} from '@theme/Logo';
import JspsychBrain from '../../components/JspsychBrain';

/**
 * Swizzled Logo (wrap of @theme/Logo).
 *
 * The only departure from the stock component: the navbar mark is the jsPsych
 * dot-brain inlined as SVG (<JspsychBrain/>) rather than a flat <img>, so each
 * of its 62 dots can fire individually on hover (see components/JspsychBrain).
 * Behavior is otherwise identical — same home link, alt-text rules, and the
 * navbar__brand / navbar__logo / navbar__title class hooks the theme expects.
 *
 * The brand uses one full-color mark in both color modes (no srcDark configured),
 * so there's no themed-image switching to preserve.
 */
export default function Logo(props: Props): React.ReactElement {
  const {
    siteConfig: {title},
  } = useDocusaurusContext();
  const {
    navbar: {title: navbarTitle, logo},
  } = useThemeConfig();
  const {imageClassName, titleClassName, ...propsRest} = props;
  const logoLink = useBaseUrl(logo?.href || '/');
  // If a visible title is shown, the mark is decorative → empty alt.
  const fallbackAlt = navbarTitle ? '' : title;
  const alt = logo?.alt ?? fallbackAlt;

  return (
    <Link
      to={logoLink}
      {...propsRest}
      {...(logo?.target && {target: logo.target})}>
      <div className={imageClassName}>
        <JspsychBrain aria-label={alt || undefined} aria-hidden={alt ? undefined : true} />
      </div>
      {navbarTitle != null && <b className={titleClassName}>{navbarTitle}</b>}
    </Link>
  );
}
