import React, { useState } from 'react';
import { useAuth } from '@theme/Root';
import { apiFetch } from '@site/src/utils/api';
import { useHistory } from '@docusaurus/router';

/**
 * Signup Page Component
 * User registration with background questions
 */
export default function Signup(): JSX.Element {
  const { login } = useAuth();
  const history = useHistory();
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Step 1: Basic info
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Step 2: Background questions
  const [background, setBackground] = useState({
    software_experience: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    hardware_background: 'basic' as 'basic' | 'advanced',
    known_languages: [] as string[],
    learning_style: 'hands-on' as 'hands-on' | 'theoretical' | 'mixed',
  });

  const programmingLanguages = [
    'Python',
    'JavaScript',
    'TypeScript',
    'Java',
    'C++',
    'C',
    'MATLAB',
    'Other',
  ];

  const handleLanguageToggle = (lang: string) => {
    setBackground(prev => ({
      ...prev,
      known_languages: prev.known_languages.includes(lang)
        ? prev.known_languages.filter(l => l !== lang)
        : [...prev.known_languages, lang],
    }));
  };

  const handleBasicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (basicInfo.password !== basicInfo.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (basicInfo.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    // Move to step 2
    setStep(2);
  };

  const handleBackgroundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Step 1: Create account
      const signupResponse = await apiFetch('/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: basicInfo.name,
          email: basicInfo.email,
          password: basicInfo.password,
        }),
      });

      if (!signupResponse.ok) {
        const data = await signupResponse.json();
        throw new Error(data.detail || 'Signup failed');
      }

      const signupData = await signupResponse.json();
      
      // Step 2: Save background
      const backgroundResponse = await apiFetch('/user/background', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${signupData.token}`,
        },
        body: JSON.stringify(background),
      });

      if (!backgroundResponse.ok) {
        console.warn('Background save failed, but account created');
      }

      // Login and redirect
      login(signupData.token, signupData.user);

      // Redirect to home
      window.location.href = '/physical-ai-book/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '500px',
      margin: '4rem auto',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      backgroundColor: 'var(--ifm-background-color)',
    }}>
      {/* Progress indicator */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: step === 1 ? 'bold' : 'normal', color: step === 1 ? 'var(--ifm-color-primary)' : 'inherit' }}>
            Step 1: Account Info
          </span>
          <span style={{ fontWeight: step === 2 ? 'bold' : 'normal', color: step === 2 ? 'var(--ifm-color-primary)' : 'inherit' }}>
            Step 2: Background
          </span>
        </div>
        <div style={{ height: '4px', backgroundColor: '#e0e0e0', borderRadius: '2px' }}>
          <div
            style={{
              width: step === 1 ? '50%' : '100%',
              height: '100%',
              backgroundColor: 'var(--ifm-color-primary)',
              borderRadius: '2px',
              transition: 'width 0.3s',
            }}
          />
        </div>
      </div>

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

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <form onSubmit={handleBasicSubmit}>
          <h1 style={{ marginBottom: '1.5rem' }}>Create Account</h1>
          
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={basicInfo.name}
              onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
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

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Email
            </label>
            <input
              type="email"
              id="email"
              value={basicInfo.email}
              onChange={(e) => setBasicInfo({ ...basicInfo, email: e.target.value })}
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

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={basicInfo.password}
              onChange={(e) => setBasicInfo({ ...basicInfo, password: e.target.value })}
              required
              minLength={8}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--ifm-color-emphasis-300)',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={basicInfo.confirmPassword}
              onChange={(e) => setBasicInfo({ ...basicInfo, confirmPassword: e.target.value })}
              required
              minLength={8}
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
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'var(--ifm-color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Next: Background Questions
          </button>
        </form>
      )}

      {/* Step 2: Background Questions */}
      {step === 2 && (
        <form onSubmit={handleBackgroundSubmit}>
          <h1 style={{ marginBottom: '1.5rem' }}>Your Background</h1>
          <p style={{ marginBottom: '1.5rem', color: 'var(--ifm-color-emphasis-600)' }}>
            Help us personalize your learning experience
          </p>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Software/AI Experience Level
            </label>
            <select
              value={background.software_experience}
              onChange={(e) => setBackground({ ...background, software_experience: e.target.value as any })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--ifm-color-emphasis-300)',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            >
              <option value="beginner">Beginner - Just starting out</option>
              <option value="intermediate">Intermediate - Some experience</option>
              <option value="advanced">Advanced - Very experienced</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Hardware/Robotics Background
            </label>
            <select
              value={background.hardware_background}
              onChange={(e) => setBackground({ ...background, hardware_background: e.target.value as any })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--ifm-color-emphasis-300)',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            >
              <option value="basic">Basic - Little to no experience</option>
              <option value="advanced">Advanced - Have worked with hardware/robots</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Programming Languages You Know
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {programmingLanguages.map((lang) => (
                <label key={lang} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={background.known_languages.includes(lang)}
                    onChange={() => handleLanguageToggle(lang)}
                  />
                  {lang}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Preferred Learning Style
            </label>
            <select
              value={background.learning_style}
              onChange={(e) => setBackground({ ...background, learning_style: e.target.value as any })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--ifm-color-emphasis-300)',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            >
              <option value="hands-on">Hands-on - Learn by doing projects</option>
              <option value="theoretical">Theoretical - Understand concepts first</option>
              <option value="mixed">Mixed - Both theory and practice</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#f0f0f0',
                color: '#333',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 1,
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
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
