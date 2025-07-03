export type Book = {
  id: string;
  title: string;
  author: string;
  year: number;
  cover?: string;
  isbn?: string;
  description?: string;
  content?: BookContent;
};

export type BookContent = {
  content?: string;
  type: 'txt' | 'docx' | 'doc';
  name: string;
  url?: string;
};

export type Filters = {
  authors: string[];
  yearRange: [number, number];
  onlyFavorites: boolean;
};

export type TextSettings = {
  color: 'black' | 'sepia' | 'darkblue';
  size: 'small' | 'medium' | 'large';
  bold: boolean;
};

export type AppState = {
  theme: 'light' | 'dark';
  language: 'en' | 'ru';
  books: Book[];
  favorites: string[];
  searchQuery: string;
  filters: Filters;
  defaultTextSettings: TextSettings;
};

export type AppAction =
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_BOOKS'; payload: Book[] }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'SET_DEFAULT_TEXT_SETTINGS'; payload: TextSettings }
  | { type: 'SET_LANGUAGE'; payload: 'en' | 'ru' }
  | { type: 'ADD_BOOK_CONTENT'; payload: { id: string; content: BookContent | null } }
  | { type: 'LOAD_SAMPLE_BOOKS' }
  | { type: 'SET_FILTERS'; payload: Partial<Filters> }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'RESET_FILTERS' }
  | { type: 'RESET_FAVORITES' }
  | { type: 'ADD_BOOK'; payload: Book };

export type AppContextType = {
  state: AppState;
  toggleTheme: () => void;
  toggleFavorite: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;
  resetFavorites: () => void;
  loadSampleBooks: () => void;
  addBook: (book: Book) => void;
  addBookContent: (id: string, content: BookContent | null) => void;
  setDefaultTextSettings: (settings: TextSettings) => void;
  setLanguage: (lang: 'en' | 'ru') => void;
};
