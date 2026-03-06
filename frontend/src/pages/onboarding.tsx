import React, { useState } from 'react';
import { useHistory } from '@docusaurus/router';
import { apiFetch } from '../utils/api';
import { useAuth } from '../theme/Root';

const PROGRAMMING_LANGUAGES = [
  'Python',
  'JavaScript',
  'TypeScript',
  'C++',
  'Java',
  'C#',
  'Go',
  'Rust',
  'Other',
];

export default function Onboarding(): JSX.Element {
  const history = useHistory();
  const { isLoggedIn } = useAuth();
  
  const [formData, setFormData] = useState({
    software_experience: '',
    hardware_background: '',
    known_languages: [] as string[],
    learning_style: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if not logged in
  if (!isLoggedIn()) {
    history.push('/physical-ai-book/signin');
    return <div>Redirecting...</div>;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLanguageToggle = (lang: string) => {
    setFormData({
      ...formData,
      known_languages: formData.known_languages.includes(lang)
        ? formData.known_languages.filter((l) => l !== lang)
        : [...formData.known_languages, lang],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiFetch(
        '/user/background',
        {
          method: 'POST',
          body: JSON.stringify(formData),
        },
        true
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to save background');
      }

      // Redirect to home page
      history.push('/physical-ai-book/');
    } catch (err: any) {
      setError(err.message || 'Failed to save background');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container margin-vert--lg">
      <div className="row">
        <div className="col col--8 col--offset-2">
          <div className="card">
            <div className="card__header">
              <h1>Tell Us About Yourself</h1>
              <p>Help us personalize your learning experience</p>
            </div>
            <div className="card__body">
              <form onSubmit={handleSubmit}>
                {/* Software Experience */}
                <div className="margin-bottom--lg">
                  <label htmlFor="software_experience" className="margin-bottom--sm">
                    <strong>What's your software development experience?</strong>
                  </label>
                  <select
                    id="software_experience"
                    name="software_experience"
                    required
                    value={formData.software_experience}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  >
                    <option value="">Select experience level</option>
                    <option value="beginner">Beginner (Just starting out)</option>
                    <option value="intermediate">Intermediate (Some experience)</option>
                    <option value="advanced">Advanced (Experienced developer)</option>
                  </select>
                </div>

                {/* Hardware Background */}
                <div className="margin-bottom--lg">
                  <label htmlFor="hardware_background" className="margin-bottom--sm">
                    <strong>Do you have any hardware background?</strong>
                  </label>
                  <textarea
                    id="hardware_background"
                    name="hardware_background"
                    rows={3}
                    placeholder="E.g., Worked with Arduino, Raspberry Pi, robotics, etc. (optional)"
                    value={formData.hardware_background}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>

                {/* Programming Languages */}
                <div className="margin-bottom--lg">
                  <label className="margin-bottom--sm">
                    <strong>Which programming languages do you know?</strong>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {PROGRAMMING_LANGUAGES.map((lang) => (
                      <label key={lang} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={formData.known_languages.includes(lang)}
                          onChange={() => handleLanguageToggle(lang)}
                        />
                        {lang}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Learning Style */}
                <div className="margin-bottom--lg">
                  <label className="margin-bottom--sm">
                    <strong>How do you prefer to learn?</strong>
                  </label>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="radio"
                        name="learning_style"
                        value="visual"
                        checked={formData.learning_style === 'visual'}
                        onChange={handleChange}
                      />
                      Visual (Diagrams, videos, illustrations)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="radio"
                        name="learning_style"
                        value="reading"
                        checked={formData.learning_style === 'reading'}
                        onChange={handleChange}
                      />
                      Reading (Text documentation, articles)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="radio"
                        name="learning_style"
                        value="hands-on"
                        checked={formData.learning_style === 'hands-on'}
                        onChange={handleChange}
                      />
                      Hands-on (Code examples, practical exercises)
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="alert alert--danger margin-bottom--md" role="alert">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !formData.software_experience || !formData.learning_style}
                  className="button button--primary button--block"
                >
                  {isLoading ? 'Saving...' : 'Save & Start Reading'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
