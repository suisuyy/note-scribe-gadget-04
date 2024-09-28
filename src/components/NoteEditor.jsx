import React from 'react';
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView } from "@codemirror/view";
import ReactMarkdown from "react-markdown";
import { StreamLanguage } from "@codemirror/language";

const aiResponseTheme = EditorView.theme({
  "&": {
    backgroundColor: "#e6f3ff",
    color: "#000000",
  },
  ".cm-selectionBackground": {
    backgroundColor: "#b3d9ff",
  },
  ".cm-line": {
    "&.ai-response": {
      backgroundColor: "#e6f3ff",
    },
  },
});

export const NoteEditor = ({ content, renderMarkdown, darkMode, fontSize, showLineNumbers, handleChange, editorRef }) => {
  const editorExtensions = [
    markdown({ base: markdownLanguage, codeLanguages: languages }),
    EditorView.lineWrapping,
    StreamLanguage.define({
      name: 'ai-response',
      token: (stream) => {
        if (stream.match('AI Response:', false)) {
          stream.skipToEnd();
          return 'ai-response';
        }
        stream.next();
        return null;
      },
    }),
  ];

  return (
    <div className="p-4">
      {renderMarkdown ? (
        <div className="prose max-w-none dark:prose-invert">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      ) : (
        <CodeMirror
          value={content}
          height="calc(100vh - 120px)"
          extensions={[...editorExtensions, aiResponseTheme]}
          onChange={handleChange}
          theme={darkMode ? "dark" : "light"}
          onCreateEditor={(view) => {
            editorRef.current = view;
          }}
          style={{ fontSize: `${fontSize}px` }}
        />
      )}
    </div>
  );
};