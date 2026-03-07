import React, { useState } from 'react';
import Layout from '@theme/Layout';
import { apiFetch } from '../utils/api';

export default function ForgotPassword(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Placeholder for actual reset logic
      const response = await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        // Even if user not found, we usually show success to avoid email enumeration
        console.warn('Reset request failed on server');
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title="Forgot Password">
      <div style={{
        maxWidth: '400px',
        margin: '4rem auto',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'var(--ifm-background-color)',
      }}>
        <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Reset Password</h1>
        
        {isSubmitted ? (
          <div style={{ textAlign: 'center' }}>
            <p>If an account exists for {email}, you will receive a password reset link shortly.</p>
            <a href="/physical-ai-book/login" className="button button--primary">
              Back to Login
            </a>
          </div>
        ) : (
          <>
            <p style={{ marginBottom: '1.5rem', color: 'var(--ifm-color-emphasis-700)' }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>

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

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--ifm-color-emphasis-300)',
                    borderRadius: '4px',
                    fontSize: '1rem',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'var(--ifm-color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                {isLoading ? 'Sending Link...' : 'Send Reset Link'}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <a href="/physical-ai-book/login" style={{ color: 'var(--ifm-color-primary)', fontSize: '0.9rem' }}>
                Back to Login
              </a>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
