import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'rw' | 'fr';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    { name: 'language-storage' }
  )
);

export const languageLabels: Record<Language, string> = {
  en: 'English',
  rw: 'Kinyarwanda',
  fr: 'Français',
};
