/**
 * Pure (React-free, Docusaurus-free) logic behind <TimelineExample>: schema ->
 * form-field model, option diffing, lightweight draft-07 validation, URL-hash
 * codec, CSV export and the generated code snippet. Kept dependency-free so it
 * can be unit-tested with plain `node --test` against the compiled output.
 */

import JSON5 from 'json5';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | {[key: string]: JsonValue};

export type XJspsych = {
  group?: string;
  unit?: string;
  widget?: 'duration' | 'map' | 'bundle' | string;
  absentValue?: 'none' | null | 0;
  phaseOverridable?: boolean;
  advanced?: boolean;
  [key: string]: unknown;
};

export type PropertySchema = {
  type?: string | string[];
  enum?: unknown[];
  const?: unknown;
  default?: unknown;
  description?: string;
  title?: string;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minItems?: number;
  maxItems?: number;
  items?: PropertySchema;
  properties?: Record<string, PropertySchema>;
  required?: string[];
  additionalProperties?: boolean | PropertySchema;
  oneOf?: PropertySchema[];
  anyOf?: PropertySchema[];
  'x-jspsych'?: XJspsych;
  [key: string]: unknown;
};

export type Preset = {
  id: string;
  label: string;
  description?: string;
  options: Record<string, unknown>;
};

export type TimelineSchema = PropertySchema & {
  properties?: Record<string, PropertySchema>;
  'x-jspsych-presets'?: Preset[];
};

export type FieldKind =
  | 'enum'
  | 'boolean'
  | 'number'
  | 'integer'
  | 'string'
  | 'array'
  | 'duration'
  | 'map'
  | 'bundle'
  | 'json';

export type FieldModel = {
  name: string;
  schema: PropertySchema;
  kind: FieldKind;
  group: string;
  advanced: boolean;
  unit?: string;
  absentValue: 'none' | null | 0 | undefined;
  /** true when `null` is an accepted value (type includes "null"/enum has null). */
  nullable: boolean;
  phaseOverridable: boolean;
  hasDefault: boolean;
  default: unknown;
  description?: string;
  /** For enums: the selectable values (null/'none' entries included/added). */
  enumValues?: unknown[];
  /** For arrays: the element field model (kind of `items`). */
  item?: FieldModel;
  /** For maps: the value field model (kind of `additionalProperties`). */
  valueField?: FieldModel;
  /** For bundles: sub-field models. */
  children?: FieldModel[];
};

export type FieldGroup = {id: string; label: string; basic: FieldModel[]; advanced: FieldModel[]};

export type OptionError = {path: string; message: string};

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const hasOwn = (o: object, k: string): boolean =>
  Object.prototype.hasOwnProperty.call(o, k);

export const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (Array.isArray(a)) {
    return (
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((x, i) => deepEqual(x, b[i]))
    );
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    return ka.length === kb.length && ka.every((k) => hasOwn(b, k) && deepEqual(a[k], b[k]));
  }
  return false;
}

export const clone = <T,>(v: T): T =>
  v === undefined ? v : (JSON.parse(JSON.stringify(v)) as T);

const typesOf = (s: PropertySchema): string[] =>
  s.type === undefined ? [] : Array.isArray(s.type) ? s.type : [s.type];

// ---------------------------------------------------------------------------
// Schema -> field model
// ---------------------------------------------------------------------------

export const GROUP_ORDER = [
  'timing',
  'stimulus',
  'design',
  'response',
  'procedure',
  'feedback',
  'instructions',
  'population',
] as const;

const GROUP_LABELS: Record<string, string> = {
  timing: 'Timing',
  stimulus: 'Stimulus',
  design: 'Design',
  response: 'Response',
  procedure: 'Procedure',
  feedback: 'Feedback',
  instructions: 'Instructions',
  population: 'Population',
  other: 'Other',
};

export const OTHER_GROUP = 'other';

const titleCase = (s: string): string =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/[_-]+/g, ' ') : s;

export const groupLabel = (id: string): string => GROUP_LABELS[id] ?? titleCase(id);

/** Decide which widget a schema gets. Explicit `x-jspsych.widget` wins when
 * its shape is compatible; anything unrecognised falls back to 'json'. */
export function classify(schema: PropertySchema): FieldKind {
  const x = schema['x-jspsych'];
  const widget = x?.widget;
  if (widget === 'duration') return 'duration';
  if (widget === 'map') return 'map';
  if (widget === 'bundle') {
    return isPlainObject(schema.properties) ? 'bundle' : 'json';
  }
  if (Array.isArray(schema.enum)) return 'enum';
  const types = typesOf(schema).filter((t) => t !== 'null');
  if (types.length !== 1) return 'json';
  switch (types[0]) {
    case 'boolean':
      return 'boolean';
    case 'number':
      return 'number';
    case 'integer':
      return 'integer';
    case 'string':
      return 'string';
    case 'array': {
      const it = schema.items;
      if (it && !Array.isArray(it) && classifyIsPrimitive(it)) return 'array';
      return 'json';
    }
    case 'object':
      // A plain object with additionalProperties and no widget: still a map.
      if (
        isPlainObject(schema.additionalProperties) &&
        !schema.properties
      ) {
        return 'map';
      }
      return 'json';
    default:
      return 'json';
  }
}

function classifyIsPrimitive(s: PropertySchema): boolean {
  const k = classify(s);
  return k === 'enum' || k === 'boolean' || k === 'number' || k === 'integer' || k === 'string';
}

function isNullable(schema: PropertySchema): boolean {
  if (typesOf(schema).includes('null')) return true;
  if (Array.isArray(schema.enum) && schema.enum.includes(null)) return true;
  return false;
}

