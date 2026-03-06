import React from 'react';
import { useAuth } from '@theme/Root';
import Link from '@docusaurus/Link';

/**
 * Auth Buttons Component
 * Shows Login/Signup for guests, Profile link for logged-in users
 */
export function AuthButtons(): JSX.Element {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn()) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Link
          to="/profile"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--ifm-color-primary)',
            color: 'white',
            borderRadius: '4px',
            textDecoration: 'none',
            fontSize: '0.875rem',
          }}
        >
          👤 Profile
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <Link
        to="/login"
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: 'var(--ifm-color-emphasis-600)',
          color: 'white',
          borderRadius: '4px',
          textDecoration: 'none',
          fontSize: '0.875rem',
        }}
      >
        🔐 Login
      </Link>
      <Link
        to="/signup"
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: 'var(--ifm-color-primary)',
          color: 'white',
          borderRadius: '4px',
          textDecoration: 'none',
          fontSize: '0.875rem',
        }}
      >
        📝 Sign Up
      </Link>
    </div>
  );
}
