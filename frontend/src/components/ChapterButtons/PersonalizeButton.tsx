import React, { useState } from 'react';
import { apiFetchComplete } from '../../utils/api';
import { useAuth, usePageContent } from '../../theme/Root';

interface PersonalizeButtonProps {
  chapterContent: string;
  chapterId: string;
}

export default function PersonalizeButton({ chapterContent, chapterId }: PersonalizeButtonProps): React.JSX.Element | null {
  const { isLoggedIn } = useAuth();
  const { setSwappedContent } = usePageContent();
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Don't render if not logged in
  if (!isLoggedIn()) {
    return null;
  }

  const handlePersonalize = async (mode: 'existing' | 'fresh') => {
    setIsLoading(true);
    setShowOptions(false);
    setError(null);

    try {
      const content = await apiFetchComplete('/api/personalize', { 
        chapter_content: chapterContent, 
        chapter_id: chapterId,
        mode: mode
      }, true);
      
      setSwappedContent(content);
    } catch (err) {
      console.error('Personalize error:', err);
      setError("Personalization failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => {
          setShowOptions(!showOptions);
          if (!showOptions) setError(null);
        }}
        disabled={isLoading}
        className="button button--primary button--sm"
        style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
      >
        {isLoading ? '⏳ Personalizing...' : '✨ Personalize'}
        {!isLoading && <span style={{ fontSize: '0.8em' }}>{showOptions ? '▲' : '▼'}</span>}
      </button>

      {error && (
        <div style={{ 
          position: 'absolute', 
          top: '100%', 
          left: 0, 
          color: 'var(--ifm-color-danger)', 
          fontSize: '11px', 
          marginTop: '4px',
          whiteSpace: 'nowrap',
          fontWeight: 'bold'
        }}>
          ⚠️ {error}
        </div>
      )}

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
            onClick={() => handlePersonalize('existing')}
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
            onClick={() => handlePersonalize('fresh')}
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
