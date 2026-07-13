# Theme components test page

This page exercises the swizzled theme components moved into
`@jspsych/docusaurus-theme` in phase 3: `DocItem/Layout`,
`DocVersionBadge`, `DocCategoryGeneratedIndexPage`, `NotFound/Content`, and
`CodeBlock/Buttons`.

Loading this page itself already exercises `DocItem/Layout` and
`DocVersionBadge` — check that the breadcrumbs and (if this site is
versioned) the version chip share a single metadata row above the title,
rather than stacking as two separate rows.

## Runnable code fence

The block below is tagged `runnable`. Hover the code block and click the
"Open & run in new tab" icon in the button group (alongside word-wrap and
copy) to confirm `CodeBlock/Buttons` opens it correctly in a new tab.

```html runnable
<!DOCTYPE html>
<html>
  <head>
    <title>Theme components smoke test</title>
  </head>
  <body>
    <p>If you can read this in a new tab, the "open &amp; run" button works.</p>
  </body>
</html>
```

## Manual checks not covered by this page

- **404 page** (`NotFound/Content`): navigate to a nonexistent route (e.g.
  `/does-not-exist`) and confirm the styled 404 renders, including the
  "Back to home" link and "Search the docs" button.
- **Version badge** (`DocVersionBadge`): only renders a chip when
  `versionMetadata.badge` is set, which requires a versioned docs plugin
  instance — verify on a site with docs versioning enabled.
- **DocCategoryGeneratedIndexPage**: visit a generated category index page
  (an auto-generated `category`/`_category_.json` landing page) and confirm
  the breadcrumbs + version chip metadata row matches the regular doc page
  layout above.
