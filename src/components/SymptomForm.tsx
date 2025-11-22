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
  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      alert('Please enter at least one symptom');
      return;
    }

    // Validate temperature if provided
    if (temperature.trim()) {
      const tempNum = parseFloat(temperature);
      if (isNaN(tempNum) || tempNum < 35 || tempNum > 42) {
        alert('Temperature must be between 35°C and 42°C');
        return;
      }
    }

    // Validate duration if provided
    if (duration.trim()) {
      const durationNum = parseFloat(duration);
      if (isNaN(durationNum) || durationNum < 0) {
        alert('Duration must be a positive number');
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
 

  const { lang } = useLang();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-3" style={{ color: '#23408e' }}>{t('form.heading', lang)}</h3>

      <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto">
        {/* Main Symptoms */}
        <div>
          <label htmlFor="symptoms" className="block text-sm font-medium mb-2" style={{ color: '#23408e' }}>
            {t('form.symptomsLabel', lang)}
          </label>
          
          {/* Quick Templates (ChatGPT-style chips, below the label) */}
          <div className="mb-3">
            <p className="text-xs font-medium mb-2" style={{ color: '#23408e' }}>{t('form.quickTemplates', lang)}</p>
            
            {/* Respiratory Symptoms */}
            <div className="mb-2">
              <p className="text-xs font-semibold mb-1" style={{ color: '#464444' }}>🫁 Respiratory:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'cough', label: '😷 Cough', value: 'Cough' },
                  { key: 'sorethroat', label: '🤒 Sore Throat', value: 'Sore Throat' },
                  { key: 'runnyose', label: '🤧 Runny Nose', value: 'Runny Nose' },
                  { key: 'sneezing', label: '🤧 Sneezing', value: 'Sneezing' },
                  { key: 'breathlessness', label: '😮‍💨 Breathlessness', value: 'Breathlessness' },
                ].map((t) => (
                  <button
                    type="button"
                    key={t.key}
                    onClick={() => {
                      setSymptoms((prev) => {
                        const trimmed = prev ? prev.trim() : '';
                        if (!trimmed) return t.value;
                        const parts = trimmed.split(/,\s*/).map(p => p.trim());
                        if (parts.some(p => p.toLowerCase() === t.value.toLowerCase())) return trimmed;
                        return `${trimmed}, ${t.value}`;
                      });
                    }}
                    disabled={isLoading}
                    className="px-3 py-1 text-sm border rounded-md transition disabled:opacity-50"
                    style={{ backgroundColor: '#F7EFD2', color: '#23408e', borderColor: '#A6CBFF' }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* General Symptoms */}
            <div className="mb-2">
              <p className="text-xs font-semibold mb-1" style={{ color: '#464444' }}>🌡️ General:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'fever', label: '🌡️ Fever', value: 'Fever' },
                  { key: 'headache', label: '🤕 Headache', value: 'Headache' },
                  { key: 'bodyache', label: '💪 Body Ache', value: 'Body Ache' },
                  { key: 'fatigue', label: '😴 Fatigue', value: 'Fatigue' },
                  { key: 'chills', label: '❄️ Chills', value: 'Chills' },
                ].map((t) => (
                  <button
                    type="button"
                    key={t.key}
                    onClick={() => {
                      setSymptoms((prev) => {
                        const trimmed = prev ? prev.trim() : '';
                        if (!trimmed) return t.value;
                        const parts = trimmed.split(/,\s*/).map(p => p.trim());
                        if (parts.some(p => p.toLowerCase() === t.value.toLowerCase())) return trimmed;
                        return `${trimmed}, ${t.value}`;
                      });
                    }}
                    disabled={isLoading}
                    className="px-3 py-1 text-sm border rounded-md transition disabled:opacity-50"
                    style={{ backgroundColor: '#F7EFD2', color: '#23408e', borderColor: '#A6CBFF' }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Digestive Symptoms */}
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: '#464444' }}>🤢 Digestive:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'nausea', label: '🤢 Nausea', value: 'Nausea' },
                  { key: 'vomiting', label: '🤮 Vomiting', value: 'Vomiting' },
                  { key: 'diarrhea', label: '💩 Diarrhea', value: 'Diarrhea' },
                  { key: 'abdominal', label: '😣 Abdominal Pain', value: 'Abdominal Pain' },
                  { key: 'loss', label: '🍽️ Loss of Appetite', value: 'Loss of Appetite' },
                ].map((t) => (
                  <button
                    type="button"
                    key={t.key}
                    onClick={() => {
                      setSymptoms((prev) => {
                        const trimmed = prev ? prev.trim() : '';
                        if (!trimmed) return t.value;
                        const parts = trimmed.split(/,\s*/).map(p => p.trim());
                        if (parts.some(p => p.toLowerCase() === t.value.toLowerCase())) return trimmed;
                        return `${trimmed}, ${t.value}`;
                      });
                    }}
                    disabled={isLoading}
                    className="px-3 py-1 text-sm border rounded-md transition disabled:opacity-50"
                    style={{ backgroundColor: '#F7EFD2', color: '#23408e', borderColor: '#A6CBFF' }}
                  >
                    {t.label}
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

        {/* Duration */}
        <div className="grid grid-cols-3 gap-2">
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

        <div>
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

        {/* Severity */}
        <div>
          <label htmlFor="severity" className="block text-sm font-medium mb-2" style={{ color: '#23408e' }}>
            Symptom Severity
          </label>
          <select
            id="severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:border-transparent text-[#464444]"
            style={{ borderColor: '#A6CBFF' }}
            disabled={isLoading}
          >
            <option value="mild">Mild</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
          </select>
        </div>

        {/* Additional Info */}
        <div>
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

          {/* No file upload in this version */}
        {/* Submit Button */}
          <div>
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
