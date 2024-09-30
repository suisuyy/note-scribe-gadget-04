import React, { useEffect } from 'react';
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView } from "@codemirror/view";
import { lineNumbers } from "@codemirror/view"; // Ensure lineNumbers is imported
import { StreamLanguage } from "@codemirror/language";
import ReactMarkdown from "react-markdown";
import rehypeRaw from 'rehype-raw'; // Import rehype-raw

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

export const NoteEditor = ({ content, renderMarkdown, darkMode, fontSize, showLineNumbers, handleChange, editorRef }) => {
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

  const getEditorExtensions = () => {
    const extensions = [
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      EditorView.lineWrapping,
      aiResponseExtension,
      EditorView.theme({
        ".cm-line.cm-ai-response": { // Updated selector for specificity
          backgroundColor: "#e6f3ff",
        },
      }),
    ];

    if (showLineNumbers) {
      extensions.push(lineNumbers()); // Conditionally add lineNumbers
    }

    return extensions;
  };

  useEffect(() => {
    if (editorRef.current && EditorView.reconfigure) {
      const view = editorRef.current;
      view.dispatch({
        effects: EditorView.reconfigure.of(getEditorExtensions())
      });
    }
  }, [showLineNumbers]);

  const getSelectedText = () => {
    if (editorRef.current) {
      const { state } = editorRef.current;
      const selection = state.selection.main;
      if (selection.from !== selection.to) {
        return state.sliceDoc(selection.from, selection.to);
      } else {
        const content = state.doc.toString();
        const cursorPos = selection.from;
        
        // Find the start of the block (three consecutive newlines before the cursor)
        const beforeCursor = content.substring(0, cursorPos);
        const startBlock = beforeCursor.lastIndexOf('\n\n\n');
        
        const startPos = startBlock !== -1 ? startBlock + 3 : 0;
        
        // Find the end of the block (three consecutive newlines after the cursor)
        const afterCursor = content.substring(cursorPos);
        const endBlock = afterCursor.indexOf('\n\n\n');
        const endPos = endBlock !== -1 ? cursorPos + endBlock : content.length;
        
        return content.substring(startPos, endPos).trim();
      }
    }
    return "";
  };

  const executeScripts = (content) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const scripts = tempDiv.getElementsByTagName('script');
    for (let script of scripts) {
      if (script.src) {
        const newScript = document.createElement('script');
        newScript.src = script.src;
        document.body.appendChild(newScript);
      } else {
        eval(script.innerText);
      }
    }
  };

  useEffect(() => {
    if (renderMarkdown) {
      executeScripts(content);
    }
  }, [content, renderMarkdown]);

  return (
    <div className="h-full w-full overflow-auto"> {/* Added overflow-auto here */}
      {renderMarkdown ? (
        <div className="prose max-w-none dark:prose-invert h-full overflow-auto p-4">
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]} // Add rehypeRaw plugin
            components={{
              // Custom components for specific HTML tags
              audio: ({node, ...props}) => <audio controls {...props} />,
              iframe: ({node, ...props}) => <iframe {...props} />,
              script: ({node, ...props}) => <script {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      ) : (
        <CodeMirror
          value={content}
          height="100%"
          extensions={getEditorExtensions()}
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