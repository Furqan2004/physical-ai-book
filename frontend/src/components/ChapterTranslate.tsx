import React, { useState } from 'react';
import { useAuth } from '../theme/Root';
import { apiFetchComplete } from '@site/src/utils/api';

/**
 * Chapter Translation Props
 */
interface ChapterTranslateProps {
  chapterContent: string;
  chapterId?: string;
  onTranslated?: (translatedContent: string) => void;
}

/**
 * Chapter Translation Component
 * Button to translate chapter content to Urdu
 */
export function ChapterTranslate({
  chapterContent,
  chapterId,
  onTranslated
}: ChapterTranslateProps): React.JSX.Element | null {
  const { isLoggedIn } = useAuth();
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrdu, setShowUrdu] = useState(false);

  // Only show for logged-in users
  if (!isLoggedIn()) {
    return null;
  }

  const handleTranslate = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use non-streaming API call
      const fullContent = await apiFetchComplete('/api/translate', {
        chapter_content: chapterContent,
        chapter_id: chapterId || 'chapter',
      }, true);

      if (fullContent) {
        setTranslatedContent(fullContent);
        setShowUrdu(true);
        onTranslated?.(fullContent);
      } else {
        throw new Error('No content received');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTranslatedContent(null);
    setShowUrdu(false);
    setError(null);
  };

  return (
    <div style={{
      marginBottom: '1.5rem',
      padding: '1rem',
      backgroundColor: 'var(--ifm-background-surface-color)',
      borderRadius: '8px',
      border: '1px solid var(--ifm-color-emphasis-300)',
    }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {!translatedContent ? (
          <button
            onClick={handleTranslate}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--ifm-color-success)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {loading ? (
              <>
                <span>⏳</span>
                <span>Translating...</span>
              </>
            ) : (
              <>
                <span>🌐</span>
                <span>Translate to Urdu</span>
              </>
            )}
          </button>
        ) : (
          <>
            <button
              onClick={() => setShowUrdu(!showUrdu)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: showUrdu ? 'var(--ifm-color-success)' : 'var(--ifm-color-emphasis-600)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {showUrdu ? '🇬🇧 English' : '🇵🇰 اردو'}
            </button>
            <button
              onClick={handleReset}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--ifm-color-warning)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              🔄 Reset
            </button>
          </>
        )}
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          color: '#c00',
          padding: '0.75rem',
          borderRadius: '4px',
        }}>
          {error}
        </div>
      )}

      {!loading && !error && translatedContent && showUrdu && (
        <div
          className="urdu-content"
          style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: 'var(--ifm-background-color)',
            borderRadius: '4px',
            borderLeft: '4px solid var(--ifm-color-success)',
            direction: 'rtl',
            textAlign: 'right',
          }}
        >
          <p style={{ 
            margin: '0 0 1rem 0', 
            fontSize: '0.875rem', 
            color: 'var(--ifm-color-emphasis-600)',
            fontWeight: 'bold',
          }}>
            🌐 Urdu Translation
          </p>
          <div style={{ 
            whiteSpace: 'pre-wrap',
            fontFamily: "'Noto Nastaliq Urdu', serif",
            fontSize: '1.1rem',
            lineHeight: '2',
          }}>
            {translatedContent}
          </div>
        </div>
      )}
    </div>
  );
}
