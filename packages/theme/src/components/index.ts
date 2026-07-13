/**
 * Public React components of @jspsych/docusaurus-theme, importable from MDX
 * or site code via `@jspsych/docusaurus-theme/components`. These are plain
 * components (not @theme/* swizzle targets): consumers import them, they
 * don't override them.
 */
export {default as JspsychBrain, BRAIN_GRAPH} from './JspsychBrain';
export {default as Citation} from './Citation';
export type {CitationAuthor, CitationProps} from './Citation';
export {default as PluginExample} from './PluginExample';
export type {PluginExampleProps} from './PluginExample';
