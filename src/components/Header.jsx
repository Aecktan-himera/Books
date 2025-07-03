import { useMemo, useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { AppBar, Toolbar, Typography, IconButton, Badge, Box, Menu, MenuItem } from '@mui/material';
import { Favorite, LightMode, DarkMode, Settings, Language } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import useTranslation from '../hooks/useTranslation';

function Header() {
  const { state, toggleTheme, setLanguage } = useAppContext();
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const favoritesCount = useMemo(() => (
    state.books.reduce((count, book) => 
      state.favorites.includes(book.id) ? count + 1 : count, 0)
  ), [state.books, state.favorites]);
const handleLanguageMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    handleLanguageMenuClose();
  };
  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.main' }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/" 
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            color: 'inherit',
            fontWeight: 700,
            letterSpacing: 1,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {t('appTitle')}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
<IconButton 
            onClick={handleLanguageMenuOpen}
            color="inherit"
            aria-label="Change language"
          >
            <Language />
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleLanguageMenuClose}
          >
            <MenuItem onClick={() => handleLanguageChange('en')} id="lang-en">
              {t('english')} {state.language === 'en' && '✓'}
            </MenuItem>
            <MenuItem onClick={() => handleLanguageChange('ru')} id="lang-ru">
              {t('russian')} {state.language === 'ru' && '✓'}
            </MenuItem>
          </Menu>

          <IconButton 
            component={Link} 
            to="/favorites" 
            color="inherit"
            aria-label="Favorite books"
            size="large"
          >
            <Badge 
              badgeContent={favoritesCount}
              color="secondary"
              max={99}
              showZero
            >
              <Favorite fontSize="medium" />
            </Badge>
          </IconButton>
          
          <IconButton 
            color="inherit" 
            aria-label="Toggle theme"
            onClick={toggleTheme}
            size="large"
          >
            {state.theme === 'light' ? <DarkMode fontSize="medium" /> : <LightMode fontSize="medium" />}
          </IconButton>
          
          <IconButton 
            component={Link}
            to="/settings"
            color="inherit"
            aria-label="Settings"
            size="large"
          >
            <Settings fontSize="medium" />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;