import React from 'react';
import Link from '@docusaurus/Link';

/**
 * Guest Banner Component
 * Displays a subtle login suggestion for guest users
 * Shown in chatbot when user is not authenticated
 */
export function GuestBanner() {
  return (
    <div
      style={{
        backgroundColor: '#f0f8ff',
        borderLeft: '4px solid #2e8555',
        padding: '12px 16px',
        marginBottom: '16px',
        borderRadius: '4px',
        fontSize: '14px',
        color: '#333',
      }}
    >
      💡{' '}
      <Link to="/login" style={{ color: '#2e8555', fontWeight: 'bold' }}>
        Login
      </Link>
      {' '}to unlock personalized experience, chat history, and more features!
    </div>
  );
}
