'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supportedLangs } from './i18n';

type LangContextType = {
  lang: string;
  setLang: (l: string) => void;
};

const LangContext = createContext<LangContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Initialize to a stable default on both server and client to avoid
  // hydration mismatches. Read saved language from localStorage on mount
  // (client-only) and then persist changes.
  const [lang, setLangState] = useState<string>('en');

  useEffect(() => {
    try {
      const v = typeof window !== 'undefined' ? localStorage.getItem('chatbot_lang') : null;
      if (v && supportedLangs.includes(v)) setLangState(v);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('chatbot_lang', lang);
    } catch {}
  }, [lang]);

  const setLang = (l: string) => {
    if (!l) return;
    const key = l.split('-')[0];
    setLangState(supportedLangs.includes(key) ? key : 'en');
  };

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
