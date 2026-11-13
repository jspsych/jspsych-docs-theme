---
'@jspsych/docusaurus-theme': minor
---

`TimelineExample` now edits options as text by default: a CodeMirror editor (JSON5: comments, unquoted keys, trailing commas) showing only values that differ from the defaults, with schema-driven autocomplete for option names and enum values, hover help (including `renderFieldExtra` content), inline validation errors, and `practice: { ... }` support. "Show all parameters" expands to every option grouped under comment headers with defaults dimmed (preset values marked `// preset`); "Hide defaults" collapses back. Selecting a preset fills only the options it sets, and edits are shown as "(modified)". The generated form is kept as a secondary "Form" tab; new prop `defaultView?: 'code' | 'form'`. Adds `json5` and `@codemirror/{autocomplete,lint,state,view}` dependencies.
