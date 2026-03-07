import React from 'react';

/**
 * Background Questions Interface
 */
export interface BackgroundData {
  software_experience: 'beginner' | 'intermediate' | 'advanced';
  hardware_background: 'basic' | 'advanced';
  known_languages: string[];
  learning_style: 'hands-on' | 'theoretical' | 'mixed';
}

/**
 * Background Questions Form Props
 */
interface BackgroundQuestionsProps {
  value: BackgroundData;
  onChange: (data: BackgroundData) => void;
}

/**
 * Programming languages options
 */
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

/**
 * Background Questions Form Component
 * Reusable component for collecting user background
 */
export function BackgroundQuestions({ value, onChange }: BackgroundQuestionsProps): React.JSX.Element {
  const handleLanguageToggle = (lang: string) => {
    onChange({
      ...value,
      known_languages: value.known_languages.includes(lang)
        ? value.known_languages.filter(l => l !== lang)
        : [...value.known_languages, lang],
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Software/AI Experience Level
        </label>
        <select
          value={value.software_experience}
          onChange={(e) => onChange({ ...value, software_experience: e.target.value as any })}
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
          value={value.hardware_background}
          onChange={(e) => onChange({ ...value, hardware_background: e.target.value as any })}
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
                checked={value.known_languages.includes(lang)}
                onChange={() => handleLanguageToggle(lang)}
              />
              {lang}
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Preferred Learning Style
        </label>
        <select
          value={value.learning_style}
          onChange={(e) => onChange({ ...value, learning_style: e.target.value as any })}
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
    </div>
  );
}
