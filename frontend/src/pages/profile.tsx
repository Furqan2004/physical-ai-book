import React, { useEffect, useState } from 'react';
import { useHistory } from '@docusaurus/router';
import { apiFetch } from '../utils/api';
import { useAuth } from '../theme/Root';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  created_at: string;
  background?: {
    software_experience: string;
    hardware_background: string;
    known_languages: string[];
    learning_style: string;
  };
}

export default function Profile(): React.JSX.Element {
  const history = useHistory();
  const { logout, isLoggedIn } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not logged in
  if (!isLoggedIn()) {
    history.push('/physical-ai-book/signin');
    return <div>Redirecting...</div>;
  }

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await apiFetch('/auth/me', {}, true);
      
      if (!response.ok) {
        throw new Error('Failed to load profile');
      }

      const data = await response.json();
      setProfile(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      history.push('/physical-ai-book/');
    } catch (err: any) {
      setError(err.message || 'Failed to logout');
    }
  };

  if (loading) {
    return (
      <div className="container margin-vert--lg">
        <div className="row">
          <div className="col col--6 col--offset-3 text--center">
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container margin-vert--lg">
      <div className="row">
        <div className="col col--8 col--offset-2">
          <div className="card">
            <div className="card__header">
              <h1>My Profile</h1>
            </div>
            <div className="card__body">
              {error && (
                <div className="alert alert--danger margin-bottom--md" role="alert">
                  {error}
                </div>
              )}

              {/* Basic Info */}
              <div className="margin-bottom--lg">
                <h3>Account Information</h3>
                <div className="margin-top--md">
                  <p><strong>Name:</strong> {profile?.name}</p>
                  <p><strong>Email:</strong> {profile?.email}</p>
                  <p><strong>Member since:</strong> {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              {/* Background Info */}
              {profile?.background && (
                <div className="margin-bottom--lg">
                  <h3>Learning Profile</h3>
                  <div className="margin-top--md">
                    <p><strong>Experience Level:</strong> {profile.background.software_experience}</p>
                    
                    {profile.background.hardware_background && (
                      <p><strong>Hardware Background:</strong> {profile.background.hardware_background}</p>
                    )}
                    
                    {profile.background.known_languages && profile.background.known_languages.length > 0 && (
                      <p><strong>Programming Languages:</strong> {profile.background.known_languages.join(', ')}</p>
                    )}
                    
                    <p><strong>Learning Style:</strong> {profile.background.learning_style}</p>
                  </div>
                </div>
              )}

              {!profile?.background && (
                <div className="alert alert--info margin-bottom--lg">
                  <p>You haven't completed your learning profile yet.</p>
                  <button
                    className="button button--secondary"
                    onClick={() => history.push('/physical-ai-book/onboarding')}
                  >
                    Complete Profile
                  </button>
                </div>
              )}
            </div>
            <div className="card__footer">
              <button
                onClick={handleLogout}
                className="button button--danger button--block"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
