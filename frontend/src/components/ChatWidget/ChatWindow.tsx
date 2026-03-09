import React, { useState, useRef, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
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

export default function ChatWindow({ onClose, initialSelectedText, isLoggedIn = false }: ChatWindowProps): React.JSX.Element {
  const { isLoggedIn: authIsLoggedIn, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isUserLoggedIn = isLoggedIn !== undefined ? isLoggedIn : authIsLoggedIn();

  // Current session ID - start fresh every time by default
  const [sessionId, setSessionId] = useState<string>(() => {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  });

  // Load chat history when session changes
  useEffect(() => {
    if (isUserLoggedIn) {
      loadChatHistory();
    } else {
      setMessages([]);
    }
  }, [isUserLoggedIn, sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Pre-fill if opened from "Ask AI" (instead of auto-send)
  useEffect(() => {
    if (initialSelectedText && messages.length === 0) {
      setInput(`Selected Context: "${initialSelectedText}"\n\nMy Question: `);
      // Focus and adjust height after pre-fill
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          adjustHeight();
        }
      }, 100);
    }
  }, [initialSelectedText, sessionId]);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 250);
      textarea.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  const loadChatHistory = async () => {
    try {
      const response = await apiFetch(`/api/chat/history?session_id=${sessionId}`, {}, true);
      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          const formattedMessages = data.messages.map((m: any) => ({
            role: m.role,
            content: m.content
          }));
          setMessages(formattedMessages);
        } else {
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleSend = async (overrideInput?: string) => {
    const userMessage = overrideInput || input.trim();
    if (!userMessage || isLoading) return;

    if (!overrideInput) setInput('');
    setIsLoading(true);

    // If it was a manual send, add to UI immediately
    if (!overrideInput) {
      setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    }

    try {
      const response = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: userMessage,
          session_id: sessionId,
          selected_text: initialSelectedText || null,
        }),
      }, isUserLoggedIn);

      if (!response.ok) throw new Error('Server error');

      const data = await response.json();
      
      // If auto-sent, we might need the user message in history too
      if (overrideInput) {
        setMessages([
          { role: 'user', content: userMessage },
          { role: 'assistant', content: data.response }
        ]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error connecting to AI. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectSession = (id: string) => {
    setSessionId(id);
    setShowHistory(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '380px',
        height: '550px',
        backgroundColor: 'var(--ifm-background-color)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10000,
        overflow: 'hidden',
        border: '1px solid var(--ifm-color-emphasis-200)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--ifm-color-primary)',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isUserLoggedIn && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              title="Chat History"
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              📜
            </button>
          )}
          <h3 style={{ margin: 0, fontSize: '16px', color: 'white' }}>
            {showHistory ? 'History' : 'AI Assistant'}
          </h3>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
          }}
        >
          ×
        </button>
      </div>

      {!isUserLoggedIn && <GuestBanner />}

      {/* History View Overlay */}
      {isUserLoggedIn && showHistory && (
        <ChatHistory onSelectSession={handleSelectSession} currentSessionId={sessionId} />
      )}

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          backgroundColor: 'var(--ifm-background-color)',
        }}
      >
        {messages.length === 0 && !isLoading && (
          <div style={{ textAlign: 'center', marginTop: '50px', color: 'var(--ifm-color-emphasis-600)' }}>
            <p>Started a new conversation.</p>
            <p style={{ fontSize: '12px' }}>How can I help you today?</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
              backgroundColor: msg.role === 'user' ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-100)',
              color: msg.role === 'user' ? 'white' : 'var(--ifm-color-emphasis-900)',
              fontSize: '14px',
              lineHeight: '1.5',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {msg.content}
          </div>
        ))}

        {isLoading && (
          <div style={{ alignSelf: 'flex-start', backgroundColor: 'var(--ifm-color-emphasis-100)', padding: '12px 16px', borderRadius: '18px 18px 18px 2px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <div className="dot" style={{ width: '6px', height: '6px', backgroundColor: '#888', borderRadius: '50%', animation: 'bounce 1.4s infinite' }}></div>
              <div className="dot" style={{ width: '6px', height: '6px', backgroundColor: '#888', borderRadius: '50%', animation: 'bounce 1.4s infinite 0.2s' }}></div>
              <div className="dot" style={{ width: '6px', height: '6px', backgroundColor: '#888', borderRadius: '50%', animation: 'bounce 1.4s infinite 0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!showHistory && (
        <div
          style={{
            padding: '15px',
            borderTop: '1px solid var(--ifm-color-emphasis-200)',
            display: 'flex',
            gap: '10px',
            backgroundColor: 'var(--ifm-background-color)',
            alignItems: 'flex-end',
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isLoading}
            rows={1}
            style={{
              flex: 1,
              padding: '12px 15px',
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: '20px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: 'var(--ifm-background-color)',
              color: 'var(--ifm-color-emphasis-900)',
              resize: 'none',
              maxHeight: '250px',
              fontFamily: 'inherit',
              lineHeight: '1.5',
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'var(--ifm-color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              opacity: isLoading || !input.trim() ? 0.6 : 1,
              flexShrink: 0,
              marginBottom: '2px',
            }}
          >
            ➤
          </button>
        </div>
      )}

      <style>
        {`
          @keyframes bounce {
            0%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-5px); }
          }
          .dot { display: inline-block; }
        `}
      </style>
    </div>
  );
}
