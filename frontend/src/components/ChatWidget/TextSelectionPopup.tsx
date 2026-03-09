import React, { useEffect, useState } from 'react';
import { useLocation } from '@docusaurus/router';
import { useAuth } from '../../theme/Root';

interface TextSelectionPopupProps {
  onAskAboutThis: (text: string) => void;
}

export default function TextSelectionPopup({ onAskAboutThis }: TextSelectionPopupProps): React.JSX.Element | null {
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties | null>(null);
  const [selectedText, setSelectedText] = useState('');

  // Only active on /physical-ai-book/docs/ routes and for logged-in users
  const isDocsPage = location.pathname.startsWith('/physical-ai-book/docs/') || 
                     location.pathname === '/physical-ai-book/docs';

  if (!isLoggedIn() || !isDocsPage) {
    return null;
  }

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 5) {
        // Get selection range for popup positioning
        const range = selection?.getRangeAt(0);
        if (range) {
          const rect = range.getBoundingClientRect();
          
          setPopupStyle({
            position: 'fixed',
            top: rect.top - 45,
            left: rect.left + (rect.width / 2) - 50,
            backgroundColor: 'var(--ifm-color-primary)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 'bold',
            cursor: 'pointer',
            zIndex: 9999,
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: '2px solid white',
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
