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

  // Don't render if not logged in
  if (!isLoggedIn()) {
    return null;
  }

  const handlePersonalize = async () => {
    setIsLoading(true);

    try {
      const content = await apiFetchComplete('/api/personalize', { 
        chapter_content: chapterContent, 
        chapter_id: chapterId 
      }, true);
      
      setSwappedContent(content);
    } catch (error) {
      console.error('Personalize error:', error);
      alert("Failed to personalize content. Please check API credits.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePersonalize}
      disabled={isLoading}
      className="button button--primary button--sm"
    >
      {isLoading ? '⏳ Personalizing...' : '✨ Personalize This Chapter'}
    </button>
  );
}
