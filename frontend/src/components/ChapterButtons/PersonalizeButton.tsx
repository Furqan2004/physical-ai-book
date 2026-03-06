import React, { useState } from 'react';
import { apiStream } from '../../utils/api';
import { useAuth } from '../../theme/Root';

interface PersonalizeButtonProps {
  chapterContent: string;
  chapterId: string;
}

export default function PersonalizeButton({ chapterContent, chapterId }: PersonalizeButtonProps): JSX.Element | null {
  const { isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [personalizedContent, setPersonalizedContent] = useState<string | null>(null);

  // Don't render if not logged in
  if (!isLoggedIn()) {
    return null;
  }

  const handlePersonalize = async () => {
    setIsLoading(true);
    setPersonalizedContent('');

    try {
      await apiStream(
        '/api/personalize',
        { chapter_content: chapterContent, chapter_id: chapterId },
        // On chunk received
        (chunk: string) => {
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              setPersonalizedContent((prev) => (prev || '') + data);
            }
          }
        },
        // On done
        () => {
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Personalize error:', error);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPersonalizedContent(null);
  };

  if (personalizedContent) {
    return (
      <div className="margin-bottom--md">
        <button
          onClick={handleReset}
          className="button button--secondary button--sm"
        >
          ↩ Show Original
        </button>
        <div className="alert alert--info margin-bottom--md">
          ✨ Personalized content loaded
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handlePersonalize}
      disabled={isLoading}
      className="button button--primary button--sm margin-bottom--md"
    >
      {isLoading ? '⏳ Personalizing...' : '✨ Personalize This Chapter'}
    </button>
  );
}
