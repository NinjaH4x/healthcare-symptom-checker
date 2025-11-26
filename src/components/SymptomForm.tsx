'use client';

import { useState } from 'react';
import FormInput from './FormInput';
import { useLang } from '@/lib/langContext';
import { t } from '@/lib/i18n';

interface SymptomFormProps {
  onSubmit: (symptoms: string, additionalInfo: string) => void;
  isLoading: boolean;
  isCompact?: boolean;
}

export default function SymptomForm({ onSubmit, isLoading, isCompact = false }: SymptomFormProps) {
  const [symptoms, setSymptoms] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [duration, setDuration] = useState('');
  const [temperature, setTemperature] = useState('');
  const [tempAfter, setTempAfter] = useState('');
  const [severity, setSeverity] = useState('moderate');

  const { lang } = useLang();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      alert(t('errors.noSymptoms', lang) || 'Please enter at least one symptom');
      return;
    }

    if (temperature.trim()) {
      const tempNum = parseFloat(temperature);
      if (isNaN(tempNum) || tempNum < 35 || tempNum > 42) {
        alert(t('errors.invalidTemperature', lang) || 'Temperature must be between 35°C and 42°C');
        return;
      }
    }

    if (duration.trim()) {
      const durationNum = parseFloat(duration);
      if (isNaN(durationNum) || durationNum < 0) {
        alert(t('errors.invalidDuration', lang) || 'Duration must be a positive number');
        return;
      }
    }

    const fullInfo = `Duration: ${duration || 'Not specified'} | Severity: ${severity} | Temperature: ${temperature || 'Not specified'} | Temp onset: ${tempAfter || 'Not specified'} | Additional: ${additionalInfo}`;
    onSubmit(symptoms, fullInfo);
    setSymptoms('');
    setAdditionalInfo('');
    setDuration('');
    setTemperature('');
    setTempAfter('');
  };

  const addSymptomValue = (value: string) => {
    setSymptoms((prev) => {
      const trimmed = prev ? prev.trim() : '';
      if (!trimmed) return value;
      const parts = trimmed.split(/,\s*/).map((p) => p.trim());
      if (parts.some((p) => p.toLowerCase() === value.toLowerCase())) return trimmed;
      return `${trimmed}, ${value}`;
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="symptoms" className="text-sm font-medium block mb-1" style={{ color: '#23408e' }}>{t('form.symptoms', lang)}</label>

          {/* Quick Templates (localized labels, English values used internally) */}
          <div className="mb-3">
            <p className="text-xs font-medium mb-2" style={{ color: '#23408e' }}>{t('form.quickTemplates', lang)}</p>

            <div className="mb-2">
              <p className="text-xs font-semibold mb-1" style={{ color: '#464444' }}>🫁 {t('form.respiratoryLabel', lang) || 'Respiratory:'}</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'cough', emoji: '😷', value: 'Cough' },
                  { key: 'sorethroat', emoji: '🤒', value: 'Sore Throat' },
                  { key: 'runnynose', emoji: '🤧', value: 'Runny Nose' },
                  { key: 'sneezing', emoji: '🤧', value: 'Sneezing' },
                  { key: 'breathlessness', emoji: '😮‍💨', value: 'Breathlessness' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => addSymptomValue(item.value)}
                    disabled={isLoading}
                    className="px-3 py-1 text-sm border rounded-md transition disabled:opacity-50"
                    style={{ backgroundColor: '#F7EFD2', color: '#23408e', borderColor: '#A6CBFF' }}
                  >
                    {item.emoji} {t(`symptom.${item.key}`, lang)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-2">
              <p className="text-xs font-semibold mb-1" style={{ color: '#464444' }}>🌡️ {t('form.generalLabel', lang) || 'General:'}</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'fever', emoji: '🌡️', value: 'Fever' },
                  { key: 'headache', emoji: '🤕', value: 'Headache' },
                  { key: 'bodyache', emoji: '💪', value: 'Body Ache' },
                  { key: 'fatigue', emoji: '😴', value: 'Fatigue' },
                  { key: 'chills', emoji: '❄️', value: 'Chills' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => addSymptomValue(item.value)}
                    disabled={isLoading}
                    className="px-3 py-1 text-sm border rounded-md transition disabled:opacity-50"
                    style={{ backgroundColor: '#F7EFD2', color: '#23408e', borderColor: '#A6CBFF' }}
                  >
                    {item.emoji} {t(`symptom.${item.key}`, lang)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: '#464444' }}>🤢 {t('form.digestiveLabel', lang) || 'Digestive:'}</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'nausea', emoji: '🤢', value: 'Nausea' },
                  { key: 'vomiting', emoji: '🤮', value: 'Vomiting' },
                  { key: 'diarrhea', emoji: '💩', value: 'Diarrhea' },
                  { key: 'abdominal', emoji: '😣', value: 'Abdominal Pain' },
                  { key: 'lossofappetite', emoji: '🍽️', value: 'Loss of Appetite' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => addSymptomValue(item.value)}
                    disabled={isLoading}
                    className="px-3 py-1 text-sm border rounded-md transition disabled:opacity-50"
                    style={{ backgroundColor: '#F7EFD2', color: '#23408e', borderColor: '#A6CBFF' }}
                  >
                    {item.emoji} {t(`symptom.${item.key}`, lang)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <textarea
            id="symptoms"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder={t('placeholders.symptoms', lang)}
            className={`w-full px-3 py-2 border-2 rounded resize-none text-[#464444] ${isCompact ? 'py-2 text-sm' : ''}`}
            style={{ borderColor: '#A6CBFF' }}
            rows={4}
            required
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3">
          <div>
            <FormInput id="duration" label={t('form.duration', lang)} value={duration} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setDuration(e.target.value)} placeholder={t('placeholders.duration', lang)} />
          </div>

          <div>
            <FormInput id="temperature" label={t('form.temperature', lang)} type="number" value={temperature} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setTemperature(e.target.value)} placeholder={t('placeholders.temperature', lang)} />
          </div>

          <div>
            <FormInput
              id="severity"
              label={t('form.severity', lang)}
              as="select"
              value={severity}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setSeverity(e.target.value)}
              options={[{ value: 'mild', label: 'Mild' }, { value: 'moderate', label: 'Moderate' }, { value: 'severe', label: 'Severe' }]}
            />
          </div>
        </div>

        <div className="mt-3">
          <label htmlFor="tempAfter" className="text-sm font-medium block mt-2 mb-1" style={{ color: '#23408e' }}>
            {t('form.tempAfter', lang)}
          </label>
          <input
            id="tempAfter"
            type="text"
            value={tempAfter}
            onChange={(e) => setTempAfter(e.target.value)}
            placeholder={t('placeholders.tempAfter', lang)}
            className="w-full px-3 py-2 border-2 rounded text-[#464444]"
            style={{ borderColor: '#A6CBFF' }}
            disabled={isLoading}
          />
        </div>

        <div className="mt-3">
          <label htmlFor="additionalInfo" className="text-sm font-medium block mb-1" style={{ color: '#23408e' }}>
            {t('form.additionalInfo', lang)}
          </label>
          <textarea
            id="additionalInfo"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder={t('placeholders.additionalInfo', lang)}
            className={`w-full px-3 py-2 border-2 rounded resize-none text-[#464444] ${isCompact ? 'py-2 text-sm' : ''}`}
            style={{ borderColor: '#A6CBFF' }}
            rows={3}
            disabled={isLoading}
          />
        </div>

        <div className="mt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 text-[#23408e] font-semibold rounded-lg disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition"
            style={{ background: 'linear-gradient(90deg, #A6CBFF 0%, #B7FAAF 100%)' }}
          >
            {isLoading ? t('form.analyzing', lang) : t('form.submit', lang)}
          </button>
        </div>

        <p className="text-xs mt-4" style={{ color: '#464444' }}>
          {t('disclaimer', lang)}
        </p>
      </form>
    </div>
  );
}
