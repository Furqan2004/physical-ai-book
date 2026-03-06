import React from 'react';
import { useAuth } from '@theme/Root';
import Navbar from '@theme/Navbar';
import Link from '@docusaurus/Link';

/**
 * Auth-aware Navbar wrapper
 * Shows Login/Signup for guests, Profile/Logout for logged-in users
 */
export default function NavbarAuth(): JSX.Element {
  const { isLoggedIn, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Root redirect handled in Root.tsx logout function
  };

  return (
    <Navbar>
      {/* Auth buttons slot */}
      <div className="navbar__items navbar__items--right" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        {isLoggedIn() ? (
          <>
            <Link
              to="/profile"
              className="button button--primary button--sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              👤 Profile
            </Link>
            <button
              onClick={handleLogout}
              className="button button--secondary button--sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              🚪 Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="button button--secondary button--sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              🔐 Login
            </Link>
            <Link
              to="/signup"
              className="button button--primary button--sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              📝 Sign Up
            </Link>
          </>
        )}
      </div>
    </Navbar>
  );
}
