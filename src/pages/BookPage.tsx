import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { 
  Box, Button, Typography, Dialog, DialogActions, DialogContent,
  DialogTitle, DialogContentText, CircularProgress, Chip, TextField
} from '@mui/material';
import { 
  ArrowBack, Favorite, FavoriteBorder,
  Description, TextFields, InsertDriveFile
} from '@mui/icons-material';
import TextSettingsPanel from '../components/TextSettingsPanel';
import TextContent from '../components/TextContent';
import useTranslation from '../hooks/useTranslation';
import { Book, TextSettings } from '../types';

declare let mammoth: any;

const loadTextContent = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to load text');
  return await response.text();
};

const readFileAsText = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (e) => resolve(e.target?.result as string);
  reader.onerror = reject;
  reader.readAsText(file);
});

const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
  reader.onerror = reject;
  reader.readAsArrayBuffer(file);
});

function BookPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, toggleFavorite, addBookContent } = useAppContext();
  const { t } = useTranslation();
  
  const [textSettings, setTextSettings] = useState<TextSettings>(state.defaultTextSettings);
  const [openAddContent, setOpenAddContent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileContent, setFileContent] = useState<string>('');

  const book = state.books.find(b => b.id === id);
  const isFavorite = book && state.favorites.includes(id!);

  useEffect(() => {
    setTextSettings(state.defaultTextSettings);
  }, [state.defaultTextSettings]);

  const loadContent = useCallback(async (): Promise<string> => {
    if (!book?.content) return '';
    
    try {
      if (book.content.content) return book.content.content;
      if (book.content.type === 'txt' && book.content.url) {
        return await loadTextContent(book.content.url);
      }
      return 'No content available';
    } catch (error: any) {
      return `Error: ${error.message}`;
    }
  }, [book]);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setFileContent(await loadContent());
      setLoading(false);
    };
    
    if (book) {
      fetchContent();
    }
  }, [book, loadContent]);

  const handleTextSettingChange = useCallback(<K extends keyof TextSettings>(
    setting: K, 
    value: TextSettings[K]
  ) => {
    setTextSettings(prev => ({ ...prev, [setting]: value }));
  }, []);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    setLoading(true);
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    try {
      let contentData: any = {
        name: file.name,
        type: extension,
        size: file.size
      };

      if (extension === 'txt') {
        contentData.content = await readFileAsText(file);
        setFileContent(contentData.content);
      } else if (['docx', 'doc'].includes(extension)) {
        if (!mammoth) throw new Error('DOCX processor not loaded');
        const result = await mammoth.extractRawText({ 
          arrayBuffer: await readFileAsArrayBuffer(file) 
        });
        contentData.content = result.value;
        setFileContent(result.value);
      } else {
        throw new Error('Unsupported file format');
      }

      addBookContent(id, contentData);
    } catch (error: any) {
      console.error("Error processing file:", error);
      setFileContent(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setOpenAddContent(false);
    }
  }, [addBookContent, id]);

  if (!book || !id) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ my: 4 }}>Book not found</Typography>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate(-1)}
          variant="contained"
        >
          {t("backToList")}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        {t("backToList")}
      </Button>
      
      <Box sx={{ display: 'flex', gap: 4, mb: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ width: { xs: '100%', md: 600 }, maxWidth: '100%', alignSelf: 'center' }}>
          <img 
            src={book.cover || '/placeholder-book-cover.jpg'} 
            alt={book.title} 
            style={{ width: '100%', borderRadius: 4 }}
          />
        </Box>
        
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>{book.title}</Typography>
          <Typography variant="h5" sx={{ mb: 2, color: 'text.secondary' }}>{book.author}</Typography>
          <Typography sx={{ mb: 1 }}><strong>{t("year")}:</strong> {book.year}</Typography>
          <Typography sx={{ mb: 1 }}><strong>ISBN:</strong> {book.isbn || 'N/A'}</Typography>
          <Typography sx={{ mb: 3 }}>{book.description}</Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Button 
              variant="contained" 
              startIcon={isFavorite ? <Favorite /> : <FavoriteBorder />}
              onClick={() => toggleFavorite(book.id!)}
              color={isFavorite ? 'error' : 'primary'}
            >
              {isFavorite ? t("removeFromFavorites") : t("addToFavorites")}
            </Button>
            
            <Button 
              variant="outlined"
              onClick={() => setOpenAddContent(true)}
              startIcon={
                book.content?.type === 'docx' || book.content?.type === 'doc' ? <Description /> :
                book.content?.type === 'txt' ? <TextFields /> :
                <InsertDriveFile />
              }
            >
              {book.content ? t("changeContent") : t("addContent")}
            </Button>
            
            {book.content && (
              <Chip 
                label={book.content.name} 
                onDelete={() => addBookContent(id, null)}
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        </Box>
      </Box>
      
      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="h5" gutterBottom>{t("readingSettings")}</Typography>
        <TextSettingsPanel 
          settings={textSettings}
          onChange={handleTextSettingChange}
        />
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '500px' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading content...</Typography>
        </Box>
      ) : (
        <TextContent 
          content={fileContent} 
          settings={textSettings} 
          emptyText="No content available"
        />
      )}
      
      <Dialog open={openAddContent} onClose={() => setOpenAddContent(false)}>
        <DialogTitle>{t("uploadContent")}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t("supportedFormats")}
          </DialogContentText>
          <TextField
            type="file"
            inputProps={{ accept: '.docx,.txt', multiple: false }}
            onChange={handleFileUpload}
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddContent(false)}>{t("cancel")}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default BookPage;