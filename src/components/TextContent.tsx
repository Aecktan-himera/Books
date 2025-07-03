import { Box, Typography } from '@mui/material';
import { useMemo } from 'react';
import { TextSettings } from '../types';

interface TextContentProps {
  content?: string | null;
  settings: TextSettings;
  emptyText?: string;
}

function TextContent({ content, settings, emptyText = 'No content available' }: TextContentProps) {
  const textStyles = useMemo(() => ({
    whiteSpace: 'pre-wrap' as const,
    fontFamily: 'inherit',
    lineHeight: 1.6,
    color: settings.color,
    fontSize: settings.size === 'small' ? '14px' : 
             settings.size === 'medium' ? '16px' : '18px',
    fontWeight: settings.bold ? 'bold' : 'normal'
  }), [settings]);

  const containerStyles = {
    p: 3,
    bgcolor: 'background.paper',
    borderRadius: 1,
    maxHeight: { xs: '70vh', md: '500px' },
    overflow: 'auto',
    boxShadow: 1,
    minHeight: '200px',
    display: 'flex',
    alignItems: content ? 'flex-start' : 'center',
    justifyContent: content ? 'flex-start' : 'center',
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