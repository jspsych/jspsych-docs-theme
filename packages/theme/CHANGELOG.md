# @jspsych/docusaurus-theme

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
