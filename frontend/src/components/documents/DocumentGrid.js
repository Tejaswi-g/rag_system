import React from 'react';
import {
  Box,
  Grid,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

import DocumentCard from './DocumentCard';

const DocumentGrid = ({
  documents,
  viewMode,
  selectedDoc,
  onSelect,
  onRemoveUpload,
  isLoading,
}) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: `2px solid ${alpha(theme.palette.divider, 0.5)}`,
                borderTopColor: theme.palette.info.main,
                mx: 'auto',
                mb: 2,
              }}
            />
          </motion.div>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
            Loading knowledge repository...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (documents.length === 0) return null;

  // Grid view (default)
  return (
    <Grid container spacing={1.5}>
      <AnimatePresence mode="popLayout">
        {documents.map((doc) => (
          <Grid item xs={12} sm={6} lg={4} xl={3} key={doc.id || doc.filename}>
            <DocumentCard
              doc={doc}
              isSelected={selectedDoc?.filename === doc.filename}
              onSelect={onSelect}
              onRemoveUpload={onRemoveUpload}
            />
          </Grid>
        ))}
      </AnimatePresence>
    </Grid>
  );
};

export default DocumentGrid;

