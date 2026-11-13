import {useCallback, useEffect, useId, useMemo, useRef, useState} from 'react';
import type {ReactElement, ReactNode} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {useBaseUrlUtils} from '@docusaurus/useBaseUrl';
import CodeBlock from '@theme/CodeBlock';
import {useThemeConfig} from '@docusaurus/theme-common';
import {FieldRow} from './fields';
import FieldHelp from './FieldHelp';
import type {ActiveOption, EditorDiagnostic} from './CodeEditor';
import {
  MESSAGE_SOURCE,
  buildOptions,
  buildSnippet,
  buildTimelineSrcDoc,
  clone,
  dataColumns,
  deepEqual,
  locatePath,
  parseOptionsText,
  renderFullText,
  scanObjectText,
  stringifyOptions,
  stripDefaults,
  decodeOptionsFromHash,
  effectiveValue,
  errorsFor,
  fieldsOf,
  formatCell,
  groupFields,
  parseTrialData,
  phaseOverridableFields,
  resolvePresets,
  resolveScriptUrl,
  setOption,
  splitOptions,
  toCsv,
  updateHash,
  validateOptions,
  zeroValue,
} from './model';
import type {
  FieldModel,
  OptionError,
  Options,
  Preset,
  PropertySchema,
  TimelineSchema,
} from './model';
import {DEFAULT_PLUGIN_EXAMPLE_CONFIG} from '../../themeConfig';
import type {ThemeConfig} from '../../themeConfig';
import styles from './styles.module.css';

export type {Preset, TimelineSchema, PropertySchema, OptionError};

/**
 * An interactive form + runner for a jsPsych timeline package. The form is
 * generated from a JSON Schema (draft-07) describing the package's
 * `createTimeline(jsPsych, options)` options; "Run" executes the task in a
 * sandboxed iframe and shows the resulting trial data. The pure logic (schema
 * to form model, diffing, validation, URL codec, srcdoc) lives in ./model.ts.
 */
export type TimelineExampleProps = {
  /** JSON Schema (draft-07) of the options (see the schema contract). */
  schema: TimelineSchema | Record<string, any>;
  /** URL of the package's IIFE browser bundle. Absolute, or site-relative
   * (starting with `/`; the site baseUrl is applied). */
  bundle: string;
  /** Global exposed by the bundle, e.g. `jsPsychTimelineFlanker`. */
  globalName: string;
  /** Extra scripts to load before the bundle: full URLs, site-relative paths,
   * or unpkg specifiers like `@jspsych/plugin-html-keyboard-response@2.1.0`. */
  dependencies?: string[];
  /** Override the jsPsych core version (default: theme config). */
  jspsychVersion?: string;
  /** Options applied on load (diffed against defaults; may include `practice`). */
  initialOptions?: Record<string, unknown>;
  /** Named example configurations. Defaults to the schema's `x-jspsych-presets`. */
  presets?: Preset[];
  /** Which view is shown first: the code editor (default) or the form. */
  defaultView?: 'code' | 'form';
  /** Initial stage height in px (draggable). Default 420. */
  height?: number;
  /** Mirror the options in the URL hash (`#<hashKey>=...`) and restore them on load. */
  syncToUrl?: boolean;
  /** Hash parameter name for syncToUrl; use distinct values when several
   * components share a page. Default `opts`. */
  hashKey?: string;
  /** Rendered beside each field (e.g. literature evidence). Called with the
   * field's full property schema and current value; the fourth argument says
   * whether the field is shown in the main form or in "Practice overrides".
   * Its result is shown in the editor's hover tooltip and field-help panel
   * as well as beside the form fields. */
  renderFieldExtra?: (
    name: string,
    propertySchema: PropertySchema,
    value: unknown,
    context?: {phase: 'main' | 'practice'},
  ) => ReactNode;
  /** Called with the parsed trial data (array of objects) when a run finishes. */
  onRunComplete?: (data: Record<string, unknown>[]) => void;
};

const DEFAULT_HEIGHT = 420;
const MIN_STAGE_HEIGHT = 200;
const MAX_STAGE_HEIGHT = 900;
const KEY_RESIZE_STEP = 24;
const MAX_TABLE_ROWS = 1000;
const clampHeight = (h: number): number =>
  Math.min(MAX_STAGE_HEIGHT, Math.max(MIN_STAGE_HEIGHT, h));

type Status = 'idle' | 'running' | 'finished' | 'stopped' | 'error';

