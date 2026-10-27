/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * LanguageContext provides state and instant toggle between English (en) and Kannada (kn),
 * with persistence in localStorage.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { translations, TranslationDictionary } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('kmpl_language');
    return (saved === 'kn' || saved === 'en') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kmpl_language', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'kn' : 'en');
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
