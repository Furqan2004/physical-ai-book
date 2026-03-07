import React, { useState } from 'react';
import { apiFetchComplete } from '../../utils/api';
import { useAuth, usePageContent } from '../../theme/Root';

interface TranslateButtonProps {
  chapterContent: string;
  chapterId: string;
}

export default function TranslateButton({ chapterContent, chapterId }: TranslateButtonProps): React.JSX.Element | null {
  const { isLoggedIn } = useAuth();
  const { setSwappedContent } = usePageContent();
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Don't render if not logged in
  if (!isLoggedIn()) {
    return null;
  }

  const handleTranslate = async (mode: 'existing' | 'fresh') => {
    setIsLoading(true);
    setShowOptions(false);

    try {
      const content = await apiFetchComplete('/api/translate', { 
        chapter_content: chapterContent, 
        chapter_id: chapterId,
        mode: mode
      }, true);
      
      setSwappedContent(content);
    } catch (error) {
      console.error('Translate error:', error);
      alert("Failed to translate content. Please check API credits.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isLoading}
        className="button button--primary button--sm"
        style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
      >
        {isLoading ? '⏳ Translating...' : '🇵🇰 Urdu Mein'}
        {!isLoading && <span style={{ fontSize: '0.8em' }}>{showOptions ? '▲' : '▼'}</span>}
      </button>

      {showOptions && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          backgroundColor: 'var(--ifm-background-surface-color)',
          border: '1px solid var(--ifm-color-emphasis-300)',
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 100,
          minWidth: '160px',
          marginTop: '5px',
          overflow: 'hidden'
        }}>
          <button
            onClick={() => handleTranslate('existing')}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 12px',
              border: 'none',
              background: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              color: 'var(--ifm-color-content)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-100)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            📂 Existing (Fast)
          </button>
          <button
            onClick={() => handleTranslate('fresh')}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 12px',
              border: 'none',
              background: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              color: 'var(--ifm-color-content)',
              borderTop: '1px solid var(--ifm-color-emphasis-200)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-100)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            🔥 Fresh (New AI)
          </button>
        </div>
      )}
    </div>
  );
}
