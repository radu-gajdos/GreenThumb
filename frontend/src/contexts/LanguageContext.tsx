// src/contexts/LanguageContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { DE, RO, US } from 'country-flag-icons/react/3x2'
import i18n from '@/i18n';

interface Language {
  code: string;
  name: string;
  flag: any;
}

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (code: string) => void;
  languages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const languages: Language[] = [
  { code: 'en', name: 'English', flag: US },
  { code: 'ro', name: 'Română', flag: RO },
  { code: 'de', name: 'Deutsch', flag: DE },
];

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'en';
  });

  const changeLanguage = async (code: string) => {
    try {
      setCurrentLanguage(code);
      localStorage.setItem('language', code);
      await i18n.changeLanguage(code);  // <— aici
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };


  useEffect(() => {
    changeLanguage(currentLanguage);
  }, []);

  const value = {
    currentLanguage,
    changeLanguage,
    languages,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}