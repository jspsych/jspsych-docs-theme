/**
 * Self-hosted brand webfonts, loaded as a Docusaurus client module so webpack
 * fingerprints the woff2 files and resolves their URLs against the site
 * baseUrl. Each family is split by unicode-range, so English pages only fetch
 * the ~39 KB latin subset. Both use `font-display: swap`.
 *
 *   Lexend Variable       — headings + body (see css/jspsych.css for the mapping)
 *   JetBrains Mono Variable — code blocks and inline code
 */
import '@fontsource-variable/lexend/index.css';
import '@fontsource-variable/jetbrains-mono/index.css';
