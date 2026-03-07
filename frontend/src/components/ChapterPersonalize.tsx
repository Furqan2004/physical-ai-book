import React, { useState } from 'react';
import { useAuth } from '../theme/Root';
import { apiFetchComplete } from '@site/src/utils/api';

/**
 * Chapter Personalization Props
 */
interface ChapterPersonalizeProps {
  chapterContent: string;
  chapterTitle: string;
  chapterId?: string;
  onPersonalized?: (personalizedContent: string) => void;
}

/**
 * Chapter Personalization Component
 * Button to personalize chapter content based on user profile
 */
export function ChapterPersonalize({
  chapterContent,
  chapterTitle,
  chapterId,
  onPersonalized
}: ChapterPersonalizeProps): React.JSX.Element | null {
  const { isLoggedIn } = useAuth();
  const [personalizedContent, setPersonalizedContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPersonalized, setShowPersonalized] = useState(false);

  // Only show for logged-in users
  if (!isLoggedIn()) {
    return null;
  }

  const handlePersonalize = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use non-streaming API call
      const fullContent = await apiFetchComplete('/api/personalize', {
        chapter_content: chapterContent,
        chapter_id: chapterId || chapterTitle,
      }, true);

      if (fullContent) {
        setPersonalizedContent(fullContent);
        setShowPersonalized(true);
        onPersonalized?.(fullContent);
      } else {
        throw new Error('No content received');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Personalization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPersonalizedContent(null);
    setShowPersonalized(false);
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
        {!personalizedContent ? (
          <button
            onClick={handlePersonalize}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--ifm-color-primary)',
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
                <span>Personalizing...</span>
              </>
            ) : (
              <>
                <span>🎯</span>
                <span>Personalize Content</span>
              </>
            )}
          </button>
        ) : (
          <>
            <button
              onClick={() => setShowPersonalized(!showPersonalized)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: showPersonalized ? 'var(--ifm-color-success)' : 'var(--ifm-color-emphasis-600)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {showPersonalized ? '📖 Original' : '🎯 Personalized'}
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

      {!loading && !error && personalizedContent && showPersonalized && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: 'var(--ifm-background-color)',
          borderRadius: '4px',
          borderLeft: '4px solid var(--ifm-color-success)',
        }}>
          <p style={{ 
            margin: '0 0 1rem 0', 
            fontSize: '0.875rem', 
            color: 'var(--ifm-color-emphasis-600)',
            fontWeight: 'bold',
          }}>
            ✨ Personalized for your experience level
          </p>
          <div style={{ whiteSpace: 'pre-wrap' }}>
            {personalizedContent}
          </div>
        </div>
      )}
    </div>
  );
}
