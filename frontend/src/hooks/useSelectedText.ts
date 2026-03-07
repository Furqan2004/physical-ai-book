import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to detect text selection on the page
 * Returns the currently selected text and provides methods to clear selection
 */
export function useSelectedText(): {
  selectedText: string | null;
  clearSelection: () => void;
} {
  const [selectedText, setSelectedText] = useState<string | null>(null);

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    
    if (text && text.length > 0) {
      setSelectedText(text);
    } else {
      setSelectedText(null);
    }
  }, []);

  useEffect(() => {
    // Listen to selection changes
    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleSelectionChange]);

  const clearSelection = () => {
    window.getSelection()?.removeAllRanges();
    setSelectedText(null);
  };

  return {
    selectedText,
    clearSelection,
  };
}
