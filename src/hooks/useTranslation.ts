import { useAppContext } from '../contexts/AppContext';
import en from '../locales/en.json';
import ru from '../locales/ru.json';

type TranslationDict = typeof en;

type Translations = {
  en: TranslationDict;
  ru: TranslationDict;
};

const translations = {
  en,
  ru
};

export default function useTranslation() {
  const { state } = useAppContext();
  
  function t(key: keyof TranslationDict, params: Record<string, string> = {}): string {
    const langTranslations = translations[state.language];
    let translation = langTranslations[key] || key;
    
    // Замена параметров
   Object.keys(params).forEach(param => {
      translation = translation.replace(`{${param}}`, params[param]);
    });
    
    return translation;
  }
  
  return { t, language: state.language };
}