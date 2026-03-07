import React, { useState, useEffect } from 'react';
import { useAuth } from '../../theme/Root';
import { apiFetch } from '@site/src/utils/api';
import { useHistory } from '@docusaurus/router';
import { BackgroundQuestions, type BackgroundData } from '../../components/BackgroundQuestions';

/**
 * User Profile Interface
 */
interface UserProfile {
  id: string;
  name: string;
  email: string;
  created_at: string;
  background?: BackgroundData;
}

/**
 * Profile Page Component
 * Display and edit user profile
 */
export default function Profile(): React.JSX.Element {
  const { user, token, isLoggedIn, logout } = useAuth();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn()) {
      history.push('/login');
    }
  }, [isLoggedIn, history]);

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!token) return;

      try {
        const response = await apiFetch('/auth/me', {}, true);
        if (!response.ok) throw new Error('Failed to load profile');

        const data = await response.json();
        setProfile(data);
        
        // Redirect to onboarding if background not completed
        if (!data.background || !data.background.known_languages || data.background.known_languages.length === 0) {
          window.location.href = '/physical-ai-book/onboarding';
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [token, history]);

  const handleSave = async () => {
    if (!profile || !profile.background) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await apiFetch('/user/background', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profile.background),
      });

      if (!response.ok) throw new Error('Failed to save background');

      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    history.push('/physical-ai-book/');
  };

  const handleBackgroundChange = (background: BackgroundData) => {
    setProfile(prev => prev ? { ...prev, background } : null);
  };

  if (!isLoggedIn()) {
    return null;
  }

  if (isLoading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <p>Failed to load profile</p>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '4rem auto',
      padding: '2rem',
    }}>
      <div style={{
        backgroundColor: 'var(--ifm-background-color)',
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ margin: 0 }}>My Profile</h1>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
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

        {/* Basic Info */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Account Information</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-600)' }}>
                Name
              </label>
              <p style={{ margin: 0, fontSize: '1rem' }}>{profile.name}</p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-600)' }}>
                Email
              </label>
              <p style={{ margin: 0, fontSize: '1rem' }}>{profile.email}</p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-600)' }}>
                Member Since
              </label>
              <p style={{ margin: 0, fontSize: '1rem' }}>
                {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Background/Personalization */}
        <div style={{ borderTop: '1px solid var(--ifm-color-emphasis-300)', paddingTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Personalization Settings</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--ifm-color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <div>
              <BackgroundQuestions
                value={profile.background || {
                  software_experience: 'beginner',
                  hardware_background: 'basic',
                  known_languages: [],
                  learning_style: 'mixed',
                }}
                onChange={handleBackgroundChange}
              />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  onClick={() => setIsEditing(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f0f0f0',
                    color: '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--ifm-color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    opacity: isSaving ? 0.6 : 1,
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : profile.background ? (
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-600)' }}>
                  Software/AI Experience
                </label>
                <p style={{ margin: 0, textTransform: 'capitalize' }}>
                  {profile.background.software_experience}
                </p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-600)' }}>
                  Hardware/Robotics Background
                </label>
                <p style={{ margin: 0, textTransform: 'capitalize' }}>
                  {profile.background.hardware_background}
                </p>
              </div>
              {profile.background.known_languages.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-600)' }}>
                    Programming Languages
                  </label>
                  <p style={{ margin: 0 }}>{profile.background.known_languages.join(', ')}</p>
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-600)' }}>
                  Learning Style
                </label>
                <p style={{ margin: 0, textTransform: 'capitalize' }}>
                  {profile.background.learning_style}
                </p>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--ifm-color-emphasis-600)' }}>
              No background information saved yet. Click "Edit" to add your details.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
