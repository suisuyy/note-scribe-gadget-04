import React from 'react';
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView } from "@codemirror/view";
import ReactMarkdown from "react-markdown";

const NoteEditor = ({ content, renderMarkdown, darkMode, fontSize, handleChange, editorRef, showLineNumbers }) => {
  const editorExtensions = [
    markdown({ base: markdownLanguage, codeLanguages: languages }),
    EditorView.lineWrapping,
  ];

  if (showLineNumbers) {
    editorExtensions.push(EditorView.lineNumbers());
  }

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
          extensions={editorExtensions}
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

export default NoteEditor;