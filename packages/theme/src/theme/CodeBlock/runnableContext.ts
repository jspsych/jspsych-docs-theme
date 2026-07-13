import {createContext} from 'react';

/**
 * Carries the `runnable` flag from the CodeBlock wrapper (which can see the
 * fence metastring) down to the swizzled Buttons group (which can't — the
 * Docusaurus code-block context exposes the code but not the metastring).
 */
export const RunnableContext = createContext(false);
