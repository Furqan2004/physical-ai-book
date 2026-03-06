import React, { useEffect, useState } from 'react';
import { useLocation } from '@docusaurus/router';
import { useAuth } from '../../theme/Root';

interface TextSelectionPopupProps {
  onAskAboutThis: (text: string) => void;
}

export default function TextSelectionPopup({ onAskAboutThis }: TextSelectionPopupProps): JSX.Element | null {
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties | null>(null);
  const [selectedText, setSelectedText] = useState('');

  // Only active on /docs/ routes and for logged-in users
  if (!isLoggedIn() || !location.pathname.startsWith('/docs/')) {
    return null;
  }

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 10) {
        // Get selection range for popup positioning
        const range = selection?.getRangeAt(0);
        if (range) {
          const rect = range.getBoundingClientRect();
          
          setPopupStyle({
            position: 'fixed',
            top: rect.top - 40,
            left: rect.left + (rect.width / 2) - 60,
            backgroundColor: 'var(--ifm-color-primary)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            zIndex: 1001,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            transition: 'opacity 0.2s',
          });
          
          setSelectedText(text);
        }
      } else {
        setPopupStyle(null);
        setSelectedText('');
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (!popupStyle) {
    return null;
  }

  return (
    <div
      style={popupStyle}
      onClick={() => {
        onAskAboutThis(selectedText);
        setPopupStyle(null);
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      💬 Ask about this?
    </div>
  );
}