export function fieldModel(name: string, schema: PropertySchema): FieldModel {
  const x = schema['x-jspsych'] ?? {};
  const kind = classify(schema);
  const m: FieldModel = {
    name,
    schema,
    kind,
    group: typeof x.group === 'string' && x.group ? x.group : OTHER_GROUP,
    advanced: x.advanced === true,
    unit: typeof x.unit === 'string' ? x.unit : undefined,
    absentValue:
      x.absentValue === 'none' || x.absentValue === null || x.absentValue === 0
        ? x.absentValue
        : undefined,
    nullable: isNullable(schema),
    phaseOverridable: x.phaseOverridable === true,
    hasDefault: hasOwn(schema, 'default'),
    default: schema.default,
    description: typeof schema.description === 'string' ? schema.description : undefined,
  };
  if (kind === 'enum') {
    const vals = [...(schema.enum as unknown[])];
    // absentValue "none" promises a "none" choice even if the schema forgot it.
    if (m.absentValue === 'none' && !vals.includes('none')) vals.unshift('none');
    m.enumValues = vals;
  } else if (kind === 'array') {
    m.item = fieldModel('item', schema.items as PropertySchema);
  } else if (kind === 'map') {
    const ap = schema.additionalProperties;
    m.valueField = fieldModel('value', isPlainObject(ap) ? (ap as PropertySchema) : {type: 'string'});
  } else if (kind === 'bundle') {
    m.children = Object.entries(schema.properties ?? {}).map(([n, s]) => fieldModel(n, s));
  }
  return m;
}

export function fieldsOf(schema: TimelineSchema): FieldModel[] {
  return Object.entries(schema.properties ?? {})
    .filter(([name]) => name !== 'practice') // reserved: emitted from practice overrides
    .map(([name, s]) => fieldModel(name, s));
}

export function groupFields(fields: FieldModel[]): FieldGroup[] {
  const byGroup = new Map<string, FieldModel[]>();
  for (const f of fields) {
    const list = byGroup.get(f.group) ?? [];
    list.push(f);
    byGroup.set(f.group, list);
  }
  const known = GROUP_ORDER.filter((g) => byGroup.has(g)) as string[];
  const extra = [...byGroup.keys()]
    .filter((g) => !(GROUP_ORDER as readonly string[]).includes(g) && g !== OTHER_GROUP)
    .sort();
  const order = [...known, ...extra, ...(byGroup.has(OTHER_GROUP) ? [OTHER_GROUP] : [])];
  return order.map((id) => {
    const list = byGroup.get(id)!;
    return {
      id,
      label: groupLabel(id),
      basic: list.filter((f) => !f.advanced),
      advanced: list.filter((f) => f.advanced),
    };
  });
}

export const phaseOverridableFields = (fields: FieldModel[]): FieldModel[] =>
  fields.filter((f) => f.phaseOverridable);

/** Presets from the prop, else from the schema's `x-jspsych-presets`. */
export function resolvePresets(schema: TimelineSchema, presets?: Preset[]): Preset[] {
  const src = presets ?? schema['x-jspsych-presets'];
  return Array.isArray(src)
    ? src.filter((p) => p && typeof p.id === 'string' && isPlainObject(p.options))
    : [];
}

// ---------------------------------------------------------------------------
// Values & diffing
//
// State model: `overrides` holds only the options whose value differs from the
// schema default (i.e. exactly what is emitted). A field without an overriding
// entry displays its default. Fields with no `default` are "unset" until the
// user supplies a value, and are omitted from output when unset.
// ---------------------------------------------------------------------------

export type Options = Record<string, unknown>;

/** Value a field currently shows/has. */
export function effectiveValue(field: FieldModel, overrides: Options): unknown {
  return hasOwn(overrides, field.name) ? overrides[field.name] : field.default;
}

/** Set one option, dropping the entry if it equals the default (or is unset). */
export function setOption(
  field: FieldModel,
  overrides: Options,
  value: unknown,
): Options {
  const next = {...overrides};
  if (value === undefined || (field.hasDefault && deepEqual(value, field.default))) {
    delete next[field.name];
  } else {
    next[field.name] = value;
  }
  return next;
}

/** Reduce a (possibly full) options object to those differing from defaults,
 * dropping keys the schema does not know. `practice` is handled separately. */
export function diffOptions(fields: FieldModel[], values: Options): Options {
  const out: Options = {};
  for (const f of fields) {
    if (!hasOwn(values, f.name)) continue;
    const v = values[f.name];
    if (v === undefined) continue;
    if (f.hasDefault && deepEqual(v, f.default)) continue;
    out[f.name] = clone(v);
  }
  return out;
}

/** Split a preset/hash options object into base overrides and practice. */
export function splitOptions(
  fields: FieldModel[],
  raw: Options,
): {overrides: Options; practice: Options} {
  const overrides = diffOptions(fields, raw);
  const practice: Options = {};
  if (isPlainObject(raw.practice)) {
    for (const f of phaseOverridableFields(fields)) {
      if (hasOwn(raw.practice, f.name) && raw.practice[f.name] !== undefined) {
        practice[f.name] = clone(raw.practice[f.name]);
      }
    }
  }
  return {overrides, practice};
}

/** The options object to emit: overrides plus `practice` when non-empty. */
export function buildOptions(overrides: Options, practice: Options): Options {
  const out: Options = {...overrides};
  if (Object.keys(practice).length > 0) out.practice = {...practice};
  return out;
}

/** The value an unset bundle starts with when switched on: sub-defaults filled
 * in (so the generated object is complete), nothing for default-less fields
 * except required ones, which get a type-appropriate zero value. */
export function initialBundleValue(field: FieldModel): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const required = field.schema.required ?? [];
  for (const c of field.children ?? []) {
    if (c.hasDefault && c.default !== undefined) out[c.name] = clone(c.default);
    else if (required.includes(c.name)) out[c.name] = zeroValue(c);
    else if (c.kind === 'enum' && c.enumValues?.length) out[c.name] = c.enumValues[0];
  }
  return out;
}

