import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { AppProvider, useAppContext } from './contexts/AppContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import BookPage from './pages/BookPage';
import SettingsPage from './pages/SettingsPage';
import FavoritesPage from './pages/FavoritesPage';
import { 
  CssBaseline, 
  ThemeProvider, 
  createTheme, 
  Typography, 
  Button, 
  useTheme,
  Theme
} from '@mui/material';
import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';

// Компонент для страницы 404
function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <Typography variant="h4">Page Not Found</Typography>
      <Button 
        variant="contained" 
        component={RouterLink} 
        to="/" 
        sx={{ mt: 3 }}
      >
        Go to Home
      </Button>
    </div>
  );
}

// Компонент общего макета
function Layout() {
  const theme = useTheme();
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flexGrow: 1, padding: '16px' }}>
        <Outlet />
      </main>
      <footer style={{ 
        padding: '16px', 
        textAlign: 'center', 
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="body2" color="text.secondary">
          Book Collection App © {new Date().getFullYear()}
        </Typography>
      </footer>
    </div>
  );
}

// Конфигурация маршрутов
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/book/:id", element: <BookPage /> },
      { path: "/settings", element: <SettingsPage /> },
      { path: "/favorites", element: <FavoritesPage /> },
      { path: "*", element: <NotFound /> }
    ]
  }
], {
  // Удален future.v7_startTransition так как он устарел
});

function App() {
  return (
    <AppProvider>
      <ThemeContent />
    </AppProvider>
  );
}

function ThemeContent() {
  const { state } = useAppContext();
  
  const theme = useMemo(() => createTheme({
    palette: {
      mode: state.theme,
      primary: { 
        main: state.theme === 'light' ? '#1976d2' : '#90caf9',
        contrastText: '#fff'
      },
      secondary: { 
        main: state.theme === 'light' ? '#dc004e' : '#f48fb1',
        contrastText: '#fff'
      },
      background: {
        default: state.theme === 'light' ? '#f5f7fa' : '#121212',
        paper: state.theme === 'light' ? '#ffffff' : '#1e1e1e'
      },
      text: {
        primary: state.theme === 'light' ? '#2d3748' : '#e2e8f0',
        secondary: state.theme === 'light' ? '#718096' : '#a0aec0'
      }
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
      h1: { fontWeight: 700, fontSize: '2.5rem' },
      h2: { fontWeight: 600, fontSize: '2rem' },
      h3: { fontWeight: 600, fontSize: '1.75rem' },
      h4: { fontWeight: 600, fontSize: '1.5rem' },
      h5: { fontWeight: 600, fontSize: '1.25rem' },
      h6: { fontWeight: 600, fontSize: '1rem' },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            letterSpacing: '0.5px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: (theme: Theme) => theme.shadows[6] // Добавлен тип Theme
            },
          },
        },
      },
    },
  }), [state.theme]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;