import type {ReactElement, ReactNode} from 'react';
import {formatDefault} from './fields';
import type {FieldModel} from './model';
import styles from './styles.module.css';

/** Description / unit / default / absent value for one option, plus the
 * site-supplied `renderFieldExtra` content. Used in the hover tooltip and the
 * "field help" panel under the editor. */
export default function FieldHelp({
  name,
  phase,
  field,
  extra,
}: {
  name: string;
  phase: 'main' | 'practice';
  field: FieldModel | undefined;
  extra?: ReactNode;
}): ReactElement {
  if (!field) {
    return (
      <div className={styles.helpBody}>
        <code>{name}</code> is not a known option.
      </div>
    );
  }
  const allowed =
    field.kind === 'enum' && field.enumValues
      ? field.enumValues.map((v) => (typeof v === 'string' ? v : JSON.stringify(v))).join(' | ')
      : null;
  return (
    <div className={styles.helpBody}>
      <div>
        <code>{field.name}</code>
        {phase === 'practice' && <span className={styles.badge}>practice</span>}
        {field.advanced && <span className={styles.badge}>advanced</span>}
      </div>
      {field.description && <p className={styles.helpDesc}>{field.description}</p>}
      <dl className={styles.helpMeta}>
        <dt>Default</dt>
        <dd>
          <code>{formatDefault(field)}</code>
        </dd>
        {field.unit && (
          <>
            <dt>Unit</dt>
            <dd>{field.unit}</dd>
          </>
        )}
        {field.absentValue !== undefined && (
          <>
            <dt>Absent</dt>
            <dd>
              <code>{field.absentValue === null ? 'null' : JSON.stringify(field.absentValue)}</code>
            </dd>
          </>
        )}
        {allowed && (
          <>
            <dt>Values</dt>
            <dd>
              <code>{allowed}</code>
            </dd>
          </>
        )}
      </dl>
      {extra && <div className={styles.helpExtra}>{extra}</div>}
    </div>
  );
}
