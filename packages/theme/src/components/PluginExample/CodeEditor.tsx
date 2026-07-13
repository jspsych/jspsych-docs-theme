import CodeMirror from '@uiw/react-codemirror';
import {javascript} from '@codemirror/lang-javascript';
import {EditorView} from '@codemirror/view';
import {useColorMode} from '@docusaurus/theme-common';
import type {ReactElement} from 'react';

/**
 * CodeMirror wrapped to follow the active Docusaurus color mode. This module
 * pulls in browser-only code (CodeMirror touches `document` at import time), so
 * it must only ever be required inside <BrowserOnly> — see index.tsx.
 */

type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

// Let long stimulus strings wrap instead of forcing a horizontal scrollbar.
const wrap = EditorView.lineWrapping;

export default function CodeEditor({
  value,
  onChange,
}: CodeEditorProps): ReactElement {
  const {colorMode} = useColorMode();
  return (
    <CodeMirror
      value={value}
      theme={colorMode === 'dark' ? 'dark' : 'light'}
      extensions={[javascript(), wrap]}
      onChange={onChange}
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        highlightActiveLine: false,
        highlightActiveLineGutter: false,
      }}
    />
  );
}
