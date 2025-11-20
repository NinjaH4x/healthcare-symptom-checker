"use client";

import { useState } from 'react';
import FormInput from './FormInput';

interface Profile {
  name: string;
  age: string;
  sex: string;
  height: string;
  weight: string;
}

interface Props {
  userId: string;
  onSaved: (profile: Profile) => void;
}

export default function PatientDetailsForm({ userId, onSaved }: Props) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [error, setError] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate required fields
    if (!name.trim() || !age.trim()) {
      setError('Please provide at least name and age');
      return;
    }

    // Validate age
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      setError('Age must be between 0 and 150 years');
      return;
    }

    // Validate height if provided
    if (height.trim()) {
      const heightNum = parseFloat(height);
      if (isNaN(heightNum) || heightNum < 50 || heightNum > 250) {
        setError('Height must be between 50cm and 250cm');
        return;
      }
    }

    // Validate weight if provided
    if (weight.trim()) {
      const weightNum = parseFloat(weight);
      if (isNaN(weightNum) || weightNum < 2 || weightNum > 300) {
        setError('Weight must be between 2kg and 300kg');
        return;
      }
    }

    const profile = { name: name.trim(), age: age.trim(), sex: sex.trim(), height: height.trim(), weight: weight.trim() };
    try {
      localStorage.setItem(`patient_profile_${userId}`, JSON.stringify(profile));
      onSaved(profile);
    } catch (err) {
      console.error('Failed to save profile', err);
      setError('Failed to save profile locally');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-3" style={{ color: '#23408e' }}>Patient Details</h3>
      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className="text-sm font-medium block mb-1" style={{ color: '#23408e' }}>Full name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border-2 rounded text-black" style={{ borderColor: '#A6CBFF', backgroundColor: '#F0F6FF' }} placeholder="e.g., John Doe" />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <FormInput id="age" label="Age" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g., 34" inputClassName="text-black" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1" style={{ color: '#23408e' }}>Sex</label>
            <select value={sex} onChange={(e) => setSex(e.target.value)} className="w-full px-3 py-2 border-2 rounded text-black" style={{ borderColor: '#A6CBFF', backgroundColor: '#F0F6FF' }}>
              <option value="">Select</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
              <option value="prefer_not">Prefer not to say</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1" style={{ color: '#23408e' }}>Height (cm)</label>
            <input value={height} onChange={(e) => setHeight(e.target.value)} className="w-full px-3 py-2 border-2 rounded text-black" style={{ borderColor: '#A6CBFF', backgroundColor: '#F0F6FF' }} placeholder="e.g., 170" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1" style={{ color: '#23408e' }}>Weight (kg)</label>
          <input value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full px-3 py-2 border-2 rounded text-black" style={{ borderColor: '#A6CBFF', backgroundColor: '#F0F6FF' }} placeholder="e.g., 68" />
        </div>

        {error && <div className="text-sm text-white rounded-lg p-3" style={{ backgroundColor: '#E30D34' }}>{error}</div>}

        <div className="flex gap-2">
          <button type="submit" className="px-3 py-2 bg-[#A6CBFF] rounded font-semibold text-[#23408e]">Save Profile</button>
        </div>
      </form>
    </div>
  );
}
