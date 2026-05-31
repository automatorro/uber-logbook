'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import translations, { Lang, Translations } from './translations';

interface LanguageContextType {
  lang: Lang;
  toggleLanguage: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'ro',
  toggleLanguage: () => {},
  t: translations['ro'],
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('ro');

  useEffect(() => {
    const saved = localStorage.getItem('uber-lang') as Lang | null;
    if (saved === 'ro' || saved === 'en') {
      setLang(saved);
    }
  }, []);

  const toggleLanguage = () => {
    setLang(prev => {
      const next: Lang = prev === 'ro' ? 'en' : 'ro';
      localStorage.setItem('uber-lang', next);
      return next;
    });
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