export function zeroValue(field: FieldModel): unknown {
  switch (field.kind) {
    case 'boolean':
      return false;
    case 'number':
    case 'integer':
      return typeof field.schema.minimum === 'number' ? field.schema.minimum : 0;
    case 'string':
      return '';
    case 'enum':
      return field.enumValues?.[0];
    case 'array':
      return [];
    case 'map':
    case 'json':
      return {};
    case 'bundle':
      return initialBundleValue(field);
    case 'duration':
      return 0;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Lightweight JSON Schema (draft-07 subset) validation
// ---------------------------------------------------------------------------

function typeMatches(t: string, v: unknown): boolean {
  switch (t) {
    case 'null':
      return v === null;
    case 'boolean':
      return typeof v === 'boolean';
    case 'number':
      return typeof v === 'number' && Number.isFinite(v);
    case 'integer':
      return typeof v === 'number' && Number.isInteger(v);
    case 'string':
      return typeof v === 'string';
    case 'array':
      return Array.isArray(v);
    case 'object':
      return isPlainObject(v);
    default:
      return true;
  }
}

const describeValue = (v: unknown): string =>
  v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v;

export function validateValue(
  schema: PropertySchema,
  value: unknown,
  path: string,
  errors: OptionError[] = [],
): OptionError[] {
  const err = (message: string) => errors.push({path, message});
  const types = typesOf(schema);
  if (types.length && !types.some((t) => typeMatches(t, value))) {
    err(`must be ${types.join(' or ')} (got ${describeValue(value)})`);
    return errors;
  }
  if (hasOwn(schema, 'const') && !deepEqual(schema.const, value)) {
    err(`must equal ${JSON.stringify(schema.const)}`);
  }
  if (Array.isArray(schema.enum) && !schema.enum.some((e) => deepEqual(e, value))) {
    err(`must be one of ${schema.enum.map((e) => JSON.stringify(e)).join(', ')}`);
  }
  if (typeof value === 'number') {
    if (typeof schema.minimum === 'number' && value < schema.minimum)
      err(`must be at least ${schema.minimum}`);
    if (typeof schema.maximum === 'number' && value > schema.maximum)
      err(`must be at most ${schema.maximum}`);
    if (typeof schema.exclusiveMinimum === 'number' && value <= schema.exclusiveMinimum)
      err(`must be greater than ${schema.exclusiveMinimum}`);
    if (typeof schema.exclusiveMaximum === 'number' && value >= schema.exclusiveMaximum)
      err(`must be less than ${schema.exclusiveMaximum}`);
    if (typeof schema.multipleOf === 'number' && schema.multipleOf > 0) {
      const q = value / schema.multipleOf;
      if (Math.abs(q - Math.round(q)) > 1e-9) err(`must be a multiple of ${schema.multipleOf}`);
    }
  }
  if (typeof value === 'string') {
    if (typeof schema.minLength === 'number' && value.length < schema.minLength)
      err(`must be at least ${schema.minLength} characters`);
    if (typeof schema.maxLength === 'number' && value.length > schema.maxLength)
      err(`must be at most ${schema.maxLength} characters`);
    if (typeof schema.pattern === 'string') {
      try {
        if (!new RegExp(schema.pattern).test(value)) err(`must match pattern ${schema.pattern}`);
      } catch {
        /* invalid pattern in schema: ignore */
      }
    }
  }
  if (Array.isArray(value)) {
    if (typeof schema.minItems === 'number' && value.length < schema.minItems)
      err(`must have at least ${schema.minItems} items`);
    if (typeof schema.maxItems === 'number' && value.length > schema.maxItems)
      err(`must have at most ${schema.maxItems} items`);
    if (schema.items && !Array.isArray(schema.items)) {
      value.forEach((v, i) => validateValue(schema.items as PropertySchema, v, `${path}[${i}]`, errors));
    }
  }
  if (isPlainObject(value)) {
    for (const r of schema.required ?? []) {
      if (!hasOwn(value, r) || value[r] === undefined) {
        errors.push({path: path ? `${path}.${r}` : r, message: 'is required'});
      }
    }
    const props = schema.properties ?? {};
    for (const [k, v] of Object.entries(value)) {
      const child = path ? `${path}.${k}` : k;
      if (hasOwn(props, k)) validateValue(props[k], v, child, errors);
      else if (isPlainObject(schema.additionalProperties)) {
        validateValue(schema.additionalProperties as PropertySchema, v, child, errors);
      } else if (schema.additionalProperties === false) {
        errors.push({path: child, message: 'is not an allowed option'});
      }
    }
  }
  const alts = schema.oneOf ?? schema.anyOf;
  if (alts && alts.length) {
    const matching = alts.filter((a) => validateValue(a, value, path, []).length === 0).length;
    const ok = schema.oneOf ? matching === 1 : matching >= 1;
    if (!ok) {
      // Report the failure of the "closest" alternative: one whose type matches.
      const typed = alts.find((a) => {
        const ts = typesOf(a);
        return ts.length === 0 || ts.some((t) => typeMatches(t, value));
      });
      if (typed && matching === 0) validateValue(typed, value, path, errors);
      else err(matching === 0 ? 'does not match any allowed form' : 'matches more than one allowed form');
    }
  }
  return errors;
}

/** Validate an emitted options object (and its `practice` block) against the
 * schema. Top-level properties not in the schema are errors only when the
 * schema forbids additional properties. */
export function validateOptions(
  schema: TimelineSchema,
  fields: FieldModel[],
  options: Options,
): OptionError[] {
  const errors: OptionError[] = [];
  const byName = new Map(fields.map((f) => [f.name, f]));
  for (const [k, v] of Object.entries(options)) {
    if (k === 'practice') {
      if (!isPlainObject(v)) {
        errors.push({path: 'practice', message: 'must be an object'});
        continue;
      }
      for (const [pk, pv] of Object.entries(v)) {
        const f = byName.get(pk);
        if (!f || !f.phaseOverridable) {
          errors.push({path: `practice.${pk}`, message: 'is not a phase-overridable option'});
        } else validateValue(f.schema, pv, `practice.${pk}`, errors);
      }
      continue;
    }
    const f = byName.get(k);
    if (f) validateValue(f.schema, v, k, errors);
    else if (schema.additionalProperties === false) errors.push({path: k, message: 'is not an allowed option'});
  }
  for (const r of schema.required ?? []) {
    if (!hasOwn(options, r) && !byName.get(r)?.hasDefault) {
      errors.push({path: r, message: 'is required'});
    }
  }
  return errors;
}

/** Errors for a given top-level option name (`a`, `a.b`, `a[0]`, `practice.a`). */
export function errorsFor(errors: OptionError[], name: string, practice = false): OptionError[] {
  const base = practice ? `practice.${name}` : name;
  return errors.filter(
    (e) => e.path === base || e.path.startsWith(base + '.') || e.path.startsWith(base + '['),
  );
}

// ---------------------------------------------------------------------------
// URL hash codec
// ---------------------------------------------------------------------------

function toBase64Url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeOptionsToHash(key: string, options: Options): string {
  return `${key}=${toBase64Url(JSON.stringify(options))}`;
}

/** Find `key=<payload>` among `&`-separated hash params. Returns the decoded
 * options object, or null if absent/garbled. Never throws. */
export function decodeOptionsFromHash(key: string, hash: string): Options | null {
  const parts = hash.replace(/^#/, '').split('&');
  for (const p of parts) {
    const i = p.indexOf('=');
    if (i < 0 || p.slice(0, i) !== key) continue;
    try {
      const v = JSON.parse(fromBase64Url(p.slice(i + 1)));
      return isPlainObject(v) ? v : null;
    } catch {
      return null;
    }
  }
  return null;
}

/** Replace/remove our `key=` param in a hash string, keeping other params. */
export function updateHash(key: string, hash: string, options: Options | null): string {
  const parts = hash
    .replace(/^#/, '')
    .split('&')
    .filter((p) => p && p.slice(0, p.indexOf('=') < 0 ? p.length : p.indexOf('=')) !== key);
  if (options && Object.keys(options).length > 0) parts.push(encodeOptionsToHash(key, options));
  return parts.length ? '#' + parts.join('&') : '';
}

// ---------------------------------------------------------------------------
// Code generation & srcdoc
// ---------------------------------------------------------------------------

/** JSON that is safe inside an inline <script>: `<` can't open `</script>`
 * or `<!--`, and U+2028/9 are valid in JSON but not in older JS strings. */
export function safeJson(value: unknown, indent?: number): string {
  return JSON.stringify(value, null, indent)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/** Pretty JS object literal: unquoted keys when they are identifiers. */
export function toJsLiteral(value: unknown, indent = 0): string {
  const pad = (n: number) => '  '.repeat(n);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const inline = JSON.stringify(value);
    if (inline.length <= 60 && !value.some((v) => typeof v === 'object' && v !== null)) {
      return inline.replace(/,/g, ', ');
    }
    return `[\n${value.map((v) => pad(indent + 1) + toJsLiteral(v, indent + 1)).join(',\n')}\n${pad(indent)}]`;
  }
  if (isPlainObject(value)) {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return '{}';
    const body = entries
      .map(([k, v]) => `${pad(indent + 1)}${IDENT.test(k) ? k : JSON.stringify(k)}: ${toJsLiteral(v, indent + 1)}`)
      .join(',\n');
    return `{\n${body}\n${pad(indent)}}`;
  }
  return JSON.stringify(value);
}

export type ScriptRefs = {
  jspsychVersion: string;
  /** Absolute or unpkg-specifier entries, already resolved to full URLs. */
  dependencyUrls: string[];
  bundleUrl: string;
};

export function buildSnippet(args: ScriptRefs & {globalName: string; options: Options}): string {
  const {jspsychVersion, dependencyUrls, bundleUrl, globalName, options} = args;
  const tags = [
    `<script src="https://unpkg.com/jspsych@${jspsychVersion}"></script>`,
    ...dependencyUrls.map((u) => `<script src="${u}"></script>`),
    `<script src="${bundleUrl}"></script>`,
    `<link rel="stylesheet" href="https://unpkg.com/jspsych@${jspsychVersion}/css/jspsych.css" />`,
  ];
  const hasOptions = Object.keys(options).length > 0;
  return `${tags.join('\n')}

<script>
  const jsPsych = initJsPsych();

  const { timeline } = ${globalName}.createTimeline(jsPsych${
    hasOptions ? ', ' + toJsLiteral(options, 1) : ''
  });

  jsPsych.run(timeline);
</script>`;
}

export const MESSAGE_SOURCE = 'jspsych-timeline-example';

export function buildTimelineSrcDoc(
  args: ScriptRefs & {globalName: string; options: Options; nonce: string},
): string {
  const {jspsychVersion, dependencyUrls, bundleUrl, globalName, options, nonce} = args;
  const tags = [
    `<script src="https://unpkg.com/jspsych@${jspsychVersion}"></script>`,
    ...dependencyUrls.map((u) => `<script src="${escapeAttr(u)}"></script>`),
    `<script src="${escapeAttr(bundleUrl)}"></script>`,
  ].map((t) => '    ' + t);
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <!-- run ${nonce} -->
${tags.join('\n')}
    <link rel="stylesheet" href="https://unpkg.com/jspsych@${jspsychVersion}/css/jspsych.css" />
    <style>
      html, body { margin: 0; background: #fff; }
      #tle-error {
        margin: 1.5rem; padding: 1rem 1.25rem; white-space: pre-wrap;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 14px; line-height: 1.5; color: #b3261e;
        background: #fdecea; border: 1px solid #f3c4bf; border-radius: 8px;
      }
    </style>
  </head>
  <body></body>
  <script>
    (function () {
      var SOURCE = ${safeJson(MESSAGE_SOURCE)};
      var NONCE = ${safeJson(nonce)};
      function post(msg) {
        msg.source = SOURCE; msg.nonce = NONCE;
        try { if (window.parent !== window) window.parent.postMessage(msg, '*'); } catch (e) {}
      }
      function fail(message) {
        var pre = document.createElement('pre');
        pre.id = 'tle-error';
        pre.textContent = message;
        document.body.innerHTML = '';
        document.body.appendChild(pre);
        post({type: 'error', message: message});
      }
      window.addEventListener('error', function (event) {
        fail(typeof initJsPsych === 'undefined'
          ? 'Could not load jsPsych. You must be online to run this task.'
          : (event.error && event.error.message) || event.message);
      });
      window.addEventListener('unhandledrejection', function (event) {
        fail(String((event.reason && event.reason.message) || event.reason));
      });
      window.addEventListener('load', function () {
        if (typeof initJsPsych === 'undefined') return fail('Could not load jsPsych. You must be online to run this task.');
        var pkg = window[${safeJson(globalName)}];
        if (!pkg || typeof pkg.createTimeline !== 'function') {
          return fail('The timeline bundle did not load: window.' + ${safeJson(globalName)} + '.createTimeline is not available.');
        }
        var jsPsych = initJsPsych({
          on_finish: function () {
            post({type: 'finish', data: jsPsych.data.get().json()});
          }
        });
        var options = ${safeJson(options)};
        var result = pkg.createTimeline(jsPsych, options);
        post({type: 'started'});
        jsPsych.run(result.timeline);
      });
    })();
  </script>
</html>`;
}

const escapeAttr = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Treat full URLs as-is, site-relative paths via `resolve`, and anything
 * else as an unpkg specifier (`pkg@version[/path]`). */
export function resolveScriptUrl(spec: string, resolve: (path: string) => string): string {
  if (/^(https?:)?\/\//i.test(spec)) return spec;
  if (spec.startsWith('/') || spec.startsWith('./')) return resolve(spec);
  return `https://unpkg.com/${spec}`;
}

// ---------------------------------------------------------------------------
// Data table / CSV
// ---------------------------------------------------------------------------

export function parseTrialData(json: unknown): Record<string, unknown>[] {
  try {
    const v = typeof json === 'string' ? JSON.parse(json) : json;
    return Array.isArray(v) ? v.filter(isPlainObject) : [];
  } catch {
    return [];
  }
}

export function dataColumns(rows: Record<string, unknown>[]): string[] {
  const cols: string[] = [];
  const seen = new Set<string>();
  for (const r of rows) {
    for (const k of Object.keys(r)) {
      if (!seen.has(k)) {
        seen.add(k);
        cols.push(k);
      }
    }
  }
  return cols;
}

export function formatCell(v: unknown): string {
  if (v === undefined || v === null) return '';
  return typeof v === 'object' ? JSON.stringify(v) : String(v);
}

export function toCsv(rows: Record<string, unknown>[], columns = dataColumns(rows)): string {
  const q = (s: string) => (/[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  const lines = [columns.map(q).join(',')];
  for (const r of rows) lines.push(columns.map((c) => q(formatCell(r[c]))).join(','));
  return lines.join('\r\n');
}

// ===========================================================================
// Text mode: the options object as editable JSON5/JS text
// ===========================================================================

export type ParseResult =
  | {ok: true; value: Options}
  | {ok: false; message: string; from: number; to: number};

function offsetOf(text: string, line: number, col: number): number {
  let off = 0;
  for (let l = 1; l < line; l++) {
    const nl = text.indexOf('\n', off);
    if (nl < 0) return text.length;
    off = nl + 1;
  }
  return Math.min(text.length, off + Math.max(0, col - 1));
}

/** Lenient parse: comments, unquoted keys, single quotes, trailing commas
 * (JSON5). Empty text means `{}`. The result must be an object. */
export function parseOptionsText(text: string): ParseResult {
  if (text.trim() === '' ) return {ok: true, value: {}};
  try {
    const v = JSON5.parse(text);
    if (!isPlainObject(v)) {
      return {ok: false, message: 'Options must be an object, like { numTestTrials: 20 }.', from: 0, to: Math.min(1, text.length)};
    }
    return {ok: true, value: v};
  } catch (e) {
    const err = e as {message?: string; lineNumber?: number; columnNumber?: number};
    const at =
      typeof err.lineNumber === 'number' && typeof err.columnNumber === 'number'
        ? offsetOf(text, err.lineNumber, err.columnNumber)
        : 0;
    const from = Math.min(at, Math.max(0, text.length - 1));
    return {
      ok: false,
      message: `Syntax error: ${(err.message ?? 'cannot parse').replace(/^JSON5: /, '')}`,
      from,
      to: Math.min(text.length, from + 1),
    };
  }
}

/** Drop values equal to their schema default (and empty `practice`), keeping
 * unknown keys so the validator can report them. Pure; does not mutate. */
export function stripDefaults(fields: FieldModel[], raw: Options): Options {
  const byName = new Map(fields.map((f) => [f.name, f]));
  const out: Options = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v === undefined) continue;
    if (k === 'practice') {
      if (isPlainObject(v)) {
        const p: Options = {};
        for (const [pk, pv] of Object.entries(v)) if (pv !== undefined) p[pk] = clone(pv);
        if (Object.keys(p).length > 0) out.practice = p;
      } else out.practice = clone(v);
      continue;
    }
    const f = byName.get(k);
    if (f && f.hasDefault && deepEqual(v, f.default)) continue;
    out[k] = clone(v);
  }
  return out;
}

function orderedKeys(fields: FieldModel[], obj: Options, practiceBlock = false): Options {
  const rank = new Map(fields.map((f, i) => [f.name, i]));
  const keys = Object.keys(obj).sort((a, b) => {
    const ra = a === 'practice' && !practiceBlock ? 1e6 : rank.get(a) ?? 2e6;
    const rb = b === 'practice' && !practiceBlock ? 1e6 : rank.get(b) ?? 2e6;
    return ra - rb;
  });
  const out: Options = {};
  for (const k of keys) out[k] = obj[k];
  return out;
}

/** Minimal text view: only the given (already stripped) options. */
export function stringifyOptions(fields: FieldModel[], options: Options): string {
  const o = orderedKeys(fields, options);
  if (isPlainObject(o.practice)) o.practice = orderedKeys(fields, o.practice, true);
  return Object.keys(o).length === 0 ? '{}' : toJsLiteral(o, 0);
}

/** A readable type description for options without a default. */
export function typeHint(f: FieldModel): string {
  const base = (() => {
    switch (f.kind) {
      case 'enum': {
        const t = (f.enumValues ?? []).map((v) => JSON.stringify(v)).join(' | ');
        return t.length > 70 ? t.slice(0, 67) + '...' : t;
      }
      case 'boolean':
        return 'boolean';
      case 'number':
      case 'integer':
        return 'number';
      case 'string':
        return 'string';
      case 'array':
        {
        const it = f.item ? typeHint(f.item) : 'any';
        return `${it.includes(' | ') ? `(${it})` : it}[]`;
      }
      case 'duration':
        return 'number | {min, max, step}';
      case 'map':
        return `{[key: string]: ${f.valueField ? typeHint(f.valueField) : 'any'}}`;
      case 'bundle':
        return `{${(f.children ?? []).map((c) => c.name).join(', ')}}`;
      default:
        return f.schema.type && !Array.isArray(f.schema.type) ? String(f.schema.type) : 'value';
    }
  })();
  return f.nullable ? `${base} | null` : base;
}

const entryLine = (indent: string, key: string, value: unknown): string =>
  `${indent}${IDENT.test(key) ? key : JSON.stringify(key)}: ${toJsLiteral(value, 1)},`;

/** Maximalist text view: every option with its default (or the supplied
 * value), grouped under `// Group` comments; advanced options last. Options
 * without a default appear as a commented-out placeholder. */
export function renderFullText(
  fields: FieldModel[],
  options: Options,
  /** Names of options set by the active preset; their non-default lines get a trailing `// preset` marker. */
  presetKeys: ReadonlySet<string> = new Set(),
): string {
  const known = new Set(fields.map((f) => f.name));
  const lines: string[] = ['{'];
  const emit = (f: FieldModel) => {
    if (Object.prototype.hasOwnProperty.call(options, f.name) && options[f.name] !== undefined) {
      const mark =
        presetKeys.has(f.name) && !(f.hasDefault && deepEqual(options[f.name], f.default))
          ? ' // preset'
          : '';
      lines.push(entryLine('  ', f.name, options[f.name]) + mark);
    } else if (f.hasDefault && f.default !== undefined) {
      lines.push(entryLine('  ', f.name, f.default));
    } else {
      lines.push(`  // ${IDENT.test(f.name) ? f.name : JSON.stringify(f.name)}: ${typeHint(f)}, // no default`);
    }
  };
  const groups = groupFields(fields);
  let first = true;
  const section = (title: string, list: FieldModel[]) => {
    if (list.length === 0) return;
    if (!first) lines.push('');
    first = false;
    lines.push(`  // ${title}`);
    list.forEach(emit);
  };
  for (const g of groups) section(g.label, g.basic);
  section('Advanced', groups.flatMap((g) => g.advanced));
  const overridable = phaseOverridableFields(fields);
  if (overridable.length > 0 || isPlainObject(options.practice)) {
    if (!first) lines.push('');
    lines.push('  // Practice overrides (any option marked overridable)');
    if (isPlainObject(options.practice) && Object.keys(options.practice).length > 0) {
      lines.push(entryLine('  ', 'practice', orderedKeys(fields, options.practice, true)));
    } else {
      lines.push(`  // practice: {},`);
    }
  }
  const unknown = Object.keys(options).filter((k) => !known.has(k) && k !== 'practice');
  if (unknown.length) {
    lines.push('', '  // Unknown options');
    for (const k of unknown) lines.push(entryLine('  ', k, options[k]));
  }
  lines.push('}');
  return lines.join('\n');
}

// ---- lightweight structural scan (tolerant of half-typed text) ------------

export type ScanEntry = {
  key: string;
  keyFrom: number;
  keyTo: number;
  valueFrom: number;
  valueTo: number;
  children?: ScanEntry[];
};

const WORD = /[\w$]/;

function skipTrivia(t: string, i: number): number {
  while (i < t.length) {
    const c = t[i];
    if (/\s/.test(c)) i++;
    else if (c === '/' && t[i + 1] === '/') {
      const nl = t.indexOf('\n', i);
      i = nl < 0 ? t.length : nl + 1;
    } else if (c === '/' && t[i + 1] === '*') {
      const e = t.indexOf('*/', i + 2);
      i = e < 0 ? t.length : e + 2;
    } else break;
  }
  return i;
}

function skipString(t: string, i: number): number {
  const q = t[i];
  i++;
  while (i < t.length && t[i] !== q) i += t[i] === '\\' ? 2 : 1;
  return Math.min(t.length, i + 1);
}

function skipBalanced(t: string, i: number): number {
  let depth = 0;
  while (i < t.length) {
    const c = t[i];
    if (c === '"' || c === "'") {
      i = skipString(t, i);
      continue;
    }
    if (c === '/' && (t[i + 1] === '/' || t[i + 1] === '*')) {
      i = skipTrivia(t, i);
      continue;
    }
    if (c === '{' || c === '[') depth++;
    if (c === '}' || c === ']') {
      depth--;
      if (depth === 0) return i + 1;
    }
    i++;
  }
  return t.length;
}

function scanObj(t: string, open: number): {entries: ScanEntry[]; end: number} {
  const entries: ScanEntry[] = [];
  let i = open + 1;
  for (;;) {
    i = skipTrivia(t, i);
    if (i >= t.length) return {entries, end: t.length};
    const c = t[i];
    if (c === '}') return {entries, end: i + 1};
    if (c === ',') {
      i++;
      continue;
    }
    let key = '';
    const keyFrom = i;
    if (c === '"' || c === "'") {
      const e = skipString(t, i);
      key = t.slice(i + 1, Math.max(i + 1, e - 1));
      i = e;
    } else if (WORD.test(c)) {
      while (i < t.length && WORD.test(t[i])) i++;
      key = t.slice(keyFrom, i);
    } else {
      i++;
      continue;
    }
    const keyTo = i;
    i = skipTrivia(t, i);
    if (t[i] !== ':') continue; // half-typed key without a value
    i = skipTrivia(t, i + 1);
    const valueFrom = i;
    let children: ScanEntry[] | undefined;
    const v = t[i];
    if (v === '{') {
      const r = scanObj(t, i);
      children = r.entries;
      i = r.end;
    } else if (v === '[') {
      i = skipBalanced(t, i);
    } else if (v === '"' || v === "'") {
      i = skipString(t, i);
    } else {
      while (i < t.length && !/[\s,}\]]/.test(t[i]) && !(t[i] === '/' && (t[i + 1] === '/' || t[i + 1] === '*'))) i++;
    }
    entries.push({key, keyFrom, keyTo, valueFrom, valueTo: i, children});
  }
}

/** Entries of the top-level object in `text`, or null if there is none. */
export function scanObjectText(text: string): ScanEntry[] | null {
  const i = skipTrivia(text, 0);
  if (text[i] !== '{') return null;
  return scanObj(text, i).entries;
}

function parseSpan(text: string, e: ScanEntry): {ok: boolean; value?: unknown} {
  try {
    return {ok: true, value: JSON5.parse(text.slice(e.valueFrom, e.valueTo))};
  } catch {
    return {ok: false};
  }
}

/** Top-level entries whose value equals the schema default (for dimming). */
export function defaultEntryRanges(
  text: string,
  fields: FieldModel[],
): {name: string; from: number; to: number}[] {
  const entries = scanObjectText(text);
  if (!entries) return [];
  const byName = new Map(fields.map((f) => [f.name, f]));
  const out: {name: string; from: number; to: number}[] = [];
  for (const e of entries) {
    const f = byName.get(e.key);
    if (!f || !f.hasDefault) continue;
    const r = parseSpan(text, e);
    if (r.ok && deepEqual(r.value, f.default)) out.push({name: e.key, from: e.keyFrom, to: e.valueTo});
  }
  return out;
}

/** Range in the text for a validator path such as `a.b[0].c` or
 * `practice.x`. Falls back to the deepest entry that exists. */
export function locatePath(
  entries: ScanEntry[] | null,
  path: string,
): {from: number; to: number} | null {
  if (!entries) return null;
  const tokens = path.replace(/\[\d+\]/g, '.[]').split('.').filter(Boolean);
  let cur: ScanEntry[] | undefined = entries;
  let found: ScanEntry | null = null;
  for (const tok of tokens) {
    if (tok === '[]' || !cur) break;
    const e: ScanEntry | undefined = cur.find((x) => x.key === tok);
    if (!e) break;
    found = e;
    cur = e.children;
  }
  return found ? {from: found.keyFrom, to: Math.max(found.valueTo, found.keyTo)} : null;
}

/** The option under offset `pos`: top-level, or inside `practice`. */
export function entryAt(
  entries: ScanEntry[] | null,
  pos: number,
  keyOnly = false,
): {name: string; phase: 'main' | 'practice'; entry: ScanEntry} | null {
  if (!entries) return null;
  const hit = (e: ScanEntry) =>
    keyOnly ? pos >= e.keyFrom && pos <= e.keyTo : pos >= e.keyFrom && pos <= e.valueTo;
  for (const e of entries) {
    if (e.key === 'practice' && e.children && pos >= e.valueFrom && pos <= e.valueTo) {
      for (const c of e.children) if (hit(c)) return {name: c.key, phase: 'practice', entry: c};
      return keyOnly ? null : null;
    }
    if (hit(e)) return {name: e.key, phase: 'main', entry: e};
  }
  return null;
}

export function entryValue(text: string, e: ScanEntry): unknown {
  const r = parseSpan(text, e);
  return r.ok ? r.value : undefined;
}

// ---- completion context ---------------------------------------------------

export type TextContext = {
  kind: 'key' | 'value' | 'none';
  /** Keys leading to the enclosing container (object, or array for values). */
  path: string[];
  /** Enclosing object's current key, for value position. */
  key: string | null;
  inArray: boolean;
  /** Start of the replaceable word (inside the quotes when in a string). */
  from: number;
  quote: string | null;
  present: string[];
  pathOk: boolean;
};

type Frame = {
  type: 'obj' | 'arr';
  key: string | null;
  viaArray: boolean;
  expectKey: boolean;
  curKey: string | null;
  afterColon: boolean;
  valueStarted: boolean;
  keys: string[];
  arrExpect: boolean;
};

export function contextAt(text: string, pos: number): TextContext {
  const stack: Frame[] = [];
  let ws = pos;
  while (ws > 0 && WORD.test(text[ws - 1])) ws--;
  const end = ws;
  let inStr: {q: string; start: number; isKey: boolean} | null = null;
  let i = 0;
  const top = () => stack[stack.length - 1];
  const markValue = () => {
    const t = top();
    if (!t) return;
    if (t.type === 'obj' && t.afterColon) t.valueStarted = true;
    if (t.type === 'arr') t.arrExpect = false;
  };
  const push = (type: 'obj' | 'arr') => {
    const t = top();
    stack.push({
      type,
      key: t ? (t.type === 'obj' ? t.curKey : t.key) : null,
      viaArray: t ? t.type === 'arr' || t.viaArray : false,
      expectKey: true,
      curKey: null,
      afterColon: false,
      valueStarted: false,
      keys: [],
      arrExpect: true,
    });
  };
  const none: TextContext = {kind: 'none', path: [], key: null, inArray: false, from: pos, quote: null, present: [], pathOk: false};
  while (i < end) {
    const c = text[i];
    if (inStr) {
      if (c === '\\') {
        i += 2;
        continue;
      }
      if (c === inStr.q) {
        const t = top();
        if (inStr.isKey && t) {
          t.curKey = text.slice(inStr.start + 1, i);
          t.keys.push(t.curKey);
          t.expectKey = false;
        }
        inStr = null;
      }
      i++;
      continue;
    }
    if (c === '/' && text[i + 1] === '/') {
      const nl = text.indexOf('\n', i);
      if (nl < 0 || nl >= end) return none;
      i = nl + 1;
      continue;
    }
    if (c === '/' && text[i + 1] === '*') {
      const e = text.indexOf('*/', i + 2);
      if (e < 0 || e + 2 > end) return none;
      i = e + 2;
      continue;
    }
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    const t = top();
    if (c === '"' || c === "'") {
      const isKey = !!t && t.type === 'obj' && t.expectKey;
      if (!isKey) markValue();
      inStr = {q: c, start: i, isKey};
      i++;
    } else if (c === '{' || c === '[') {
      markValue();
      push(c === '{' ? 'obj' : 'arr');
      i++;
    } else if (c === '}' || c === ']') {
      stack.pop();
      i++;
    } else if (c === ':') {
      if (t) {
        t.afterColon = true;
        t.valueStarted = false;
        t.expectKey = false;
      }
      i++;
    } else if (c === ',') {
      if (t && t.type === 'obj') {
        t.expectKey = true;
        t.curKey = null;
        t.afterColon = false;
        t.valueStarted = false;
      } else if (t) t.arrExpect = true;
      i++;
    } else if (/[\w$.+-]/.test(c)) {
      const s = i;
      while (i < end && /[\w$.+-]/.test(text[i])) i++;
      if (t && t.type === 'obj' && t.expectKey) {
        t.curKey = text.slice(s, i);
        t.keys.push(t.curKey);
        t.expectKey = false;
      } else markValue();
    } else i++;
  }
  const t = top();
  if (!t) return none;
  const path = stack.slice(1).map((f) => f.key ?? '');
  const pathOk = stack.slice(1).every((f) => !f.viaArray && f.key !== null);
  const base = {path, pathOk, present: t.keys, inArray: t.type === 'arr'};
  if (inStr) {
    if (inStr.isKey) return {...base, kind: 'key', key: null, from: inStr.start + 1, quote: inStr.q};
    const isVal = t.type === 'arr' || (t.type === 'obj' && t.afterColon);
    return isVal
      ? {...base, kind: 'value', key: t.curKey, from: inStr.start + 1, quote: inStr.q}
      : none;
  }
  if (t.type === 'obj') {
    if (t.expectKey) return {...base, kind: 'key', key: null, from: ws, quote: null};
    if (t.afterColon && !t.valueStarted) return {...base, kind: 'value', key: t.curKey, from: ws, quote: null};
    return none;
  }
  return t.arrExpect ? {...base, kind: 'value', key: null, from: ws, quote: null} : none;
}

// ---- schema lookups for completion / help ---------------------------------

function propsOf(s: PropertySchema | null): Record<string, PropertySchema> | null {
  if (!s) return null;
  if (isPlainObject(s.properties)) return s.properties as Record<string, PropertySchema>;
  const merged: Record<string, PropertySchema> = {};
  let any = false;
  for (const b of [...(s.anyOf ?? []), ...(s.oneOf ?? [])]) {
    if (isPlainObject(b.properties)) {
      Object.assign(merged, b.properties);
      any = true;
    }
  }
  return any ? merged : null;
}

export function schemaAtPath(
  schema: TimelineSchema,
  fields: FieldModel[],
  path: string[],
): PropertySchema | null {
  let cur: PropertySchema | null = schema;
  for (let idx = 0; idx < path.length; idx++) {
    const k = path[idx];
    if (!cur) return null;
    if (idx === 0 && k === 'practice') {
      cur = {
        type: 'object',
        properties: Object.fromEntries(phaseOverridableFields(fields).map((f) => [f.name, f.schema])),
      };
      continue;
    }
    const props = propsOf(cur);
    if (idx === 0) {
      const f = fields.find((x) => x.name === k);
      cur = f ? f.schema : null;
    } else if (props && hasOwn(props, k)) cur = props[k];
    else if (isPlainObject(cur.additionalProperties)) cur = cur.additionalProperties as PropertySchema;
    else return null;
  }
  return cur;
}

/** Candidate keys inside the object at `path`. */
export function keyCandidates(
  schema: TimelineSchema,
  fields: FieldModel[],
  path: string[],
): {name: string; schema: PropertySchema; phaseOverridable?: boolean}[] {
  if (path.length === 0) {
    const list: {name: string; schema: PropertySchema}[] = fields.map((f) => ({name: f.name, schema: f.schema}));
    if (phaseOverridableFields(fields).length > 0) {
      list.push({name: 'practice', schema: {type: 'object', description: 'Override these options during the practice phase.'}});
    }
    return list;
  }
  const props = propsOf(schemaAtPath(schema, fields, path));
  return props ? Object.entries(props).map(([name, s]) => ({name, schema: s})) : [];
}

export type ValueOption = {literal: string; detail?: string};

/** Suggested values for a property: enum/const members, booleans, null and
 * the default. */
export function valueOptions(prop: PropertySchema | null | undefined): ValueOption[] {
  if (!prop) return [];
  const seen = new Map<string, ValueOption>();
  const add = (v: unknown, detail?: string) => {
    const lit = toJsLiteral(v, 0);
    if (!seen.has(lit)) seen.set(lit, {literal: lit, detail});
    else if (detail && !seen.get(lit)!.detail) seen.get(lit)!.detail = detail;
  };
  const walk = (s: PropertySchema) => {
    if (Array.isArray(s.enum)) s.enum.forEach((v) => add(v));
    if (hasOwn(s, 'const')) add(s.const);
    const ts = typesOf(s);
    if (ts.includes('boolean')) {
      add(true);
      add(false);
    }
    if (ts.includes('null')) add(null);
    for (const b of [...(s.anyOf ?? []), ...(s.oneOf ?? [])]) walk(b);
  };
  walk(prop);
  if (hasOwn(prop, 'default') && prop.default !== undefined && prop.default !== null) {
    const lit = toJsLiteral(prop.default, 0);
    if (lit.length <= 60 && !lit.includes('\n')) add(prop.default, 'default');
  }
  const x = (prop['x-jspsych'] ?? {}) as XJspsych;
  if (x.absentValue === null) add(null, 'absent');
  return [...seen.values()];
}
