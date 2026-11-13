import {useEffect, useMemo, useRef} from 'react';
import type {ReactElement, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import CodeMirror from '@uiw/react-codemirror';
import {javascript} from '@codemirror/lang-javascript';
import {autocompletion, startCompletion} from '@codemirror/autocomplete';
import type {Completion, CompletionContext} from '@codemirror/autocomplete';
import {setDiagnostics} from '@codemirror/lint';
import type {Diagnostic} from '@codemirror/lint';
import {Decoration, EditorView, ViewPlugin, hoverTooltip} from '@codemirror/view';
import type {DecorationSet, ViewUpdate} from '@codemirror/view';
import {RangeSetBuilder} from '@codemirror/state';
import {useColorMode} from '@docusaurus/theme-common';
import {
  contextAt,
  defaultEntryRanges,
  entryAt,
  entryValue,
  keyCandidates,
  scanObjectText,
  schemaAtPath,
  toJsLiteral,
  valueOptions,
} from './model';
import type {FieldModel, PropertySchema, TimelineSchema} from './model';

/**
 * CodeMirror editor for the options object. Browser-only (CodeMirror touches
 * `document` at import time): index.tsx requires this module lazily inside
 * <BrowserOnly>, the same way PluginExample does.
 *
 * Features: key/enum-value autocomplete from the schema, hover help (rendered
 * by the caller via `renderHelp`, so sites can add e.g. evidence), lint
 * diagnostics supplied by the caller, de-emphasised lines whose value equals
 * the default, and a callback reporting which option the cursor is in.
 */

export type EditorDiagnostic = {
  from: number;
  to: number;
  message: string;
  severity: 'error' | 'warning';
};

export type ActiveOption = {name: string; phase: 'main' | 'practice'; value: unknown} | null;

type Props = {
  value: string;
  onChange: (value: string) => void;
  schema: TimelineSchema;
  fields: FieldModel[];
  diagnostics: EditorDiagnostic[];
  /** Help content for an option (description, default, site extras...). */
  renderHelp: (name: string, phase: 'main' | 'practice', value: unknown) => ReactNode;
  onActive: (active: ActiveOption) => void;
  ariaLabel: string;
};

const theme = EditorView.baseTheme({
  '.tle-default-line': {opacity: '0.5'},
  '.cm-tooltip.cm-tooltip-hover': {
    maxWidth: 'min(32rem, 90vw)',
    padding: '0.5rem 0.75rem',
    fontSize: '0.82rem',
    lineHeight: '1.4',
    fontFamily: 'var(--ifm-font-family-base)',
    whiteSpace: 'normal',
    border: '1px solid var(--ifm-color-emphasis-300)',
    background: 'var(--ifm-background-surface-color)',
    color: 'var(--ifm-font-color-base)',
    borderRadius: '8px',
  },
  '.cm-scroller': {fontFamily: 'var(--ifm-font-family-monospace)', lineHeight: '1.5'},
  '&.cm-focused': {outline: '2px solid var(--ifm-color-primary)'},
});

function reactTooltip(node: ReactNode) {
  const dom = document.createElement('div');
  dom.className = 'tle-tooltip-body';
  const root = createRoot(dom);
  root.render(node);
  return {dom, destroy: () => window.setTimeout(() => root.unmount(), 0)};
}

export default function TimelineCodeEditor(props: Props): ReactElement {
  const {colorMode} = useColorMode();
  const latest = useRef(props);
  latest.current = props;
  const viewRef = useRef<EditorView | null>(null);

  const extensions = useMemo(() => {
    const complete = (ctx: CompletionContext) => {
      const {schema, fields} = latest.current;
      const text = ctx.state.doc.toString();
      const c = contextAt(text, ctx.pos);
      if (c.kind === 'none' || !c.pathOk) return null;
      if (!ctx.explicit && c.from === ctx.pos && c.quote === null) {
        // Only auto-open on typing, not on every newline/space.
        const before = ctx.state.sliceDoc(Math.max(0, ctx.pos - 1), ctx.pos);
        if (!/[\w$"']/.test(before)) return null;
      }
      if (c.kind === 'key') {
        if (c.inArray) return null;
        const options: Completion[] = keyCandidates(schema, fields, c.path)
          .filter((k) => !c.present.includes(k.name))
          .map((k) => {
            const f = fields.find((x) => x.name === k.name && c.path.length === 0);
            const isPractice = c.path.length === 0 && k.name === 'practice';
            return {
              label: k.name,
              type: 'property',
              detail:
                f && f.hasDefault
                  ? `default ${toJsLiteral(f.default, 0).slice(0, 30)}`
                  : f?.unit,
              info: typeof k.schema.description === 'string' ? k.schema.description : undefined,
              apply: (view: EditorView, _c: Completion, from: number, to: number) => {
                const after = view.state.sliceDoc(to, to + 1);
                const closing = c.quote && after === c.quote ? 1 : 0;
                const insert = isPractice ? 'practice: {}' : `${k.name}: `;
                view.dispatch({
                  changes: {from: c.quote ? from - 1 : from, to: to + closing, insert},
                  selection: {
                    anchor: (c.quote ? from - 1 : from) + insert.length - (isPractice ? 1 : 0),
                  },
                });
                if (!isPractice) startCompletion(view);
              },
            } as Completion;
          });
        return {from: c.from, options, validFor: /^[\w$]*$/};
      }
      // value position
      let prop: PropertySchema | null = null;
      const container = schemaAtPath(schema, fields, c.path);
      if (c.inArray) prop = container?.items && !Array.isArray(container.items) ? container.items : null;
      else if (c.key) {
        const props = container?.properties ?? {};
        prop = props[c.key] ?? (container && typeof container.additionalProperties === 'object' ? (container.additionalProperties as PropertySchema) : null);
        if (!prop && container) {
          for (const b of [...(container.anyOf ?? []), ...(container.oneOf ?? [])]) {
            if (b.properties && b.properties[c.key]) prop = b.properties[c.key];
          }
        }
      }
      const opts = valueOptions(prop);
      if (opts.length === 0) return null;
      const options: Completion[] = opts.map((o) => {
        const inner = o.literal.startsWith('"') ? o.literal.slice(1, -1) : null;
        return {
          label: c.quote && inner !== null ? inner : o.literal,
          detail: o.detail,
          type: 'enum',
          apply:
            c.quote && inner !== null
              ? (view: EditorView, _c: Completion, from: number, to: number) => {
                  const after = view.state.sliceDoc(to, to + 1);
                  const closing = after === c.quote ? 1 : 0;
                  view.dispatch({
                    changes: {from, to: to + closing, insert: inner + c.quote},
                    selection: {anchor: from + inner.length + 1},
                  });
                }
              : undefined,
        } as Completion;
      }).filter((o) => !c.quote || o.type === 'enum');
      return {from: c.from, options, validFor: /^[\w$.-]*$/};
    };

    const hover = hoverTooltip(
      (view, pos) => {
        const entries = scanObjectText(view.state.doc.toString());
        const hit = entryAt(entries, pos, true);
        if (!hit) return null;
        const text = view.state.doc.toString();
        const value = entryValue(text, hit.entry);
        return {
          pos: hit.entry.keyFrom,
          end: hit.entry.keyTo,
          above: true,
          class: 'tle-tooltip',
          create: () => reactTooltip(latest.current.renderHelp(hit.name, hit.phase, value)),
        };
      },
      {hoverTime: 250},
    );

    const dim = ViewPlugin.fromClass(
      class {
        decorations: DecorationSet;
        constructor(view: EditorView) {
          this.decorations = this.build(view);
        }
        update(u: ViewUpdate) {
          if (u.docChanged) this.decorations = this.build(u.view);
        }
        build(view: EditorView): DecorationSet {
          const b = new RangeSetBuilder<Decoration>();
          const doc = view.state.doc;
          const ranges = defaultEntryRanges(doc.toString(), latest.current.fields);
          const mark = Decoration.line({class: 'tle-default-line'});
          const seen = new Set<number>();
          for (const r of ranges) {
            const l1 = doc.lineAt(r.from).number;
            const l2 = doc.lineAt(Math.min(r.to, doc.length)).number;
            for (let l = l1; l <= l2; l++) if (!seen.has(l)) seen.add(l);
          }
          for (const l of [...seen].sort((a, b) => a - b)) b.add(doc.line(l).from, doc.line(l).from, mark);
          return b.finish();
        }
      },
      {decorations: (v) => v.decorations},
    );

    const active = EditorView.updateListener.of((u) => {
      if (!(u.selectionSet || u.docChanged)) return;
      const text = u.state.doc.toString();
      const hit = entryAt(scanObjectText(text), u.state.selection.main.head);
      latest.current.onActive(
        hit ? {name: hit.name, phase: hit.phase, value: entryValue(text, hit.entry)} : null,
      );
    });

    return [
      javascript(),
      EditorView.lineWrapping,
      autocompletion({override: [complete]}),
      hover,
      dim,
      active,
      theme,
      EditorView.contentAttributes.of({'aria-label': latest.current.ariaLabel}),
    ];
    // Extensions read live props through `latest`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push lint diagnostics into the editor whenever they change.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const len = view.state.doc.length;
    const diags: Diagnostic[] = props.diagnostics.map((d) => ({
      from: Math.min(d.from, len),
      to: Math.min(Math.max(d.to, d.from + 1), len),
      message: d.message,
      severity: d.severity,
    }));
    view.dispatch(setDiagnostics(view.state, diags));
  }, [props.diagnostics, props.value]);

  return (
    <CodeMirror
      value={props.value}
      theme={colorMode === 'dark' ? 'dark' : 'light'}
      extensions={extensions}
      onChange={props.onChange}
      onCreateEditor={(view) => {
        viewRef.current = view;
      }}
      minHeight="8rem"
      maxHeight="32rem"
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        highlightActiveLine: false,
        highlightActiveLineGutter: false,
        autocompletion: false,
      }}
    />
  );
}
