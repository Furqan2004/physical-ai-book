import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import OnboardingForm from '../components/OnboardingForm';
import { apiFetch } from '../utils/api';
import { useAuth } from '../theme/Root';

export default function Onboarding(): React.JSX.Element {
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If not logged in and not loading, redirect to signup
    if (!authLoading && !user) {
      window.location.href = '/physical-ai-book/signup';
    }
  }, [user, authLoading]);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch('/user/background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }, true);

      if (!response.ok) {
        throw new Error('Failed to save your preferences');
      }

      // Success! Redirect to book
      window.location.href = '/physical-ai-book/docs/intro';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return <Layout><div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div></Layout>;
  }

  return (
    <Layout title="Welcome!">
      <div style={{
        maxWidth: '600px',
        margin: '4rem auto',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'var(--ifm-background-color)',
      }}>
        {error && (
          <div style={{
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            color: '#c00',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}
        
        <OnboardingForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </Layout>
  );
}
