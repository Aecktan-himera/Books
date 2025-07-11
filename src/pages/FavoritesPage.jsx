import { useAppContext } from '../contexts/AppContext';
import { Grid, Box, Typography } from '@mui/material';
import BookCard from '../components/BookCard';
import useTranslation from '../hooks/useTranslation';

function FavoritesPage() {
  const { state } = useAppContext();
  const { t } = useTranslation();

  // Фильтруем ТОЛЬКО существующие книги
  const favoriteBooks = state.books.filter(book => 
    state.favorites.includes(book.id)
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t("favorites")} ({favoriteBooks.length}) {/* Используем реальное количество */}
      </Typography>
      
      {favoriteBooks.length === 0 ? (
        <Typography>{t("noFavoritesYet")}</Typography>
      ) : (
        <Grid container spacing={3}>
          {favoriteBooks.map(book => (
            <Grid item key={book.id} xs={12} sm={6} md={4} lg={3}>
              <BookCard book={book} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default FavoritesPage;