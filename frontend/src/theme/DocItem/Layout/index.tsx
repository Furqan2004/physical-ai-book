import React from 'react';
import OriginalLayout from '@theme-original/DocItem/Layout';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import PersonalizeButton from '@site/src/components/ChapterButtons/PersonalizeButton';
import TranslateButton from '@site/src/components/ChapterButtons/TranslateButton';

export default function DocItemLayoutWrapper(props) {
  const { metadata } = useDoc();
  
  return (
    <>
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '16px',
        padding: '12px',
        backgroundColor: 'var(--ifm-background-surface-color)',
        borderRadius: '8px'
      }}>
        <PersonalizeButton 
          chapterContent={metadata.source || ''} 
          chapterId={metadata.id || metadata.slug} 
        />
        <TranslateButton 
          chapterContent={metadata.source || ''} 
          chapterId={metadata.id || metadata.slug} 
        />
      </div>
      <OriginalLayout {...props} />
    </>
  );
}
