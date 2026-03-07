import React from 'react';
import OriginalLayout from '@theme-original/DocItem/Layout';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import PersonalizeButton from '@site/src/components/ChapterButtons/PersonalizeButton';
import TranslateButton from '@site/src/components/ChapterButtons/TranslateButton';
import { usePageContent } from '@site/src/theme/Root';
import ReactMarkdown from 'react-markdown';

export default function DocItemLayoutWrapper(props) {
  const { metadata } = useDoc();
  const { swappedContent, setSwappedContent } = usePageContent();
  
  // Clear swapped content when navigating to a new page
  React.useEffect(() => {
    setSwappedContent(null);
  }, [metadata.id]);

  return (
    <>
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '16px',
        padding: '12px',
        backgroundColor: 'var(--ifm-background-surface-color)',
        borderRadius: '8px',
        alignItems: 'center'
      }}>
        <PersonalizeButton 
          chapterContent={metadata.source || ''} 
          chapterId={metadata.id || metadata.slug} 
        />
        <TranslateButton 
          chapterContent={metadata.source || ''} 
          chapterId={metadata.id || metadata.slug} 
        />
        {swappedContent && (
          <button 
            onClick={() => setSwappedContent(null)}
            className="button button--secondary button--sm"
            style={{ marginLeft: 'auto' }}
          >
            ↩ Show Original (English)
          </button>
        )}
      </div>
      
      {swappedContent ? (
        <div className="markdown" style={{ padding: '2rem', backgroundColor: 'var(--ifm-background-color)', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <ReactMarkdown>{swappedContent}</ReactMarkdown>
        </div>
      ) : (
        <OriginalLayout {...props} />
      )}
    </>
  );
}
