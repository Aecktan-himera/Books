import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import BookCard from '../components/BookCard';
import {
  Grid, Box, Slider, Checkbox, FormControlLabel,
  Select, MenuItem, Button, Typography
} from '@mui/material';
import useTranslation from '../hooks/useTranslation';
import { Book, Filters } from '../types';

function HomePage() {
  const { t } = useTranslation();
  const { state, setFilters, resetFilters } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [localFilters, setLocalFilters] = useState<Filters>({
    authors: [],
    yearRange: [1900, 2023],
    onlyFavorites: false,
  });

  // Refs to track update sources
  const isSettingFiltersFromURL = useRef(false);
  const isSettingURLFromFilters = useRef(false);

  const allAuthors = useMemo(() => (
    [...new Set(state.books.map(book => book.author))]
  ), [state.books]);

  const filteredBooks = useMemo(() => {
    const query = state.searchQuery.toLowerCase();
    const { authors, yearRange, onlyFavorites } = state.filters;
    const favoritesSet = new Set(state.favorites);

    return state.books.filter(book => {
      const matchesSearch = !query || 
        book.title.toLowerCase().includes(query) || 
        book.author.toLowerCase().includes(query);
      
      const matchesAuthors = authors.length === 0 || authors.includes(book.author);
      const matchesYear = book.year >= yearRange[0] && book.year <= yearRange[1];
      const matchesFavorites = !onlyFavorites || favoritesSet.has(book.id);
      
      return matchesSearch && matchesAuthors && matchesYear && matchesFavorites;
    });
  }, [state]);

  // Sync state.filters to URL
  useEffect(() => {
    if (isSettingFiltersFromURL.current) {
      isSettingFiltersFromURL.current = false;
      return;
    }

    const params = new URLSearchParams();
    state.filters.authors.forEach(author => params.append('authors', author));
    
    if (state.filters.yearRange[0] !== 1900) params.set('yearMin', state.filters.yearRange[0].toString());
    if (state.filters.yearRange[1] !== 2023) params.set('yearMax', state.filters.yearRange[1].toString());
    if (state.filters.onlyFavorites) params.set('favorites', 'true');
    
    // Only update URL if it's different
    if (params.toString() !== searchParams.toString()) {
      isSettingURLFromFilters.current = true;
      setSearchParams(params);
    }
  }, [state.filters, setSearchParams, searchParams]);

  // Sync URL to state.filters
  useEffect(() => {
    if (isSettingURLFromFilters.current) {
      isSettingURLFromFilters.current = false;
      return;
    }

    const yearMin = parseInt(searchParams.get('yearMin') || '1900');
    const yearMax = parseInt(searchParams.get('yearMax') || '2023');
    
    const initialFilters: Filters = {
      authors: searchParams.getAll('authors') || [],
      yearRange: [yearMin, yearMax],
      onlyFavorites: searchParams.get('favorites') === 'true',
    };

    isSettingFiltersFromURL.current = true;
    setLocalFilters(initialFilters);
    setFilters(initialFilters);
  }, [setFilters, searchParams]);

  const handleFilterChange = (name: keyof Filters, value: any) => {
    const newFilters = { ...localFilters, [name]: value };
    setLocalFilters(newFilters);
    setFilters(newFilters);
  };

  const handleReset = () => {
    resetFilters();
  };

  return (
    <Box sx={{ display: 'flex', p: 2, flexDirection: { xs: 'column', md: 'row' } }}>
      <Box sx={{ 
        width: { xs: '100%', md: 250 }, 
        mr: { xs: 0, md: 3 },
        mb: { xs: 3, md: 0 },
        flexShrink: 0 
      }}>
        <Typography variant="h6" gutterBottom>{t('filters')}</Typography>

        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>{t('authors')}</Typography>
          <Select<string[]>
            multiple
            value={localFilters.authors}
            onChange={(e) => handleFilterChange('authors', e.target.value)}
            sx={{ width: '100%' }}
            renderValue={(selected) => selected.join(', ')}
          >
            {allAuthors.map((author) => (
              <MenuItem key={author} value={author}>
                <Checkbox checked={localFilters.authors.includes(author)} />
                {author}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>
            {t('year')}: {localFilters.yearRange[0]} - {localFilters.yearRange[1]}
          </Typography>
          <Slider
            value={localFilters.yearRange}
            onChange={(_, newValue) => handleFilterChange('yearRange', newValue as [number, number])}
            min={1900}
            max={2023}
            valueLabelDisplay="auto"
          />
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={localFilters.onlyFavorites}
              onChange={(e) => handleFilterChange('onlyFavorites', e.target.checked)}
            />
          }
          label={t('onlyFavorites')}
        />

        <Button 
          variant="outlined" 
          onClick={handleReset} 
          sx={{ mt: 2 }}
          fullWidth
        >
          {t('resetFilters')}
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h5" gutterBottom>
          {t('booksFound')} {filteredBooks.length}  
        </Typography>

        {filteredBooks.length === 0 ? (
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            {t('noBooksMatch')}
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredBooks.map((book: Book) => (
              <Grid item key={book.id} xs={12} sm={6} md={4} lg={3}>
                <BookCard book={book} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}

export default HomePage;