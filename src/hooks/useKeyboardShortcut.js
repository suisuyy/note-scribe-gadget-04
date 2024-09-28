import { useEffect } from 'react';

export const useKeyboardShortcut = (targetKey, ctrlKey, callback) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey === ctrlKey && event.key === targetKey) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [targetKey, ctrlKey, callback]);
};