'use client';

import React from 'react';
import { useLang } from '@/lib/langContext';

export default function LanguageSelector() {
  const { lang, setLang } = useLang();

  return (
    <div className="ml-4">
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="px-2 py-1 border rounded"
        aria-label="Select language"
      >
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
        <option value="mr">मराठी</option>
      </select>
    </div>
  );
}
