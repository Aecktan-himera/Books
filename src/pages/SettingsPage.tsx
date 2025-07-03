import { useState, useCallback, ChangeEvent } from 'react';
import { useAppContext } from '../contexts/AppContext';
import {
  Box, Button, Typography, Dialog, DialogActions, DialogContent,
  DialogTitle, DialogContentText, CircularProgress, TextField, Grid,
  Input, InputLabel, FormHelperText, IconButton, FormControl, FormControlLabel, Radio, RadioGroup,
} from '@mui/material';
import { CloudUpload, Close } from '@mui/icons-material';
import TextSettingsPanel from '../components/TextSettingsPanel';
import useTranslation from '../hooks/useTranslation';
import { Book, BookContent, TextSettings } from '../types';

type NewBookState = {
  id: string;
  title: string;
  author: string;
  year: string;
  isbn: string;
  description: string;
  cover: File | null;
  file: File | null;
  fileType: string;
};

type ErrorsState = {
  [key: string]: string;
};

function SettingsPage() {
  const {
    state,
    toggleTheme,
    resetFavorites,
    loadSampleBooks,
    setDefaultTextSettings,
    addBook,
    setLanguage,
  } = useAppContext();

  const { t } = useTranslation();
  const [openConfirm, setOpenConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openAddBook, setOpenAddBook] = useState(false);

  const [newBook, setNewBook] = useState<NewBookState>({
    id: '',
    title: '',
    author: '',
    year: '',
    isbn: '',
    description: '',
    cover: null,
    file: null,
    fileType: ''
  });

  const [errors, setErrors] = useState<ErrorsState>({});

  // Функции для чтения файлов
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleResetFavorites = useCallback(() => {
    resetFavorites();
    setOpenConfirm(false);
  }, [resetFavorites]);

  const handleSettingChange = useCallback(<K extends keyof TextSettings>(
    setting: K,
    value: TextSettings[K]
  ) => {
    setDefaultTextSettings({
      ...state.defaultTextSettings,
      [setting]: value,
    });
  }, [state.defaultTextSettings, setDefaultTextSettings]);

  const handleLoadSampleBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      await loadSampleBooks();
    } finally {
      setIsLoading(false);
    }
  }, [loadSampleBooks]);

  const handleAddBookInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBook(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  const handleFileUpload = useCallback((
    e: ChangeEvent<HTMLInputElement>,
    type: 'cover' | 'file'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [type]: 'File too large (max 10MB)' }));
      return;
    }

    if (type === 'cover' && !file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, cover: 'Please upload a valid image file' }));
      return;
    }

    if (type === 'file') {
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      if (!['docx', 'txt'].includes(extension)) {
        setErrors(prev => ({ ...prev, file: 'Unsupported file type. Valid types: docx, txt' }));
        return;
      }
      setNewBook(prev => ({ ...prev, file, fileType: extension }));
    } else {
      setNewBook(prev => ({ ...prev, cover: file }));
    }

    setErrors(prev => ({ ...prev, [type]: '' }));
  }, []);

  const validateId = useCallback((id: string): string => {
    return state.books.some(book => book.id === id) ? 'ID must be unique' : '';
  }, [state.books]);

  const handleAddNewBook = useCallback(async () => {
    const newErrors: ErrorsState = {};
    if (!newBook.id) newErrors.id = 'ID is required';
    if (!newBook.title) newErrors.title = 'Title is required';
    if (!newBook.author) newErrors.author = 'Author is required';
    if (!newBook.cover) newErrors.cover = 'Cover image is required';
    if (!newBook.file) newErrors.file = 'Content file is required';

    const idError = validateId(newBook.id);
    if (idError) newErrors.id = idError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      if (!newBook.cover) throw new Error('Cover file is missing');
      if (!newBook.file) throw new Error('Content file is missing');

      const coverData = await readFileAsDataURL(newBook.cover);

      let contentData = '';
      if (newBook.fileType === 'txt') {
        contentData = await readFileAsText(newBook.file);
      } else if (newBook.fileType === 'docx') {
        const mammothModule = await import('mammoth');
        const mammoth = mammothModule.default;
        const arrayBuffer = await readFileAsArrayBuffer(newBook.file);
        const result = await mammoth.extractRawText({ arrayBuffer });
        contentData = result.value;
      }

      const bookToSave: Book = {
        id: newBook.id,
        title: newBook.title,
        author: newBook.author,
        year: parseInt(newBook.year) || new Date().getFullYear(),
        isbn: newBook.isbn || '',
        description: newBook.description || '',
        cover: coverData,
        content: {
          content: contentData,
          type: newBook.fileType as 'txt' | 'docx',
          name: newBook.file.name
        }
      };

      await addBook(bookToSave);

      setNewBook({
        id: '',
        title: '',
        author: '',
        year: '',
        isbn: '',
        description: '',
        cover: null,
        file: null,
        fileType: ''
      });
      setErrors({});
      setOpenAddBook(false);
    } catch (error: any) {
      console.error('Error adding book:', error);
      setErrors(prev => ({ ...prev, form: error.message || 'Failed to add book' }));
    } finally {
      setIsLoading(false);
    }
  }, [addBook, newBook, validateId]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>{t('settings')}</Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>{t('language')}</Typography>
        <FormControl component="fieldset">
          <RadioGroup
            row
            value={state.language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'ru')}
          >
            <FormControlLabel
              value="en"
              control={<Radio />}
              label={t('english')}
            />
            <FormControlLabel
              value="ru"
              control={<Radio />}
              label={t('russian')}
            />
          </RadioGroup>
        </FormControl>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>{t("theme")}</Typography>
        <Button
          variant="contained"
          onClick={toggleTheme}
          sx={{ textTransform: 'none' }}
        >
          {t("switchTheme")}
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>{t("readingSettings")}</Typography>
        <TextSettingsPanel
          settings={state.defaultTextSettings}
          onChange={handleSettingChange}
        />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>{t("dataManagement")}</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setOpenConfirm(true)}
              fullWidth
              sx={{ mb: 2 }}
            >
              {t("resetAllFavorites")}
            </Button>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              onClick={handleLoadSampleBooks}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
              fullWidth
              sx={{ mb: 2 }}
            >
              {isLoading ? 'Loading...' : t("loadSampleBooks")}
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="success"
              onClick={() => setOpenAddBook(true)}
              startIcon={<CloudUpload />}
              fullWidth
            >
              {t("addNewBook")}
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>{t("confirmReset")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("resetConfirmation")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>{t("cancel")}</Button>
          <Button onClick={handleResetFavorites} color="error" variant="contained">
            {t("reset")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openAddBook}
        onClose={() => setOpenAddBook(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            {t("addNewBook")}
            <IconButton onClick={() => setOpenAddBook(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {errors.form && (
            <Typography color="error" sx={{ mb: 2 }}>
              {errors.form}
            </Typography>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t("id")}
                name="id"
                value={newBook.id}
                onChange={handleAddBookInput}
                error={!!errors.id}
                helperText={errors.id}
                margin="normal"
              />

              <TextField
                fullWidth
                label={t("title")}
                name="title"
                value={newBook.title}
                onChange={handleAddBookInput}
                error={!!errors.title}
                helperText={errors.title}
                margin="normal"
              />

              <TextField
                fullWidth
                label={t("author")}
                name="author"
                value={newBook.author}
                onChange={handleAddBookInput}
                error={!!errors.author}
                helperText={errors.author}
                margin="normal"
              />

              <TextField
                fullWidth
                label={t("year")}
                name="year"
                value={newBook.year}
                onChange={handleAddBookInput}
                margin="normal"
              />

              <TextField
                fullWidth
                label="ISBN"
                name="isbn"
                value={newBook.isbn}
                onChange={handleAddBookInput}
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t("description")}
                name="description"
                value={newBook.description}
                onChange={handleAddBookInput}
                multiline
                rows={4}
                margin="normal"
              />

              <FormControl fullWidth margin="normal" error={!!errors.cover}>
                <InputLabel shrink>{t("coverimage")}</InputLabel>
                <Box mt={2}>
                  <Input
                    inputComponent="input" // Добавлено
                    type="file"
                    inputProps={{ accept: "image/*" }} // Исправлено
                    onChange={(e) => handleFileUpload(e as ChangeEvent<HTMLInputElement>, 'cover')}
                    fullWidth
                  />
                </Box>
                {newBook.cover && (
                  <Typography variant="caption">
                    Selected: {newBook.cover.name}
                  </Typography>
                )}
                {errors.cover && (
                  <FormHelperText>{errors.cover}</FormHelperText>
                )}
              </FormControl>

              <FormControl fullWidth margin="normal" error={!!errors.file}>
                <InputLabel shrink>{t("bookcontent")}</InputLabel>
                <Box mt={2}>
                  <Input
                    inputComponent="input"
                    type="file"
                    inputProps={{ accept: ".docx,.txt" }} // Исправлено
                    onChange={(e) => handleFileUpload(e as ChangeEvent<HTMLInputElement>, 'file')}
                    fullWidth
                  />
                </Box>
                {newBook.file && (
                  <Typography variant="caption">
                    Selected: {newBook.file.name} ({newBook.fileType})
                  </Typography>
                )}
                {errors.file && (
                  <FormHelperText>{errors.file}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setOpenAddBook(false)}
            color="secondary"
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleAddNewBook}
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Adding Book...' : t("addBook")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SettingsPage;