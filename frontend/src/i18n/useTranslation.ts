import { useLanguageStore } from '../store/languageStore';
import en from './translations/en.json';
import rw from './translations/rw.json';
import fr from './translations/fr.json';

const translations = { en, rw, fr } as const;

function get(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let value: unknown = obj;
  for (const key of keys) {
    value = (value as Record<string, unknown>)?.[key];
    if (value === undefined) return undefined;
  }
  return typeof value === 'string' ? value : undefined;
}

export function useTranslation() {
  const language = useLanguageStore((s) => s.language);
  const t = (path: string): string => {
    const trans = translations[language] as Record<string, unknown>;
    const value = get(trans, path);
    if (value !== undefined) return value;
    return get(translations.en as Record<string, unknown>, path) ?? path;
  };
  return { t, language };
}
