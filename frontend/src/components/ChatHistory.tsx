import React, { useState, useEffect } from 'react';
import { useAuth } from '@theme/Root';
import { apiFetch } from '@site/src/utils/api';

/**
 * Chat Message Interface
 */
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

/**
 * Chat History Props
 */
interface ChatHistoryProps {
  sessionId: string;
  onSelectMessage?: (message: ChatMessage) => void;
}

/**
 * Chat History Component
 * Displays saved chat history for logged-in users
 */
export function ChatHistory({ sessionId, onSelectMessage }: ChatHistoryProps): JSX.Element | null {
  const { isLoggedIn } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only show for logged-in users
  if (!isLoggedIn()) {
    return null;
  }

  useEffect(() => {
    const loadHistory = async () => {
      if (!sessionId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await apiFetch(`/api/chat/history?session_id=${sessionId}`, {}, true);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || 'Failed to load history');
        }

        const data = await response.json();
        setMessages(data.messages || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chat history');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [sessionId]);

  if (loading) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--ifm-color-emphasis-600)' }}>
        Loading chat history...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '1rem',
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        borderRadius: '4px',
        color: '#c00',
      }}>
        {error}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div style={{
        padding: '1rem',
        textAlign: 'center',
        color: 'var(--ifm-color-emphasis-600)',
        fontStyle: 'italic',
      }}>
        No chat history yet. Start a conversation!
      </div>
    );
  }

  return (
    <div style={{
      maxHeight: '400px',
      overflowY: 'auto',
      padding: '1rem',
      backgroundColor: 'var(--ifm-background-surface-color)',
      borderRadius: '8px',
      marginBottom: '1rem',
    }}>
      <h3 style={{
        margin: '0 0 1rem 0',
        fontSize: '0.875rem',
        color: 'var(--ifm-color-emphasis-600)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        📜 Chat History ({messages.length} messages)
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                backgroundColor: msg.role === 'user'
                  ? 'var(--ifm-color-primary)'
                  : 'var(--ifm-color-emphasis-200)',
                color: msg.role === 'user' ? 'white' : 'var(--ifm-color-emphasis-800)',
                fontSize: '0.875rem',
                lineHeight: '1.5',
              }}
            >
              <div style={{
                fontSize: '0.75rem',
                opacity: 0.8,
                marginBottom: '0.25rem',
                textTransform: 'capitalize',
              }}>
                {msg.role === 'user' ? '👤 You' : '🤖 Assistant'}
              </div>
              <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                {msg.content}
              </div>
              <div style={{
                fontSize: '0.7rem',
                opacity: 0.6,
                marginTop: '0.25rem',
                textAlign: 'right',
              }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
