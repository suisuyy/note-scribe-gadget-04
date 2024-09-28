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
    <div className="p-0 w-full"> {/* Changed padding to 0 and set width to full */}
      {renderMarkdown ? (
        <div className="prose max-w-none dark:prose-invert p-4"> {/* Added padding here for markdown view */}
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      ) : (
        <CodeMirror
          key={key}
          value={content}
          height="calc(100vh - 120px)"
          width="100%" {/* Set width to 100% */}
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