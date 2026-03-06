import React, { useState } from 'react';
import { apiStream } from '../../utils/api';
import { useAuth } from '../../theme/Root';

interface TranslateButtonProps {
  chapterContent: string;
  chapterId: string;
}

export default function TranslateButton({ chapterContent, chapterId }: TranslateButtonProps): JSX.Element | null {
  const { isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);

  // Don't render if not logged in
  if (!isLoggedIn()) {
    return null;
  }

  const handleTranslate = async () => {
    setIsLoading(true);
    setTranslatedContent('');

    try {
      await apiStream(
        '/api/translate',
        { chapter_content: chapterContent, chapter_id: chapterId },
        // On chunk received
        (chunk: string) => {
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              setTranslatedContent((prev) => (prev || '') + data);
            }
          }
        },
        // On done
        () => {
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Translate error:', error);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTranslatedContent(null);
  };

  if (translatedContent) {
    return (
      <div className="margin-bottom--md">
        <button
          onClick={handleReset}
          className="button button--secondary button--sm"
        >
          ↩ English mein Wapas
        </button>
        <div className="alert alert--info margin-bottom--md">
          🇵🇰 Urdu translation loaded
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleTranslate}
      disabled={isLoading}
      className="button button--primary button--sm margin-bottom--md"
    >
      {isLoading ? '⏳ Translating...' : '🇵🇰 Urdu mein Parho'}
    </button>
  );
}
