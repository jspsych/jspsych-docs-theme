import {useEffect, useId, useRef, useState} from 'react';
import type {ReactElement, ReactNode} from 'react';
import clsx from 'clsx';
import {
  clone,
  deepEqual,
  initialBundleValue,
  isPlainObject,
  zeroValue,
} from './model';
import type {FieldModel, OptionError} from './model';
import styles from './styles.module.css';

/**
 * Form widgets for <TimelineExample>. Each editor is "controlled" by a value
 * and reports changes with onChange(value); `undefined` means "unset".
 * Editors that need free-form intermediate text (numbers, JSON, map keys) keep
 * a local draft and resync when the value changes from outside (Reset,
 * presets, URL restore).
 */

type EditorProps = {
  field: FieldModel;
  value: unknown;
  onChange: (v: unknown) => void;
  id: string;
  describedBy?: string;
  invalid?: boolean;
  label?: string;
};

const fmt = (v: unknown): string =>
  v === undefined ? 'unset' : typeof v === 'string' ? JSON.stringify(v) : JSON.stringify(v);

export function formatDefault(field: FieldModel): string {
  if (!field.hasDefault) return 'none';
  const base = fmt(field.default);
  return field.unit && typeof field.default === 'number' ? `${base} ${field.unit}` : base;
}

// ---------------------------------------------------------------------------
// Primitive inputs
// ---------------------------------------------------------------------------

type NumberInputProps = {
  value: unknown;
  onChange: (v: number | undefined) => void;
  id?: string;
  min?: number;
  max?: number;
  integer?: boolean;
  unit?: string;
  /** If true, clearing the input restores `fallback` display on blur
   * instead of unsetting. */
  hasDefault: boolean;
  describedBy?: string;
  invalid?: boolean;
  label?: string;
  disabled?: boolean;
  placeholder?: string;
};

