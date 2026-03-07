import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

interface ChatHistoryProps {
  onSelectSession: (sessionId: string) => void;
  currentSessionId: string;
}

export function ChatHistory({ onSelectSession, currentSessionId }: ChatHistoryProps): React.JSX.Element | null {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await apiFetch('/api/chat/sessions', {}, true);
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading sessions...</div>;
  }

  return (
    <div style={{
      position: 'absolute',
      top: '60px',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'var(--ifm-background-color)',
      zIndex: 100,
      overflowY: 'auto',
      padding: '15px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      <h4 style={{ margin: '0 0 10px 0', paddingBottom: '10px', borderBottom: '1px solid var(--ifm-color-emphasis-200)' }}>
        Your Previous Chats
      </h4>
      
      {sessions.length === 0 ? (
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>No previous conversations found.</p>
      ) : (
        sessions.map((session) => (
          <div
            key={session.session_token}
            onClick={() => onSelectSession(session.session_token)}
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: currentSessionId === session.session_token ? 'var(--ifm-color-emphasis-200)' : 'var(--ifm-color-emphasis-100)',
              cursor: 'pointer',
              border: `1px solid ${currentSessionId === session.session_token ? 'var(--ifm-color-primary)' : 'transparent'}`,
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>
              Chat from {new Date(session.created_at).toLocaleDateString()}
            </div>
            <div style={{ fontSize: '11px', color: '#666' }}>
              ID: {session.session_token.substring(0, 15)}...
            </div>
          </div>
        ))
      )}
      
      <button
        onClick={() => onSelectSession(`session-${Date.now()}`)}
        style={{
          marginTop: 'auto',
          padding: '12px',
          backgroundColor: 'var(--ifm-color-primary)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        + Start New Chat
      </button>
    </div>
  );
}
