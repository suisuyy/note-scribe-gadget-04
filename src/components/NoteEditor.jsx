import React, { useCallback } from 'react';
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView } from "@codemirror/view";
import { lineNumbers } from "@codemirror/view";
import { StreamLanguage } from "@codemirror/language";
import ReactMarkdown from "react-markdown";

const formatDateTime = () => {
  const now = new Date();
  return now.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

export const NoteEditor = ({ content, renderMarkdown, darkMode, fontSize, showLineNumbers, handleChange, editorRef, sendAIRequest }) => {
  const aiResponseExtension = StreamLanguage.define({
    token(stream) {
      if (stream.match(/AI Response \(\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2}\):/, false)) {
        stream.skipToEnd();
        return "ai-response";
      }
      stream.next();
      return null;
    }
  });

  const editorExtensions = [
    markdown({ base: markdownLanguage, codeLanguages: languages }),
    EditorView.lineWrapping,
    aiResponseExtension,
    EditorView.theme({
      ".cm-line": {
        "&.cm-ai-response": {
          backgroundColor: "#e6f3ff",
        },
      },
    }),
  ];

  if (showLineNumbers) {
    editorExtensions.push(lineNumbers());
  }

  const handleEditorChange = useCallback((value, viewUpdate) => {
    const formattedValue = value.replace(
      /AI Response:/g,
      `AI Response (${formatDateTime()}):`
    );
    handleChange(formattedValue, viewUpdate);
  }, [handleChange]);

  const getSelectedText = useCallback(() => {
    if (editorRef.current) {
      const selection = editorRef.current.state.selection.main;
      if (selection.from !== selection.to) {
        return editorRef.current.state.sliceDoc(selection.from, selection.to);
      } else {
        // If no text is selected, get the current line
        const line = editorRef.current.state.doc.lineAt(selection.from);
        return line.text;
      }
    }
    return "No text selected";
  }, [editorRef]);

  const handleAIRequest = useCallback(() => {
    const selectedText = getSelectedText();
    sendAIRequest("Please process the following text:", selectedText);
  }, [getSelectedText, sendAIRequest]);

  return (
    <div>
      {renderMarkdown ? (
        <div className="prose max-w-none dark:prose-invert">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      ) : (
        <CodeMirror
          value={content}
          height="calc(100vh - 120px)"
          extensions={editorExtensions}
          onChange={handleEditorChange}
          theme={darkMode ? "dark" : "light"}
          onCreateEditor={(view) => {
            editorRef.current = view;
          }}
          style={{ fontSize: `${fontSize}px` }}
        />
      )}
      <button onClick={handleAIRequest} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Process Selected Text
      </button>
    </div>
  );
};