---
"@jspsych/docusaurus-theme": patch
---

TimelineExample: a `map` field takes its value editor from the schema's named properties when there is no `additionalProperties` (as TypeScript `Partial<Record<Key, number>>` generates), so numbers are edited as numbers, not text. A map whose schema is a union of shapes (e.g. a flat map or a map of maps for crossed factors) is edited as JSON instead of showing `[object Object]`.
