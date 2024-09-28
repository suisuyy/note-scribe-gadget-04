import React, { useEffect, useState } from 'react';
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView } from "@codemirror/view";
import { lineNumbers } from "@codemirror/view";
import ReactMarkdown from "react-markdown";

export const Editor = ({ content, renderMarkdown, darkMode, fontSize, showLineNumbers, handleChange, editorRef }) => {
  const [key, setKey] = useState(0);

  useEffect(() => {
    // Force re-render of CodeMirror when showLineNumbers changes
    setKey(prevKey => prevKey + 1);
  }, [showLineNumbers]);

  const editorExtensions = [
    markdown({ base: markdownLanguage, codeLanguages: languages }),
    EditorView.lineWrapping,
  ];

  if (showLineNumbers) {
    editorExtensions.push(lineNumbers());
  }

  return (
    <div className="p-4">
      {renderMarkdown ? (
        <div className="prose max-w-none dark:prose-invert">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      ) : (
        <CodeMirror
          key={key}
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