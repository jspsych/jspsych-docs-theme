---
"@jspsych/docusaurus-theme": minor
---

TimelineExample: options can refer to a value the package exports under `utils`, written `{"$util": "stimuli.words"}`. Presets, the URL hash and the editor stay JSON; the runner replaces each reference with `<globalName>.utils.<path>` before calling `createTimeline` (and reports a missing export), the code snippet prints that expression, and selects and defaults label it `utils.stimuli.words`. A schema offers references through `enum`, so validation and the form need nothing new.
