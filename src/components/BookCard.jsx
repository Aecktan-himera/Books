import { Card, CardMedia, CardContent, Typography, IconButton, Box, Tooltip } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { useAppContext } from '../contexts/AppContext';
import { Link } from 'react-router-dom';
import useTranslation from '../hooks/useTranslation';

function BookCard({ book }) {
  const { state, toggleFavorite } = useAppContext();
  const { t } = useTranslation();
  const isFavorite = state.favorites.includes(book.id);

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
    }}>
      {/* Измененный компонент CardMedia */}
      <Box sx={{ 
        minHeight: 150,
        maxWidth: 400, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: theme => theme.palette.grey[100]
      }}>
        <img 
          src={book.cover || '/placeholder-book-cover.jpg'} 
          alt={book.title} 
          style={{ 
            maxHeight: '100%',
            maxWidth: '100%',
            objectFit: 'contain'
          }}
        />
      </Box>
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography 
          gutterBottom 
          variant="h6" 
          component={Link} 
          to={`/book/${book.id}`}
          sx={{ 
            textDecoration: 'none', 
            color: 'inherit',
            display: 'block',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          {book.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {book.author} ({book.year})
        </Typography>
      </CardContent>
      <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <Tooltip 
          title={isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
        ></Tooltip>
        <IconButton 
          onClick={() => toggleFavorite(book.id)}
          aria-label={isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
          color={isFavorite ? "error" : "default"}
        >
          {isFavorite ? <Favorite /> : <FavoriteBorder />}
        </IconButton>
      </Box>
    </Card>
  );
}

export default BookCard;