const own = (o: object, k: string): boolean => Object.prototype.hasOwnProperty.call(o, k);

function TimelineExampleInner(props: TimelineExampleProps): ReactElement {
  const {
    bundle,
    globalName,
    dependencies = [],
    initialOptions,
    height = DEFAULT_HEIGHT,
    defaultView = 'code',
    syncToUrl = false,
    hashKey = 'opts',
    renderFieldExtra,
    onRunComplete,
  } = props;
  const schema = props.schema as TimelineSchema;
  const rootId = useId();

  const {jspsych} = useThemeConfig() as unknown as ThemeConfig;
  const jspsychVersion =
    props.jspsychVersion ??
    jspsych?.timelineExample?.jspsychVersion ??
    jspsych?.pluginExample?.jspsychVersion ??
    DEFAULT_PLUGIN_EXAMPLE_CONFIG.jspsychVersion;
  const {withBaseUrl} = useBaseUrlUtils();

  const fields = useMemo(() => fieldsOf(schema), [schema]);
  const groups = useMemo(() => groupFields(fields), [fields]);
  const overridable = useMemo(() => phaseOverridableFields(fields), [fields]);
  const presets = useMemo(() => resolvePresets(schema, props.presets), [schema, props.presets]);

  const initialText = useMemo(() => {
    const s = splitOptions(fields, initialOptions ?? {});
    return stringifyOptions(fields, buildOptions(s.overrides, s.practice));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // The text is the source of truth: it is what runs and what the code view shows.
  const [text, setText] = useState(initialText);
  const [showAll, setShowAll] = useState(false);
  const [view, setView] = useState<'code' | 'form'>(defaultView);
  const [presetId, setPresetId] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [active, setActive] = useState<ActiveOption>(null);
  const CodeEditor = useMemo(
    () => require('./CodeEditor').default as typeof import('./CodeEditor').default,
    [],
  );


  const [status, setStatus] = useState<Status>('idle');
  const [runId, setRunId] = useState(0);
  const [runDoc, setRunDoc] = useState<string | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null);
  const [stageHeight, setStageHeight] = useState(clampHeight(height));
  const [copied, setCopied] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const nonceRef = useRef('');
  const onCompleteRef = useRef(onRunComplete);
  onCompleteRef.current = onRunComplete;
  const stageRef = useRef<HTMLDivElement>(null);

  const parsed = useMemo(() => parseOptionsText(text), [text]);
  const lastValid = useRef<Options>({});
  // Values equal to their default are always dropped from what is emitted.
  const options = useMemo<Options>(
    () => (parsed.ok ? stripDefaults(fields, parsed.value) : lastValid.current),
    [parsed, fields],
  );
  if (parsed.ok) lastValid.current = options;
  const {overrides, practice} = useMemo(() => splitOptions(fields, options), [fields, options]);
  const errors: OptionError[] = useMemo(
    () => (parsed.ok ? validateOptions(schema, fields, options) : []),
    [parsed, schema, fields, options],
  );
  const diagnostics: EditorDiagnostic[] = useMemo(() => {
    if (!parsed.ok) {
      return [{from: parsed.from, to: parsed.to, message: parsed.message, severity: 'error'}];
    }
    const entries = scanObjectText(text);
    return errors.map((e) => {
      const r = locatePath(entries, e.path) ?? {from: 0, to: Math.min(1, text.length)};
      return {...r, message: `${e.path} ${e.message}`, severity: 'error' as const};
    });
  }, [parsed, errors, text]);
  const modifiedCount =
    Object.keys(overrides).length + Object.keys(practice).length;

  const preset = presets.find((p) => p.id === presetId);
  const presetOptions = useMemo(
    () => (preset ? stripDefaults(fields, preset.options) : null),
    [preset, fields],
  );
  const presetKeys = useMemo(
    () => new Set(Object.keys(presetOptions ?? {}).filter((k) => k !== 'practice')),
    [presetOptions],
  );
  const presetModified = !!presetOptions && !deepEqual(options, presetOptions);

  /** Write options into the editor, in the minimal or the full view. */
  const writeText = (opts: Options, full: boolean, keys: ReadonlySet<string> = presetKeys) =>
    setText(full ? renderFullText(fields, opts, keys) : stringifyOptions(fields, opts));

  // ---- URL hash sync ------------------------------------------------------
  const [hydrated, setHydrated] = useState(!syncToUrl);
  useEffect(() => {
    if (!syncToUrl) return;
    const raw = decodeOptionsFromHash(hashKey, window.location.hash);
    if (raw) {
      // splitOptions drops unknown keys and non-overridable practice entries.
      const s = splitOptions(fields, raw);
      setText(stringifyOptions(fields, buildOptions(s.overrides, s.practice)));
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!syncToUrl || !hydrated) return;
    const next = updateHash(hashKey, window.location.hash, options);
    if (next !== window.location.hash) {
      const url = window.location.pathname + window.location.search + next;
      window.history.replaceState(window.history.state, '', url);
    }
  }, [syncToUrl, hydrated, hashKey, options]);

  // ---- edits (form edits are written back into the text) ------------------
  const commit = (o: Options, p: Options) => writeText(buildOptions(o, p), showAll);
  const setField = (f: FieldModel, v: unknown) => commit(setOption(f, overrides, v), practice);
  const setPracticeField = (f: FieldModel, v: unknown) => {
    const next = {...practice};
    if (v === undefined) delete next[f.name];
    else next[f.name] = v;
    commit(overrides, next);
  };
  const reset = () => {
    setPresetId('');
    writeText({}, showAll, new Set());
  };
  const applyPreset = (id: string) => {
    setPresetId(id);
    if (id === '') return;
    const p = presets.find((x) => x.id === id);
    if (!p) return;
    const stripped = stripDefaults(fields, p.options);
    writeText(
      stripped,
      showAll,
      new Set(Object.keys(stripped).filter((k) => k !== 'practice')),
    );
  };
  const toggleShowAll = (on: boolean) => {
    if (!parsed.ok) return;
    setShowAll(on);
    writeText(options, on);
  };
  const hideDefaults = () => {
    if (!parsed.ok) return;
    setShowAll(false);
    writeText(options, false);
  };

  // ---- URLs / snippet -----------------------------------------------------
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const absolute = useCallback(
    (spec: string) => resolveScriptUrl(spec, (p) => origin + withBaseUrl(p)),
    [origin, withBaseUrl],
  );
  const depKey = dependencies.join('|');
  const refs = useMemo(
    () => ({
      jspsychVersion,
      dependencyUrls: dependencies.map(absolute),
      bundleUrl: absolute(bundle),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [jspsychVersion, depKey, bundle, absolute],
  );
  const snippet = useMemo(
    () => buildSnippet({...refs, globalName, options}),
    [refs, globalName, options],
  );

  // ---- running ------------------------------------------------------------
  const validateNow = (): boolean => parsed.ok && errors.length === 0;

  const run = () => {
    if (!validateNow()) {
      setBlocked(true);
      return;
    }
    setBlocked(false);
    const id = runId + 1;
    nonceRef.current = `${id}-${Math.random().toString(36).slice(2)}`;
    setRunId(id);
    setRunError(null);
    setRows(null);
    setStatus('running');
    setRunDoc(
      buildTimelineSrcDoc({...refs, globalName, options: clone(options), nonce: nonceRef.current}),
    );
    window.setTimeout(
      () => stageRef.current?.scrollIntoView({block: 'nearest', behavior: 'smooth'}),
      50,
    );
  };

  const stop = () => {
    nonceRef.current = '';
    setRunDoc(null);
    setStatus('stopped');
  };

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const d = e.data as {
        source?: string;
        nonce?: string;
        type?: string;
        data?: string;
        message?: string;
      } | null;
      if (!d || d.source !== MESSAGE_SOURCE) return;
      // The sandboxed iframe has an opaque origin, so authenticate by window
      // identity plus the per-run nonce rather than by event.origin.
      if (e.source !== iframeRef.current?.contentWindow) return;
      if (!nonceRef.current || d.nonce !== nonceRef.current) return;
      if (d.type === 'finish') {
        const parsed = parseTrialData(d.data);
        setRows(parsed);
        setStatus('finished');
        onCompleteRef.current?.(parsed);
      } else if (d.type === 'error') {
        setRunError(d.message ?? 'The task failed to run.');
        setStatus('error');
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const openInNewTab = () => {
    if (!validateNow()) return;
    const doc = buildTimelineSrcDoc({
      ...refs,
      globalName,
      options: clone(options),
      nonce: 'newtab',
    });
    const url = URL.createObjectURL(new Blob([doc], {type: 'text/html'}));
    window.open(url, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable: the code block has its own copy button */
    }
  };

  const downloadCsv = () => {
    if (!rows) return;
    const url = URL.createObjectURL(new Blob([toCsv(rows)], {type: 'text/csv;charset=utf-8'}));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${globalName}-data.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // ---- stage resize (same behaviour as PluginExample) -----------------------
  const startResize = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const handle = e.currentTarget;
    const startY = e.clientY;
    const startHeight = stageHeight;
    handle.setPointerCapture(e.pointerId);
    const onMove = (ev: PointerEvent) =>
      setStageHeight(clampHeight(startHeight + (ev.clientY - startY)));
    const onUp = (ev: PointerEvent) => {
      handle.releasePointerCapture(ev.pointerId);
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
    };
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
  };
  const onResizeKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const delta = e.key === 'ArrowDown' ? KEY_RESIZE_STEP : -KEY_RESIZE_STEP;
      setStageHeight((h) => clampHeight(h + delta));
    }
  };

  // ---- render -------------------------------------------------------------
  const extra = (f: FieldModel, value: unknown, phase: 'main' | 'practice' = 'main') =>
    renderFieldExtra ? renderFieldExtra(f.name, f.schema, value, {phase}) : undefined;

  const renderHelp = (name: string, phase: 'main' | 'practice', value: unknown): ReactNode => {
    const f = fields.find((x) => x.name === name && (phase === 'main' || x.phaseOverridable));
    const extraNode =
      f && renderFieldExtra ? renderFieldExtra(f.name, f.schema, value ?? f.default, {phase}) : undefined;
    const shown =
      name === 'practice' && phase === 'main' ? (
        <div className={styles.helpBody}>
          <code>practice</code>
          <p className={styles.helpDesc}>
            Override these options during practice trials. Overridable options:{' '}
            {phaseOverridableFields(fields).map((x) => x.name).join(', ')}.
          </p>
        </div>
      ) : (
        <FieldHelp name={name} phase={phase} field={f} extra={extraNode} />
      );
    return shown;
  };

  const renderRow = (f: FieldModel) => {
    const value = effectiveValue(f, overrides);
    return (
      <FieldRow
        key={f.name}
        field={f}
        value={value}
        errors={errorsFor(errors, f.name)}
        modified={own(overrides, f.name)}
        onReset={() => setField(f, f.default)}
        onChange={(v) => setField(f, v)}
        extra={extra(f, value)}
        required={(schema.required ?? []).includes(f.name)}
      />
    );
  };

  const rowsShown = rows ? rows.slice(0, MAX_TABLE_ROWS) : [];
  const columns = useMemo(() => (rows ? dataColumns(rows.slice(0, MAX_TABLE_ROWS)) : []), [rows]);
  const running = status === 'running';
  const statusText =
    status === 'running'
      ? 'Task running'
      : status === 'finished'
        ? `Task finished: ${rows?.length ?? 0} trials recorded`
        : status === 'stopped'
          ? 'Task stopped'
          : status === 'error'
            ? 'Task failed to run'
            : '';
  return (
    <section
      className={styles.root}
      aria-label={`${schema.title ?? globalName} options and runner`}>
      <div className={styles.toolbar}>
        {presets.length > 0 && (
          <div className={styles.presetBlock}>
            <label className={styles.presetLabel}>
              <span>Preset</span>
              <select
                className={styles.input}
                value={presetId}
                onChange={(e) => applyPreset(e.target.value)}>
                <option value="">No preset (package defaults)</option>
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                    {p.id === presetId && presetModified ? ' (modified)' : ''}
                  </option>
                ))}
              </select>
            </label>
            {preset?.description && (
              <p className={styles.presetDescription}>{preset.description}</p>
            )}
          </div>
        )}
        <div className={styles.toolbarSpacer} />
        <span className={styles.modifiedCount}>
          {modifiedCount === 0 ? 'All defaults' : `${modifiedCount} changed`}
        </span>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={reset}
          disabled={modifiedCount === 0 && !presetId && text.trim() === (showAll ? renderFullText(fields, {}) : '{}')}>
          Reset to defaults
        </button>
        <button type="button" className={styles.primaryButton} onClick={run}>
          <span aria-hidden="true">{status === 'idle' ? '▶' : '↻'}</span>{' '}
          {status === 'idle' ? 'Run' : 'Restart'}
        </button>
        {running && (
          <button type="button" className={styles.secondaryButton} onClick={stop}>
            Stop
          </button>
        )}
      </div>

      {blocked && diagnostics.length > 0 && (
        <div className={styles.errorSummary} role="alert">
          <strong>The task was not run: fix {diagnostics.length === 1 ? 'this problem' : 'these problems'} first.</strong>
          <ul>
            {diagnostics.map((d, i) => (
              <li key={i}>{d.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.tabs} role="tablist" aria-label="Options view">
        {(['code', 'form'] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            id={`${rootId}-tab-${v}`}
            aria-selected={view === v}
            aria-controls={`${rootId}-panel-${v}`}
            tabIndex={view === v ? 0 : -1}
            className={styles.tab}
            onClick={() => setView(v)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                const next = v === 'code' ? 'form' : 'code';
                setView(next);
                document.getElementById(`${rootId}-tab-${next}`)?.focus();
              }
            }}>
            {v === 'code' ? 'Code' : 'Form'}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`${rootId}-panel-code`}
        aria-labelledby={`${rootId}-tab-code`}
        hidden={view !== 'code'}
        className={styles.codeView}>
        <div className={styles.toolbar} style={{padding: '0 0 0.5rem', border: 'none'}}>
          <label className={styles.switchLabel} htmlFor={`${rootId}-showall`}>
            <input
              id={`${rootId}-showall`}
              type="checkbox"
              role="switch"
              className={styles.switch}
              checked={showAll}
              disabled={!parsed.ok}
              onChange={(e) => toggleShowAll(e.target.checked)}
            />
            <span>Show all parameters</span>
          </label>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={hideDefaults}
            disabled={!parsed.ok}
            title="Rewrite the editor with only the values that differ from the defaults">
            Hide defaults
          </button>
        </div>
        <div className={styles.editorBox}>
          <CodeEditor
            value={text}
            onChange={setText}
            schema={schema}
            fields={fields}
            diagnostics={diagnostics}
            onActive={setActive}
            ariaLabel={`${schema.title ?? globalName} options (JSON5)`}
            renderHelp={(name, phase, value) => renderHelp(name, phase, value)}
          />
        </div>
        <p className={styles.editorHint}>
          Only values that differ from the defaults are used. Comments, unquoted keys and trailing
          commas are fine. Ctrl+Space completes option names and values; hover an option name for
          help.
          {showAll && ' Dimmed lines are at their default.'}
        </p>
        {diagnostics.length > 0 && (
          <ul className={styles.diagList} aria-live="polite">
            {diagnostics.map((d, i) => (
              <li key={i}>{d.message}</li>
            ))}
          </ul>
        )}
        <div className={styles.helpPanel} aria-live="polite" aria-label="Option help">
          {active ? (
            renderHelp(active.name, active.phase, active.value)
          ) : (
            <span className={styles.help}>
              Put the cursor on an option to see its description, default and unit here.
            </span>
          )}
        </div>
      </div>

      <div
        role="tabpanel"
        id={`${rootId}-panel-form`}
        aria-labelledby={`${rootId}-tab-form`}
        hidden={view !== 'form'}>
      {!parsed.ok && (
        <div className={styles.syntaxBanner} role="alert">
          The code has a syntax error, so the form shows the last valid options. Editing the form
          replaces the code. ({parsed.message})
        </div>
      )}
      <div className={styles.form}>
        {groups.map((g) => (
          <div key={g.id} className={styles.group} role="group" aria-labelledby={`${rootId}-g-${g.id}`}>
            <h3 className={styles.groupLegend} id={`${rootId}-g-${g.id}`}>
              {g.label}
            </h3>
            {g.basic.map(renderRow)}
            {g.advanced.length > 0 && (
              <details className={styles.advanced}>
                <summary>Advanced ({g.advanced.length})</summary>
                {g.advanced.map(renderRow)}
              </details>
            )}
          </div>
        ))}

        {overridable.length > 0 && (
          <div className={styles.group} role="group" aria-labelledby={`${rootId}-g-practice`}>
            <h3 className={styles.groupLegend} id={`${rootId}-g-practice`}>
              Practice overrides
            </h3>
            <p className={styles.help}>
              Use different values during practice trials. Emitted as{' '}
              <code>options.practice</code>.
            </p>
            <details
              className={styles.advanced}
              open={Object.keys(practice).length > 0 || undefined}>
              <summary>
                Practice overrides ({Object.keys(practice).length} of {overridable.length} set)
              </summary>
              {overridable.map((f) => {
                const enabled = own(practice, f.name);
                const base = effectiveValue(f, overrides);
                return (
                  <PracticeRow
                    key={f.name}
                    field={f}
                    enabled={enabled}
                    value={enabled ? practice[f.name] : base}
                    errors={errorsFor(errors, f.name, true)}
                    extra={extra(f, enabled ? practice[f.name] : base, 'practice')}
                    onToggle={(on) =>
                      setPracticeField(
                        f,
                        on ? clone(base === undefined ? zeroValue(f) : base) : undefined,
                      )
                    }
                    onChange={(v) => setPracticeField(f, v)}
                  />
                );
              })}
            </details>
          </div>
        )}
      </div>

      </div>

      <details className={styles.code}>
        <summary>
          Code <span className={styles.summaryHint}>(equivalent snippet)</span>
        </summary>
        <div className={styles.codeActions}>
          <button type="button" className={styles.secondaryButton} onClick={copySnippet}>
            {copied ? 'Copied' : 'Copy code'}
          </button>
          <span aria-live="polite" className={styles.srOnly}>
            {copied ? 'Code copied to clipboard' : ''}
          </span>
        </div>
        <CodeBlock language="html">{snippet}</CodeBlock>
      </details>

      <div className={styles.statusRow}>
        <span role="status" aria-live="polite">
          {statusText}
        </span>
        {runDoc && (
          <button type="button" className={styles.linkButton} onClick={openInNewTab}>
            Open in new tab ↗
          </button>
        )}
      </div>

      {status !== 'idle' && (
        <div ref={stageRef}>
          <div className={styles.stage} style={{height: `${stageHeight}px`}}>
            {runDoc ? (
              <iframe
                key={runId}
                ref={iframeRef}
                className={styles.preview}
                title={`${schema.title ?? globalName} task`}
                srcDoc={runDoc}
                sandbox="allow-scripts"
              />
            ) : (
              <div className={styles.stagePlaceholder}>
                {status === 'stopped' ? 'Task stopped. Press Restart to run again.' : ''}
              </div>
            )}
          </div>
          <div
            className={styles.resizeHandle}
            role="separator"
            aria-orientation="horizontal"
            aria-label="Drag to resize the task. Use arrow keys to adjust."
            aria-valuenow={Math.round(stageHeight)}
            aria-valuemin={MIN_STAGE_HEIGHT}
            aria-valuemax={MAX_STAGE_HEIGHT}
            tabIndex={0}
            onPointerDown={startResize}
            onKeyDown={onResizeKey}>
            <span className={styles.grip} aria-hidden="true" />
          </div>
        </div>
      )}

      {runError && (
        <div className={styles.errorSummary} role="alert">
          {runError}
        </div>
      )}

      {rows && (
        <div className={styles.dataView}>
          <div className={styles.dataHeader}>
            <strong>Data</strong>
            <span className={styles.modifiedCount}>
              {rows.length} {rows.length === 1 ? 'trial' : 'trials'}
              {rows.length > MAX_TABLE_ROWS ? ` (first ${MAX_TABLE_ROWS} shown; CSV has all)` : ''}
            </span>
            <div className={styles.toolbarSpacer} />
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={downloadCsv}
              disabled={rows.length === 0}>
              Download CSV
            </button>
          </div>
          <div className={styles.tableScroll} role="region" aria-label="Trial data" tabIndex={0}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c} scope="col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowsShown.map((r, i) => (
                  <tr key={i}>
                    {columns.map((c) => (
                      <td key={c} title={formatCell(r[c])}>
                        {formatCell(r[c])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function PracticeRow(p: {
  field: FieldModel;
  enabled: boolean;
  value: unknown;
  errors: OptionError[];
  extra?: ReactNode;
  onToggle: (on: boolean) => void;
  onChange: (v: unknown) => void;
}): ReactElement {
  const uid = useId();
  const checkId = `practice-${uid}-${p.field.name}-toggle`;
  return (
    <FieldRow
      field={p.field}
      value={p.value}
      errors={p.errors}
      extra={p.extra}
      idPrefix="practice"
      hideEditor={!p.enabled}
      onChange={p.onChange}
      header={
        <label className={styles.checkLabel} htmlFor={checkId}>
          <input
            id={checkId}
            type="checkbox"
            checked={p.enabled}
            onChange={(e) => p.onToggle(e.target.checked)}
          />
          <span>Override in practice</span>
        </label>
      }
    />
  );
}

export function TimelineExample(props: TimelineExampleProps): ReactElement {
  return (
    <BrowserOnly fallback={<div className={styles.loading}>Loading interactive example…</div>}>
      {() => <TimelineExampleInner {...props} />}
    </BrowserOnly>
  );
}

export default TimelineExample;
