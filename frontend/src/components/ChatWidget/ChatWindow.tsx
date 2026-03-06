import React, { useState, useRef, useEffect } from 'react';
import { apiStream, apiFetch } from '../../utils/api';
import { GuestBanner } from '../GuestBanner';
import { ChatHistory } from '../ChatHistory';
import { useAuth } from '../../theme/Root';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWindowProps {
  onClose: () => void;
  initialSelectedText?: string | null;
  isLoggedIn?: boolean;
}

export default function ChatWindow({ onClose, initialSelectedText, isLoggedIn = false }: ChatWindowProps): JSX.Element {
  const { isLoggedIn: authIsLoggedIn } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use prop if provided, otherwise use auth hook
  const isUserLoggedIn = isLoggedIn !== undefined ? isLoggedIn : authIsLoggedIn();

  // Generate session ID once (use user ID for logged-in users to persist history)
  const sessionIdRef = useRef<string>(
    isUserLoggedIn
      ? `user-session-${Date.now()}`
      : `guest-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );

  // Load chat history for logged-in users on mount
  useEffect(() => {
    if (isUserLoggedIn) {
      loadChatHistory();
    }
  }, [isUserLoggedIn]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const response = await apiFetch(`/api/chat/history?session_id=${sessionIdRef.current}`, {}, true);
      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
          setShowHistory(true);
        }
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    // Add empty assistant placeholder
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      await apiStream(
        '/api/chat',
        {
          message: userMessage,
          session_id: sessionIdRef.current,
          selected_text: initialSelectedText || null,
        },
        // On chunk received
        (chunk: string) => {
          // Parse SSE data
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              setMessages((prev) => {
                const updated = [...prev];
                const lastMsg = updated[updated.length - 1];
                if (lastMsg && lastMsg.role === 'assistant') {
                  lastMsg.content += data;
                }
                return updated;
              });
            }
          }
        },
        // On done
        () => {
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
          lastMsg.content = 'Error: Failed to get response. Please try again.';
        }
        return updated;
      });
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '0',
        right: '20px',
        width: '400px',
        height: '600px',
        backgroundColor: 'white',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
        borderRadius: '12px 12px 0 0',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--ifm-color-primary)',
          color: 'white',
          borderRadius: '12px 12px 0 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>Book Assistant</h3>
          {isUserLoggedIn && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              title={showHistory ? 'Hide history' : 'Show history'}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
              }}
            >
              📜
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          ×
        </button>
      </div>

      {/* Guest banner - only show for non-logged-in users */}
      {!isUserLoggedIn && <GuestBanner />}

      {/* Logged-in features banner */}
      {isUserLoggedIn && (
        <div style={{
          padding: '8px 16px',
          backgroundColor: '#e8f5e9',
          fontSize: '12px',
          borderBottom: '1px solid #c8e6c9',
          color: '#2e7d32',
        }}>
          ✨ Premium Features Active: Personalization • Translation • Chat History • Selected Text AI
        </div>
      )}

      {/* Chat History - only for logged-in users */}
      {isUserLoggedIn && showHistory && (
        <ChatHistory sessionId={sessionIdRef.current} />
      )}

      {/* Selected text banner */}
      {initialSelectedText && (
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: '#f0f0f0',
            fontSize: '12px',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <strong>Asking about:</strong> "{initialSelectedText.substring(0, 100)}
          {initialSelectedText.length > 100 ? '...' : ''}"
        </div>
      )}

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: '#666', textAlign: 'center', marginTop: '40px' }}>
            Ask me anything about the book content!
          </p>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              marginBottom: '12px',
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: msg.role === 'user' ? 'var(--ifm-color-primary)' : '#f0f0f0',
                color: msg.role === 'user' ? 'white' : '#333',
                wordWrap: 'break-word',
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'flex-start' }}>
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: '#f0f0f0',
                display: 'flex',
                gap: '4px',
              }}
            >
              <span style={{ animation: 'bounce 1.4s infinite' }}>●</span>
              <span style={{ animation: 'bounce 1.4s infinite 0.2s' }}>●</span>
              <span style={{ animation: 'bounce 1.4s infinite 0.4s' }}>●</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          gap: '8px',
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question about the book..."
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--ifm-color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
            opacity: isLoading || !input.trim() ? 0.6 : 1,
          }}
        >
          Send
        </button>
      </div>

      {/* CSS for loading animation */}
      <style>
        {`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
}
