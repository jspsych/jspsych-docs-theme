# @jspsych/docusaurus-theme

## 0.5.2

### Patch Changes

- [#18](https://github.com/jspsych/jspsych-docs-theme/pull/18) [`c132362`](https://github.com/jspsych/jspsych-docs-theme/commit/c132362dd731208eaf17561118d8c77167d54435) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - TimelineExample: the code snippet uses what `createTimeline` returns as a timeline node, `const task = Pkg.createTimeline(jsPsych, ...); jsPsych.run([task]);`, instead of destructuring `{ timeline }`. The same `task` can sit beside other trials in a larger experiment.

## 0.5.1

### Patch Changes

- [#16](https://github.com/jspsych/jspsych-docs-theme/pull/16) [`8e13e51`](https://github.com/jspsych/jspsych-docs-theme/commit/8e13e51fcbcf87f652254a2abbec9ae1005b6b3e) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - TimelineExample: a `$util` reference is never shown as `{"$util": ...}`. The options text prints it as `utils.stimuli.words` and reads that back, and value completion offers it in the same form. Field help, type hints and enum validation errors also name references as `utils.<path>`.

## 0.5.0

### Minor Changes

- [#14](https://github.com/jspsych/jspsych-docs-theme/pull/14) [`aebf955`](https://github.com/jspsych/jspsych-docs-theme/commit/aebf9557d21adab68ea3780a303bed7ac4264c00) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - TimelineExample: options can refer to a value the package exports under `utils`, written `{"$util": "stimuli.words"}`. Presets, the URL hash and the editor stay JSON; the runner replaces each reference with `<globalName>.utils.<path>` before calling `createTimeline` (and reports a missing export), the code snippet prints that expression, and selects and defaults label it `utils.stimuli.words`. A schema offers references through `enum`, so validation and the form need nothing new.

## 0.4.3

### Patch Changes

- [#12](https://github.com/jspsych/jspsych-docs-theme/pull/12) [`3dac6a3`](https://github.com/jspsych/jspsych-docs-theme/commit/3dac6a332d1926903f36cdeb35d081b3deff25a5) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - TimelineExample: choosing "No preset (package defaults)" in the Preset menu now clears the editor to the package defaults, as Reset does. Before, the previous preset's options stayed in the editor.

## 0.4.2

### Patch Changes

- [#10](https://github.com/jspsych/jspsych-docs-theme/pull/10) [`631308d`](https://github.com/jspsych/jspsych-docs-theme/commit/631308d7300d438a20d4f5b1b9a239d030f7c969) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - TimelineExample: a `map` field takes its value editor from the schema's named properties when there is no `additionalProperties` (as TypeScript `Partial<Record<Key, number>>` generates), so numbers are edited as numbers, not text. A map whose schema is a union of shapes (e.g. a flat map or a map of maps for crossed factors) is edited as JSON instead of showing `[object Object]`.

## 0.4.1

### Patch Changes

- [#8](https://github.com/jspsych/jspsych-docs-theme/pull/8) [`df60b1c`](https://github.com/jspsych/jspsych-docs-theme/commit/df60b1c6bdd4fdecc079ebaa7392137d214f2b5c) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - TimelineExample: Restart and Stop buttons now sit in the status row directly above the running task, so a task can be restarted without scrolling back up to the toolbar.

## 0.4.0

### Minor Changes

- [#6](https://github.com/jspsych/jspsych-docs-theme/pull/6) [`8859a41`](https://github.com/jspsych/jspsych-docs-theme/commit/8859a41b1def34d06472657db42646644801f2da) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - `TimelineExample` now edits options as text by default: a CodeMirror editor (JSON5: comments, unquoted keys, trailing commas) showing only values that differ from the defaults, with schema-driven autocomplete for option names and enum values, hover help (including `renderFieldExtra` content), inline validation errors, and `practice: { ... }` support. "Show all parameters" expands to every option grouped under comment headers with defaults dimmed (preset values marked `// preset`); "Hide defaults" collapses back. Selecting a preset fills only the options it sets, and edits are shown as "(modified)". The generated form is kept as a secondary "Form" tab; new prop `defaultView?: 'code' | 'form'`. Adds `json5` and `@codemirror/{autocomplete,lint,state,view}` dependencies.

## 0.3.0

### Minor Changes

- [#4](https://github.com/jspsych/jspsych-docs-theme/pull/4) [`9737ab3`](https://github.com/jspsych/jspsych-docs-theme/commit/9737ab32572df14e3bea7f1c2b5c59631b12f4e9) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Add `TimelineExample`: a schema-driven options form and runner for jspsych-timelines packages (sandboxed iframe run, code view, data table and CSV download, presets, URL-hash sharing, and `renderFieldExtra` / `onRunComplete` extension points). Adds an optional `themeConfig.jspsych.timelineExample.jspsychVersion`.

## 0.2.0

### Minor Changes

- [`c9c0d24`](https://github.com/jspsych/jspsych-docs-theme/commit/c9c0d240cef4ef51c3e8d92e8d167a812f7d9f35) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Initial release of the shared jsPsych docs core: `@jspsych/docusaurus-theme`
  (brand CSS + fonts, swizzled components, runnable code fences, PluginExample /
  Citation / JspsychBrain MDX components, ecosystem switcher) and
  `@jspsych/docusaurus-preset` (the `defineJspsychConfig()` factory with shared
  navbar, footer, and search defaults).
