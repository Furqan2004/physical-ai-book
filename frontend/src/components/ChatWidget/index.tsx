import React, { useState, useEffect } from 'react';
import { useAuth } from '../../theme/Root';
import ChatWindow from './ChatWindow';
import TextSelectionPopup from './TextSelectionPopup';
import { GuestBanner } from '../GuestBanner';

export default function ChatWidget(): JSX.Element | null {
  const { isLoggedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Only render on client side to avoid SSR issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const handleAskAboutThis = (text: string) => {
    setSelectedText(text);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedText(null);
  };

  return (
    <>
      {/* Floating button - visible to everyone */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'var(--ifm-color-primary)',
            color: 'white',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            cursor: 'pointer',
            zIndex: 1000,
            fontSize: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Chat with Book Assistant"
        >
          💬
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <>
          <ChatWindow 
            onClose={handleClose} 
            initialSelectedText={selectedText}
            isLoggedIn={isLoggedIn()}
          />
          {/* Backdrop */}
          <div
            onClick={handleClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              zIndex: 999,
            }}
          />
        </>
      )}

      {/* Text selection popup - only for logged-in users */}
      {isLoggedIn() && <TextSelectionPopup onAskAboutThis={handleAskAboutThis} />}
    </>
  );
}
