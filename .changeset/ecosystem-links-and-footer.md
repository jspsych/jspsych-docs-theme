---
'@jspsych/docusaurus-theme': minor
'@jspsych/docusaurus-preset': minor
---

Update the ecosystem site registry and surface it (plus a donate link) in the footer.

- `ECOSYSTEM_SITES` is now jsPsych (jspsych.org), jsPsych Metadata
  (metadata.jspsych.org), jsPsych Multiplayer (multiplayer.jspsych.org), and
  DataPipe (pipe.jspsych.org). The jsPsych Contrib and jsPsych Timelines entries
  were removed.
- The registry is exported from a new client-safe `@jspsych/docusaurus-theme/sites`
  subpath (no React), alongside new `DONATE_URL` / `DONATE_LABEL` constants.
- `defineJspsychConfig` now appends two shared footer columns after the site's
  own `footerLinks`: **Ecosystem** (the registry) and **Support** (the jsPsych
  Open Collective donate link, previously hard-coded in the DataPipe footer).
  Opt out per site with `ecosystemFooter: false` / `donateFooter: false`; both
  are ignored when a full `footer` override is supplied.
