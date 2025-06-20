import { Box, Typography } from '@mui/material';
import { useMemo } from 'react';

function TextContent({ content, settings, emptyText = 'No content available' }) {
  // Определяем стили на основе настроек
  const textStyles = useMemo(() => ({
    whiteSpace: 'pre-wrap',
    fontFamily: 'inherit',
    lineHeight: 1.6,
    color: settings.color,
    fontSize: settings.size === 'small' ? '14px' : 
             settings.size === 'medium' ? '16px' : '18px',
    fontWeight: settings.bold ? 'bold' : 'normal'
  }), [settings]);

  // Определяем стили контейнера
  const containerStyles = {
    p: 3,
    bgcolor: 'background.paper',
    borderRadius: 1,
    maxHeight: { xs: '70vh', md: '500px' },
    overflow: 'auto',
    boxShadow: 1,
    minHeight: '200px',
    display: 'flex',
    alignItems: !content ? 'center' : 'flex-start',
    justifyContent: !content ? 'center' : 'flex-start',
  };

  return (
    <Box sx={containerStyles}>
      {content ? (
        <Box component="pre" sx={textStyles}>
          {content}
        </Box>
      ) : (
        <Typography variant="body1" color="text.secondary">
          {emptyText}
        </Typography>
      )}
    </Box>
  );
}

export default TextContent;