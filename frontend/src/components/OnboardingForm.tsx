import React, { useState } from 'react';

interface OnboardingData {
  software_experience: 'beginner' | 'intermediate' | 'advanced';
  hardware_background: string;
  known_languages: string[];
  learning_style: 'visual' | 'reading' | 'hands-on';
}

interface OnboardingFormProps {
  onSubmit: (data: OnboardingData) => Promise<void>;
  isLoading: boolean;
}

export default function OnboardingForm({ onSubmit, isLoading }: OnboardingFormProps): React.JSX.Element {
  const [data, setData] = useState<OnboardingData>({
    software_experience: 'beginner',
    hardware_background: '',
    known_languages: [],
    learning_style: 'hands-on',
  });

  const programmingLanguages = [
    'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C', 'MATLAB', 'Other',
  ];

  const handleLanguageToggle = (lang: string) => {
    setData(prev => ({
      ...prev,
      known_languages: prev.known_languages.includes(lang)
        ? prev.known_languages.filter(l => l !== lang)
        : [...prev.known_languages, lang],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 style={{ marginBottom: '1.5rem' }}>Your Background</h1>
      <p style={{ marginBottom: '1.5rem', color: 'var(--ifm-color-emphasis-600)' }}>
        Help us personalize your learning experience
      </p>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Software/AI Experience Level
        </label>
        <select
          value={data.software_experience}
          onChange={(e) => setData({ ...data, software_experience: e.target.value as any })}
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
        <textarea
          value={data.hardware_background}
          onChange={(e) => setData({ ...data, hardware_background: e.target.value })}
          placeholder="e.g. Have you worked with Arduino, Raspberry Pi, etc?"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid var(--ifm-color-emphasis-300)',
            borderRadius: '4px',
            fontSize: '1rem',
            minHeight: '80px',
          }}
        />
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
                checked={data.known_languages.includes(lang)}
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
          value={data.learning_style}
          onChange={(e) => setData({ ...data, learning_style: e.target.value as any })}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid var(--ifm-color-emphasis-300)',
            borderRadius: '4px',
            fontSize: '1rem',
          }}
        >
          <option value="hands-on">Hands-on - Learn by doing projects</option>
          <option value="visual">Visual - Diagrams and videos</option>
          <option value="reading">Reading - In-depth text</option>
        </select>
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
        {isLoading ? 'Saving...' : 'Finish Onboarding'}
      </button>
    </form>
  );
}
