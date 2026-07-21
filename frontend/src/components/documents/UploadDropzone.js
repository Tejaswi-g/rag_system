import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';

const UploadDropzone = ({ getRootProps, getInputProps, isDragActive, hasDocuments }) => {
  const theme = useTheme();

  return (
    <AnimatePresence mode="wait">
      {(!hasDocuments || isDragActive) && (
        <motion.div
          key="dropzone"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <Box
            {...getRootProps()}
            sx={{
              mb: 2,
              p: 2.5,
              borderRadius: 2.5,
              border: `2px dashed ${
                isDragActive ? theme.palette.info.main : alpha(theme.palette.divider, 0.8)
              }`,
              bgcolor: isDragActive
                ? alpha(theme.palette.info.main, 0.04)
                : alpha(theme.palette.background.paper, 0.3),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              transition: 'border-color 0.25s, background-color 0.25s',
              '&:hover': {
                borderColor: alpha(theme.palette.info.main, 0.3),
                bgcolor: alpha(theme.palette.info.main, 0.02),
              },
            }}
          >
            {/* Backdrop blur overlay when dragging */}
            <AnimatePresence>
              {isDragActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backdropFilter: 'blur(2px)',
                    background: `radial-gradient(circle at center, ${alpha(
                      theme.palette.info.main,
                      0.06
                    )} 0%, transparent 70%)`,
                    pointerEvents: 'none',
                    zIndex: 0,
                  }}
                />
              )}
            </AnimatePresence>

            {/* Icon with animation */}
            <motion.div
              animate={
                isDragActive
                  ? { scale: [1, 1.1, 1], rotate: [0, -3, 3, 0] }
                  : {}
              }
              transition={{ duration: 0.5 }}
              style={{ position: 'relative', zIndex: 1 }}
            >
              <Avatar
                sx={{
                  bgcolor: isDragActive
                    ? alpha(theme.palette.info.main, 0.15)
                    : alpha(theme.palette.info.main, 0.06),
                  color: isDragActive
                    ? theme.palette.info.main
                    : alpha(theme.palette.text.secondary, 0.6),
                  width: 42,
                  height: 42,
                  transition: 'all 0.25s',
                }}
              >
                {isDragActive ? (
                  <InsertDriveFileRoundedIcon />
                ) : (
                  <CloudUploadRoundedIcon />
                )}
              </Avatar>
            </motion.div>

            {/* Text */}
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: isDragActive
                    ? theme.palette.info.main
                    : theme.palette.text.primary,
                  mb: 0.15,
                  fontSize: 13,
                }}
              >
                {isDragActive
                  ? 'Drop files to add to knowledge base'
                  : 'Drop documents to expand knowledge'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                PDF & TXT · Up to 16MB · Auto-indexed
              </Typography>
            </Box>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UploadDropzone;

