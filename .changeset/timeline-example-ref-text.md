---
"@jspsych/docusaurus-theme": patch
---

TimelineExample: a `$util` reference is never shown as `{"$util": ...}`. The options text prints it as `utils.stimuli.words` and reads that back, and value completion offers it in the same form. Field help, type hints and enum validation errors also name references as `utils.<path>`.
