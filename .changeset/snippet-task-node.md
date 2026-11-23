---
"@jspsych/docusaurus-theme": patch
---

TimelineExample: the code snippet uses what `createTimeline` returns as a timeline node, `const task = Pkg.createTimeline(jsPsych, ...); jsPsych.run([task]);`, instead of destructuring `{ timeline }`. The same `task` can sit beside other trials in a larger experiment.
