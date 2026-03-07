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

  // Don't render if not logged in
  if (!isLoggedIn()) {
    return null;
  }

  const handleTranslate = async () => {
    setIsLoading(true);

    try {
      const content = await apiFetchComplete('/api/translate', { 
        chapter_content: chapterContent, 
        chapter_id: chapterId 
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
    <button
      onClick={handleTranslate}
      disabled={isLoading}
      className="button button--primary button--sm"
    >
      {isLoading ? '⏳ Translating...' : '🇵🇰 Urdu mein Parho'}
    </button>
  );
}
