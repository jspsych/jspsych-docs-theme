import {ReactElement, useCallback, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

/**
 * A reusable academic-citation card. It renders a formatted reference, links
 * out to the DOI (or a fallback URL), and offers one-click copy of the
 * citation in APA and BibTeX form.
 *
 * It's intentionally generic: the jsPsych papers use it on the About page, but
 * the same component can credit a third-party plugin or extension author. Pass
 * structured fields and it generates APA + BibTeX for you, or override either
 * string directly when you need exact control.
 */

export type CitationAuthor = {
  /** Given name(s); initials are derived from this for APA. e.g. "Josh R." */
  given: string;
  /** Family name, kept verbatim. e.g. "de Leeuw" */
  family: string;
};

export type CitationProps = {
  authors: CitationAuthor[];
  year: number | string;
  title: string;
  /** Journal / venue name. Italicized in the rendered reference. */
  journal?: string;
  volume?: string | number;
  /** Issue number; emitted as BibTeX `number`. */
  issue?: string | number;
  pages?: string;
  /** Bare DOI, e.g. "10.21105/joss.05351" (not the full URL). */
  doi?: string;
  /** Link used when there's no DOI. */
  url?: string;
  /** BibTeX entry type. Defaults to "article". */
  entryType?: string;
  /** BibTeX citation key. Defaults to "{firstFamily}{year}". */
  citeKey?: string;
  /** Override the generated plain-text APA string. */
  apa?: string;
  /** Override the generated BibTeX entry. */
  bibtex?: string;
  /** Optional small note shown above the reference, e.g. "Preferred citation". */
  note?: string;
};

type CopyState = 'idle' | 'copied' | 'error';

/** "Josh R." -> "J. R." */
function initials(given: string): string {
  return given
    .split(/[\s.]+/)
    .filter(Boolean)
    .map((part) =>
      part
        .split('-')
        .map((seg) => `${seg.charAt(0).toUpperCase()}.`)
        .join('-'),
    )
    .join(' ');
}

function apaAuthors(authors: CitationAuthor[]): string {
  const names = authors.map((a) => `${a.family}, ${initials(a.given)}`);
  if (names.length <= 1) return names.join('');
  if (names.length === 2) return `${names[0]}, & ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, & ${names[names.length - 1]}`;
}

function buildApa(props: CitationProps): string {
  const {authors, year, title, journal, volume, issue, pages, doi, url} = props;
  let ref = `${apaAuthors(authors)} (${year}). ${title}.`;
  if (journal) {
    let venue = ` ${journal}`;
    if (volume != null) venue += `, ${volume}`;
    if (issue != null) venue += `(${issue})`;
    if (pages) venue += `, ${pages}`;
    ref += `${venue}.`;
  }
  if (doi) ref += ` https://doi.org/${doi}`;
  else if (url) ref += ` ${url}`;
  return ref;
}

function buildBibtex(props: CitationProps): string {
  const {authors, year, title, journal, volume, issue, pages, doi} = props;
  const entryType = props.entryType ?? 'article';
  const citeKey =
    props.citeKey ??
    `${(authors[0]?.family ?? 'ref').replace(/\s+/g, '')}${year}`;

  const author = authors.map((a) => `${a.family}, ${a.given}`).join(' and ');
  const fields: Array<[string, string | number | undefined]> = [
    ['author', author],
    ['title', title],
    ['journal', journal],
    ['year', year],
    ['volume', volume],
    ['number', issue],
    ['pages', pages],
    ['doi', doi],
  ];

  const body = fields
    .filter(([, value]) => value != null && value !== '')
    .map(([key, value]) => `  ${key} = {${value}},`)
    .join('\n');

  return `@${entryType}{${citeKey},\n${body}\n}`;
}

function CopyButton({
  text,
  label,
}: {
  text: string;
  label: string;
}): ReactElement {
  const [state, setState] = useState<CopyState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onCopy = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('error');
    }
    timer.current = setTimeout(() => setState('idle'), 2000);
  }, [text]);

  const message =
    state === 'copied'
      ? 'Copied'
      : state === 'error'
        ? 'Press Ctrl/⌘+C'
        : label;

  return (
    <button
      type="button"
      className={styles.action}
      data-state={state}
      onClick={onCopy}>
      <span className={styles.actionIcon} aria-hidden="true">
        {state === 'copied' ? '✓' : '⧉'}
      </span>
      <span>{message}</span>
    </button>
  );
}

export default function Citation(props: CitationProps): ReactElement {
  const {authors, year, title, journal, volume, issue, pages, doi, url, note} =
    props;

  const apa = props.apa ?? buildApa(props);
  const bibtex = props.bibtex ?? buildBibtex(props);
  const doiUrl = doi ? `https://doi.org/${doi}` : url;

  return (
    <div className={styles.card}>
      {note && <p className={styles.note}>{note}</p>}

      <p className={styles.reference}>
        {apaAuthors(authors)} ({year}). {title}.
        {journal && (
          <>
            {' '}
            <em>{journal}</em>
            {volume != null && (
              <>
                , <em>{volume}</em>
              </>
            )}
            {issue != null && <>({issue})</>}
            {pages && <>, {pages}</>}.
          </>
        )}
      </p>

      <div className={styles.actions}>
        {doiUrl && (
          <Link
            className={`${styles.action} ${styles.doi}`}
            to={doiUrl}
            aria-label={doi ? `DOI ${doi}` : 'View publication'}>
            <span className={styles.actionIcon} aria-hidden="true">
              ↗
            </span>
            <span>{doi ? 'DOI' : 'View'}</span>
          </Link>
        )}
        <CopyButton text={apa} label="Copy APA" />
        <CopyButton text={bibtex} label="Copy BibTeX" />
      </div>
    </div>
  );
}
