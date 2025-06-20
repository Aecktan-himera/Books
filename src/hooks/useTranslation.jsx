import { useAppContext } from '../contexts/AppContext';
import en from '../locales/en.json';
import ru from '../locales/ru.json';

const translations = {
  en,
  ru
};

export default function useTranslation() {
  const { state } = useAppContext();
  
  function t(key, params = {}) {
    let translation = translations[state.language][key] || key;
    
    // Замена параметров
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{${param}}`, params[param]);
    });
    
    return translation;
  }
  
  return { t, language: state.language };
}