# Theme feature test pages

This site exists to exercise every feature of `@jspsych/docusaurus-theme` and
`@jspsych/docusaurus-preset` during development.

## Runnable code fence

The block below is tagged `runnable` — it should render an "open & run in new
tab" icon in the code-block button group once the Buttons component lands
(phase 3). Until then the tag must simply not break rendering.

```html runnable
<!DOCTYPE html>
<html>
  <head>
    <title>Runnable fence smoke test</title>
  </head>
  <body>
    <p>If you can read this in a new tab, the runnable fence works.</p>
  </body>
</html>
```

## Plain code fence (control)

```js title="control.js"
console.log('a plain fence, for comparison');
```
