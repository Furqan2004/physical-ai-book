import React from 'react';
import OriginalContent from '@theme-original/Navbar/Content';
import { useAuth } from '../../Root';
import { useHistory } from '@docusaurus/router';
import Link from '@docusaurus/Link';
import type { WrapperProps } from '@docusaurus/types';
import type ContentType from '@theme/Navbar/Content';

type Props = WrapperProps<typeof ContentType>;

export default function ContentWrapper(props: Props): React.JSX.Element {
  const { isLoggedIn, user, logout } = useAuth();
  const history = useHistory();

  const handleLogout = async () => {
    await logout();
    // Root redirect handled in Root.tsx logout function
  };

  return (
    <>
      <OriginalContent {...props} />
      {isLoggedIn() ? (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          marginLeft: '16px',
        }}>
          <Link
            to="/profile"
            className="button button--primary button--sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              textDecoration: 'none',
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
              textDecoration: 'none',
            }}
          >
            🚪 Logout
          </button>
        </div>
      ) : (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          marginLeft: '16px',
        }}>
          <Link
            to="/login"
            className="button button--secondary button--sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              textDecoration: 'none',
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
              textDecoration: 'none',
            }}
          >
            📝 Sign Up
          </Link>
        </div>
      )}
    </>
  );
}