export function NumberInput(p: NumberInputProps): ReactElement {
  const show = (v: unknown) => (typeof v === 'number' ? String(v) : '');
  const [text, setText] = useState(show(p.value));
  // Resync when the value changes from outside, but not mid-typing.
  useEffect(() => {
    const parsed = text.trim() === '' ? undefined : Number(text);
    if (parsed !== p.value) setText(show(p.value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.value]);
  return (
    <span className={styles.numberWrap}>
      <input
        id={p.id}
        type="number"
        className={clsx(styles.input, styles.number)}
        value={text}
        min={p.min}
        max={p.max}
        step={p.integer ? 1 : 'any'}
        disabled={p.disabled}
        placeholder={p.placeholder}
        aria-label={p.label}
        aria-invalid={p.invalid || undefined}
        aria-describedby={p.describedBy}
        onChange={(e) => {
          const t = e.target.value;
          setText(t);
          if (t.trim() === '') {
            if (!p.hasDefault) p.onChange(undefined);
            return;
          }
          const n = Number(t);
          if (Number.isFinite(n)) p.onChange(n);
        }}
        onBlur={() => {
          if (text.trim() === '') setText(show(p.value));
        }}
      />
      {p.unit && <span className={styles.unit}>{p.unit}</span>}
    </span>
  );
}

function Switch({
  id,
  checked,
  onChange,
  label,
  describedBy,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  describedBy?: string;
}): ReactElement {
  return (
    <label className={styles.switchLabel} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        role="switch"
        className={styles.switch}
        checked={checked}
        aria-describedby={describedBy}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

// ---------------------------------------------------------------------------
// Kind-specific editors
// ---------------------------------------------------------------------------

function EnumEditor({field, value, onChange, id, describedBy, invalid, label}: EditorProps) {
  const vals = field.enumValues ?? [];
  const idx = vals.findIndex((v) => deepEqual(v, value));
  const optionLabel = (v: unknown) =>
    v === null ? 'none (null)' : typeof v === 'string' ? v : JSON.stringify(v);
  return (
    <select
      id={id}
      className={clsx(styles.input, styles.select)}
      value={idx >= 0 ? String(idx) : ''}
      aria-label={label}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      onChange={(e) => onChange(e.target.value === '' ? undefined : vals[Number(e.target.value)])}>
      {idx < 0 && <option value="">(not set)</option>}
      {vals.map((v, i) => (
        <option key={i} value={String(i)}>
          {optionLabel(v)}
        </option>
      ))}
    </select>
  );
}

function BooleanEditor({field, value, onChange, id, describedBy, label}: EditorProps) {
  return (
    <Switch
      id={id}
      checked={value === true}
      onChange={onChange}
      describedBy={describedBy}
      label={label ?? (value === true ? 'On' : 'Off')}
    />
  );
}

function NumericEditor({field, value, onChange, id, describedBy, invalid, label}: EditorProps) {
  const s = field.schema;
  return (
    <NumberInput
      id={id}
      value={value}
      onChange={onChange}
      min={typeof s.minimum === 'number' ? s.minimum : undefined}
      max={typeof s.maximum === 'number' ? s.maximum : undefined}
      integer={field.kind === 'integer'}
      unit={field.unit}
      hasDefault={field.hasDefault}
      describedBy={describedBy}
      invalid={invalid}
      label={label}
    />
  );
}

function StringEditor({field, value, onChange, id, describedBy, invalid, label}: EditorProps) {
  return (
    <input
      id={id}
      type="text"
      className={styles.input}
      value={typeof value === 'string' ? value : ''}
      aria-label={label}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      onChange={(e) => {
        const t = e.target.value;
        onChange(t === '' && !field.hasDefault ? undefined : t);
      }}
    />
  );
}

function newItemValue(item: FieldModel): unknown {
  return item.hasDefault && item.default !== undefined ? clone(item.default) : zeroValue(item);
}

function ArrayEditor({field, value, onChange, id, describedBy}: EditorProps) {
  const item = field.item!;
  const list = Array.isArray(value) ? value : [];
  const set = (next: unknown[]) => onChange(next);
  return (
    <div className={styles.listEditor} role="group" aria-label={field.name} aria-describedby={describedBy}>
      {list.map((v, i) => (
        <div className={styles.listRow} key={i}>
          <FieldEditor
            field={item}
            value={v}
            id={`${id}-${i}`}
            label={`${field.name} item ${i + 1}`}
            onChange={(nv) => set(list.map((x, j) => (j === i ? nv : x)))}
          />
          <button
            type="button"
            className={styles.smallButton}
            aria-label={`Remove ${field.name} item ${i + 1}`}
            onClick={() => set(list.filter((_, j) => j !== i))}>
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className={styles.smallButton}
        onClick={() => set([...list, newItemValue(item)])}>
        + Add item
      </button>
    </div>
  );
}

type Row = {rid: number; key: string; value: unknown};
let rowCounter = 0;

function rowsToObject(rows: Row[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const r of rows) if (r.key !== '') out[r.key] = r.value;
  return out;
}

function MapEditor({field, value, onChange, id, describedBy}: EditorProps) {
  const vf = field.valueField!;
  const toRows = (v: unknown): Row[] =>
    isPlainObject(v) ? Object.entries(v).map(([k, val]) => ({rid: ++rowCounter, key: k, value: val})) : [];
  const [rows, setRows] = useState<Row[]>(() => toRows(value));
  // Resync when the value is changed from outside (reset / preset / URL).
  useEffect(() => {
    if (!deepEqual(rowsToObject(rows), isPlainObject(value) ? value : {})) setRows(toRows(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  const commit = (next: Row[]) => {
    setRows(next);
    onChange(rowsToObject(next));
  };
  const keys = rows.map((r) => r.key);
  return (
    <div className={styles.listEditor} role="group" aria-label={field.name} aria-describedby={describedBy}>
      {rows.map((r, i) => {
        const dup = r.key !== '' && keys.indexOf(r.key) !== i;
        return (
          <div className={styles.mapRow} key={r.rid}>
            <input
              type="text"
              className={clsx(styles.input, styles.mapKey)}
              value={r.key}
              placeholder="key"
              aria-label={`${field.name} key ${i + 1}`}
              aria-invalid={dup || undefined}
              onChange={(e) => commit(rows.map((x) => (x === r ? {...x, key: e.target.value} : x)))}
            />
            <span aria-hidden="true">→</span>
            <FieldEditor
              field={vf}
              value={r.value}
              id={`${id}-v${i}`}
              label={`${field.name} value for ${r.key || `row ${i + 1}`}`}
              onChange={(nv) => commit(rows.map((x) => (x === r ? {...x, value: nv} : x)))}
            />
            <button
              type="button"
              className={styles.smallButton}
              aria-label={`Remove ${r.key || `row ${i + 1}`}`}
              onClick={() => commit(rows.filter((x) => x !== r))}>
              Remove
            </button>
            {dup && <span className={styles.errorText}>Duplicate key; the last one wins.</span>}
          </div>
        );
      })}
      <button
        type="button"
        className={styles.smallButton}
        onClick={() => {
          let n = rows.length + 1;
          while (keys.includes(`key${n}`)) n++;
          commit([...rows, {rid: ++rowCounter, key: `key${n}`, value: newItemValue(vf)}]);
        }}>
        + Add entry
      </button>
    </div>
  );
}

function DurationEditor({field, value, onChange, id, describedBy, invalid}: EditorProps) {
  const jitter = isPlainObject(value);
  const s = field.schema;
  const first = (s.oneOf ?? s.anyOf ?? []).find((a) => a.type === 'number');
  const min = typeof first?.minimum === 'number' ? first.minimum : undefined;
  const j = (jitter ? value : {}) as Record<string, unknown>;
  const setJ = (k: string, v: number | undefined) => {
    const next: Record<string, unknown> = {...j, [k]: v};
    if (v === undefined) delete next[k];
    onChange(next);
  };
  const name = `${id}-mode`;
  return (
    <div className={styles.durationEditor} aria-describedby={describedBy}>
      <div role="radiogroup" aria-label={`${field.name} mode`} className={styles.segmented}>
        <label>
          <input
            type="radio"
            name={name}
            checked={!jitter}
            onChange={() => onChange(jitter && typeof j.min === 'number' ? j.min : 0)}
          />
          <span>Fixed</span>
        </label>
        <label>
          <input
            type="radio"
            name={name}
            checked={jitter}
            onChange={() => {
              const n = typeof value === 'number' ? value : 0;
              onChange({min: n, max: n});
            }}
          />
          <span>Jitter</span>
        </label>
      </div>
      {!jitter ? (
        <NumberInput
          id={id}
          value={value}
          min={min}
          unit={field.unit}
          hasDefault={false}
          invalid={invalid}
          label={field.name}
          onChange={(n) => onChange(n === undefined ? 0 : n)}
        />
      ) : (
        <div className={styles.jitterGrid}>
          {(['min', 'max', 'step'] as const).map((k) => (
            <label key={k} className={styles.jitterCell}>
              <span>{k === 'step' ? 'step (optional)' : k}</span>
              <NumberInput
                id={k === 'min' ? id : undefined}
                value={j[k]}
                min={k === 'step' ? 0 : min}
                unit={field.unit}
                hasDefault={false}
                invalid={invalid}
                label={`${field.name} ${k}`}
                onChange={(n) => setJ(k, n)}
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function BundleEditor({field, value, onChange, id, describedBy}: EditorProps) {
  const on = isPlainObject(value);
  const obj = (on ? value : {}) as Record<string, unknown>;
  const required = field.schema.required ?? [];
  return (
    <div className={styles.bundle}>
      <Switch
        id={id}
        checked={on}
        describedBy={describedBy}
        label={on ? 'Enabled' : 'Off'}
        onChange={(v) => onChange(v ? initialBundleValue(field) : field.nullable ? null : undefined)}
      />
      {on && (
        <div className={styles.bundleBody}>
          {(field.children ?? []).map((c) => (
            <FieldRow
              key={c.name}
              field={c}
              value={Object.prototype.hasOwnProperty.call(obj, c.name) ? obj[c.name] : c.default}
              required={required.includes(c.name)}
              nested
              onChange={(nv) => {
                const next = {...obj};
                if (nv === undefined) delete next[c.name];
                else next[c.name] = nv;
                onChange(next);
              }}
              idPrefix={id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function JsonEditor({field, value, onChange, id, describedBy, invalid, label}: EditorProps) {
  const show = (v: unknown) => (v === undefined ? '' : JSON.stringify(v, null, 2));
  const [text, setText] = useState(show(value));
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    let parsed: unknown;
    try {
      parsed = text.trim() === '' ? undefined : JSON.parse(text);
    } catch {
      parsed = Symbol('invalid');
    }
    if (!deepEqual(parsed, value)) {
      setText(show(value));
      setErr(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <div>
      <textarea
        id={id}
        className={clsx(styles.input, styles.json)}
        rows={Math.min(10, Math.max(3, text.split('\n').length))}
        spellCheck={false}
        value={text}
        aria-label={label}
        aria-invalid={invalid || err !== null || undefined}
        aria-describedby={describedBy}
        onChange={(e) => {
          const t = e.target.value;
          setText(t);
          if (t.trim() === '') {
            setErr(null);
            onChange(undefined);
            return;
          }
          try {
            const v = JSON.parse(t);
            setErr(null);
            onChange(v);
          } catch (ex) {
            setErr(`Invalid JSON: ${(ex as Error).message}`);
          }
        }}
      />
      {err && <div className={styles.errorText} role="alert">{err}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dispatcher (handles `null` = absent for nullable scalar-ish kinds)
// ---------------------------------------------------------------------------

const NULL_TOGGLE_KINDS = new Set(['number', 'integer', 'string', 'array', 'map', 'duration']);

function nullLabel(field: FieldModel): string {
  const numeric = field.kind === 'number' || field.kind === 'integer' || field.kind === 'duration';
  return numeric && field.absentValue === null ? 'No limit' : 'None';
}

export function FieldEditor(props: EditorProps): ReactElement {
  const {field, value, onChange, id} = props;
  const lastNonNull = useRef<unknown>(undefined);
  if (value !== null && value !== undefined) lastNonNull.current = value;

  const inner = (() => {
    switch (field.kind) {
      case 'enum':
        return <EnumEditor {...props} />;
      case 'boolean':
        return <BooleanEditor {...props} />;
      case 'number':
      case 'integer':
        return <NumericEditor {...props} />;
      case 'string':
        return <StringEditor {...props} />;
      case 'array':
        return <ArrayEditor {...props} />;
      case 'duration':
        return <DurationEditor {...props} />;
      case 'map':
        return <MapEditor {...props} />;
      case 'bundle':
        return <BundleEditor {...props} />;
      default:
        return <JsonEditor {...props} />;
    }
  })();

  if (!(field.nullable && NULL_TOGGLE_KINDS.has(field.kind))) return inner;
  const isNull = value === null;
  return (
    <div className={styles.nullable}>
      <label className={styles.checkLabel}>
        <input
          type="checkbox"
          checked={isNull}
          aria-describedby={props.describedBy}
          onChange={(e) => {
            if (e.target.checked) onChange(null);
            else {
              const restore =
                lastNonNull.current ??
                (field.default !== null && field.default !== undefined
                  ? clone(field.default)
                  : zeroValue(field));
              onChange(restore);
            }
          }}
        />
        <span>{nullLabel(field)}</span>
      </label>
      {!isNull && inner}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Row: label + widget + help + default + extension slot + errors
// ---------------------------------------------------------------------------

export type FieldRowProps = {
  field: FieldModel;
  value: unknown;
  onChange: (v: unknown) => void;
  errors?: OptionError[];
  extra?: ReactNode;
  modified?: boolean;
  onReset?: () => void;
  required?: boolean;
  nested?: boolean;
  idPrefix?: string;
  /** Extra header content (e.g. the practice "override" checkbox). */
  header?: ReactNode;
  hideEditor?: boolean;
};

export function FieldRow(p: FieldRowProps): ReactElement {
  const uid = useId();
  const id = `${p.idPrefix ?? 'f'}-${uid}-${p.field.name}`;
  const helpId = `${id}-help`;
  const errId = `${id}-err`;
  const f = p.field;
  const hasErrors = !!p.errors && p.errors.length > 0;
  const describedBy = [f.description ? helpId : null, hasErrors ? errId : null]
    .filter(Boolean)
    .join(' ') || undefined;
  return (
    <div
      className={clsx(styles.fieldRow, p.nested && styles.nested, p.modified && styles.modified)}
      data-field={f.name}>
      <div className={styles.fieldMain}>
        <div className={styles.fieldHead}>
          <label className={styles.fieldLabel} htmlFor={id}>
            <code>{f.name}</code>
            {p.required && <span className={styles.requiredMark} title="Required"> *</span>}
          </label>
          {p.header}
          {p.modified && p.onReset && (
            <button
              type="button"
              className={styles.linkButton}
              onClick={p.onReset}
              aria-label={`Reset ${f.name} to default`}>
              reset
            </button>
          )}
        </div>
        {!p.hideEditor && (
          <FieldEditor
            field={f}
            value={p.value}
            onChange={p.onChange}
            id={id}
            describedBy={describedBy}
            invalid={hasErrors}
          />
        )}
        {f.description && (
          <p className={styles.help} id={helpId}>
            {f.description}
          </p>
        )}
        {!p.nested && (
          <p className={styles.meta}>
            Default: <code>{formatDefault(f)}</code>
            {f.absentValue !== undefined && (
              <>
                {' '}
                &middot; Absent: <code>{f.absentValue === null ? 'null' : JSON.stringify(f.absentValue)}</code>
              </>
            )}
          </p>
        )}
        {hasErrors && (
          <ul className={styles.errorList} id={errId}>
            {p.errors!.map((e, i) => (
              <li key={i}>
                <code>{e.path}</code> {e.message}
              </li>
            ))}
          </ul>
        )}
      </div>
      {p.extra && <div className={styles.fieldExtra}>{p.extra}</div>}
    </div>
  );
}
