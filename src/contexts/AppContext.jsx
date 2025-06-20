import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { sampleBooks } from '../data/sampleBooks';

// Объявляем контекст здесь, до его использования
const AppContext = createContext();

// Инициализация состояния из localStorage
const loadInitialState = () => ({
  theme: localStorage.getItem('theme') || 'light',
  language: localStorage.getItem('language') || 'en',
  books: JSON.parse(localStorage.getItem('books')) || [],
  favorites: JSON.parse(localStorage.getItem('favorites')) || [],
  searchQuery: '',
  filters: {
    authors: [],
    yearRange: [1900, 2023],
    onlyFavorites: false,
  },
  defaultTextSettings: JSON.parse(localStorage.getItem('defaultTextSettings')) || {
    color: 'black',
    size: 'medium',
    bold: false,
  },
});

function appReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_THEME':
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return { ...state, theme: newTheme };
    
    case 'SET_BOOKS':
      localStorage.setItem('books', JSON.stringify(action.payload));
      return { ...state, books: action.payload };
    
    case 'TOGGLE_FAVORITE':
      const newFavorites = state.favorites.includes(action.payload)
        ? state.favorites.filter(id => id !== action.payload)
        : [...state.favorites, action.payload];
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      return { ...state, favorites: newFavorites };
    
    case 'SET_DEFAULT_TEXT_SETTINGS':
      localStorage.setItem('defaultTextSettings', JSON.stringify(action.payload));
      return { ...state, defaultTextSettings: action.payload };
    
case 'SET_LANGUAGE':
      localStorage.setItem('language', action.payload);
      return { ...state, language: action.payload };

    case 'ADD_BOOK_CONTENT':
      const updatedBooks = state.books.map(book => 
        book.id === action.payload.id 
          ? { ...book, content: action.payload.content } 
          : book
      );
      localStorage.setItem('books', JSON.stringify(updatedBooks));
      return { ...state, books: updatedBooks };
    
    case 'LOAD_SAMPLE_BOOKS':
      const sampleWithContent = sampleBooks.map(book => ({
        ...book,
        cover: book.cover || '/placeholder-book-cover.jpg',
        content: book.textContentUrl ? { 
          type: 'txt', 
          url: book.textContentUrl,
          name: `${book.title}.txt`
        } : null
      }));
      localStorage.setItem('books', JSON.stringify(sampleWithContent));
      return { ...state, books: sampleWithContent };
    
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'RESET_FILTERS':
      return { ...state, filters: loadInitialState().filters };
    
    case 'RESET_FAVORITES':
      localStorage.removeItem('favorites');
      return { ...state, favorites: [] };
    
    case 'ADD_BOOK':
      const newBooks = [...state.books, action.payload];
      localStorage.setItem('books', JSON.stringify(newBooks));
      return { ...state, books: newBooks };
    
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, undefined, loadInitialState);

  // Мемоизированные колбэки
  const loadSampleBooks = useCallback(() => dispatch({ type: 'LOAD_SAMPLE_BOOKS' }), []);
  const toggleTheme = useCallback(() => dispatch({ type: 'TOGGLE_THEME' }), []);
  const toggleFavorite = useCallback((id) => dispatch({ type: 'TOGGLE_FAVORITE', payload: id }), []);
  const setSearchQuery = useCallback((query) => dispatch({ type: 'SET_SEARCH_QUERY', payload: query }), []);
  const setFilters = useCallback((filters) => dispatch({ type: 'SET_FILTERS', payload: filters }), []);
  const resetFilters = useCallback(() => dispatch({ type: 'RESET_FILTERS' }), []);
  const resetFavorites = useCallback(() => dispatch({ type: 'RESET_FAVORITES' }), []);
  const addBook = useCallback((book) => dispatch({ type: 'ADD_BOOK', payload: book }), []);
  const setLanguage = useCallback((lang) => {
    dispatch({ type: 'SET_LANGUAGE', payload: lang });
  }, []);
  const addBookContent = useCallback((id, content) => {
    dispatch({ type: 'ADD_BOOK_CONTENT', payload: { id, content } });
  }, []);
  const setDefaultTextSettings = useCallback((settings) => {
    dispatch({ type: 'SET_DEFAULT_TEXT_SETTINGS', payload: settings });
  }, []);

  // Загрузка sample books при первом рендере если нет книг
  useEffect(() => {
    if (state.books.length === 0) {
      loadSampleBooks();
    }
  }, [loadSampleBooks, state.books.length]);

  // Мемоизированное значение контекста
  const value = useMemo(() => ({
    state,
    toggleTheme,
    toggleFavorite,
    setSearchQuery,
    setFilters,
    resetFilters,
    resetFavorites,
    loadSampleBooks,
    addBook,
    addBookContent,
    setDefaultTextSettings,
    setLanguage
  }), [
    state,
    toggleTheme,
    toggleFavorite,
    setSearchQuery,
    setFilters,
    resetFilters,
    resetFavorites,
    loadSampleBooks,
    addBook,
    addBookContent,
    setDefaultTextSettings
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};