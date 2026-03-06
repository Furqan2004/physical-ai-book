import React, { useEffect } from 'react';
import { useAuth } from '@theme/Root';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }): JSX.Element | null {
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn()) {
      // Redirect to login if not authenticated
      window.location.href = '/physical-ai-book/login';
    }
  }, [isLoggedIn]);

  if (!isLoggedIn()) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Higher-order component for protecting pages
 */
export function withProtected<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
