import React from 'react';
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView } from "@codemirror/view";
import ReactMarkdown from "react-markdown";
import { StreamLanguage } from "@codemirror/language";
import { createTheme } from "@uiw/codemirror-themes";

const aiResponseTheme = createTheme({
  theme: "light",
  settings: {
    background: "#e6f3ff",
    foreground: "#000000",
    selection: "#b3d9ff",
    selectionMatch: "#b3d9ff",
    lineHighlight: "#e6f3ff",
  },
});

export const NoteEditor = ({ content, renderMarkdown, darkMode, fontSize, showLineNumbers, handleChange, editorRef }) => {
  const editorExtensions = [
    markdown({ base: markdownLanguage, codeLanguages: languages }),
    EditorView.lineWrapping,
    StreamLanguage.define({
      name: "ai-response",
      token: (stream) => {
        if (stream.match("AI Response:", false)) {
          stream.skipToEnd();
          return "ai-response";
        }
        stream.next();
        return null;
      },
    }),
  ];

  const customTheme = EditorView.theme({
    ".cm-line": {
      "&.ai-response": {
        backgroundColor: "#e6f3ff",
      },
    },
  });

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
          extensions={[...editorExtensions, customTheme]}
          onChange={handleChange}
          theme={darkMode ? "dark" : aiResponseTheme}
          onCreateEditor={(view) => {
            editorRef.current = view;
          }}
          style={{ fontSize: `${fontSize}px` }}
        />
      )}
    </div>
  );
};