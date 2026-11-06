import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { StreamLanguage } from '@codemirror/language';
import { csharp } from '@codemirror/legacy-modes/mode/clike';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import type { RunnableLanguage } from '../curriculum/schema';

function langExt(language: RunnableLanguage) {
  switch (language) {
    case 'python': return python();
    case 'c':
    case 'cpp': return cpp();
    case 'csharp': return StreamLanguage.define(csharp);
    case 'shell': return StreamLanguage.define(shell);
    default: return [];
  }
}

const theme = EditorView.theme({
  '&': { backgroundColor: 'transparent' },
  '.cm-gutters': { backgroundColor: 'transparent', borderRight: '1px solid var(--border)', color: 'var(--fg-2)' },
  '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'color-mix(in srgb, var(--accent) 8%, transparent)' },
  '.cm-content': { caretColor: 'var(--fg)' },
  '&.cm-focused': { outline: 'none' },
});

export function CodeEditor({ value, language, onChange }: { value: string; language: RunnableLanguage; onChange: (v: string) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const langComp = useRef(new Compartment());
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!host.current) return;
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        keymap.of([indentWithTab]),
        langComp.current.of(langExt(language)),
        theme,
        EditorView.darkTheme.of(dark),
        EditorView.updateListener.of((u) => { if (u.docChanged) onChangeRef.current(u.state.doc.toString()); }),
        EditorView.lineWrapping,
      ],
    });
    view.current = new EditorView({ state, parent: host.current });
    return () => { view.current?.destroy(); view.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const v = view.current;
    if (v && v.state.doc.toString() !== value) v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } });
  }, [value]);

  useEffect(() => { view.current?.dispatch({ effects: langComp.current.reconfigure(langExt(language)) }); }, [language]);

  return <div className="editor" ref={host} />;
}
