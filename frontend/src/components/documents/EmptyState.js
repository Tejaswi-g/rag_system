import React from 'react';
import {
  Box,
  Typography,
  Button,
  useTheme,
  alpha,
} from '@mui/material';
import { motion } from 'framer-motion';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';

const EmptyState = ({ onClickUpload }) => {
  const theme = useTheme();

  const workflowSteps = [
    { icon: <CloudUploadRoundedIcon sx={{ fontSize: 18 }} />, label: 'Upload Documents', desc: 'PDF or TXT files' },
    { icon: <AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />, label: 'AI Extracts Text', desc: 'Smart chunking & embedding' },
    { icon: <HubRoundedIcon sx={{ fontSize: 18 }} />, label: 'Knowledge Graph Built', desc: 'Entities & relationships mapped' },
    { icon: <PsychologyRoundedIcon sx={{ fontSize: 18 }} />, label: 'Ask Intelligent Questions', desc: 'GraphRAG-powered answers' },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: 520,
        px: 4,
        py: 6,
      }}
    >
      {/* Large Illustration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <Box
          sx={{
            position: 'relative',
            width: 280,
            height: 200,
            mb: 4,
          }}
        >
          {/* Glow background */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(theme.palette.info.main, 0.1)} 0%, transparent 70%)`,
            }}
          />

          {/* Central icon */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: 10,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.12)}, ${alpha(theme.palette.info.main, 0.04)})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1.5px solid ${alpha(theme.palette.info.main, 0.2)}`,
                backdropFilter: 'blur(8px)',
              }}
            >
              <PsychologyRoundedIcon
                sx={{ fontSize: 40, color: theme.palette.info.main }}
              />
            </Box>
          </motion.div>

          {/* Floating satellite icons */}
          <motion.div
            animate={{ y: [0, 8, 0], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            style={{ position: 'absolute', bottom: 20, left: 10 }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                bgcolor: alpha(theme.palette.secondary.main, 0.08),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.15)}`,
              }}
            >
              <StorageRoundedIcon sx={{ fontSize: 20, color: theme.palette.secondary.main }} />
            </Box>
          </motion.div>

          <motion.div
            animate={{ y: [0, -6, 0], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            style={{ position: 'absolute', bottom: 10, right: 10 }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                bgcolor: alpha(theme.palette.warning.main, 0.08),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${alpha(theme.palette.warning.main, 0.15)}`,
              }}
            >
              <HubRoundedIcon sx={{ fontSize: 20, color: theme.palette.warning.main }} />
            </Box>
          </motion.div>
        </Box>
      </motion.div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            textAlign: 'center',
            mb: 1,
            background: `linear-gradient(135deg, ${theme.palette.text.primary} 60%, ${theme.palette.info.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: { xs: '1.5rem', sm: '2rem' },
          }}
        >
          Build Your AI Knowledge Repository
        </Typography>
      </motion.div>

      {/* Subtitle */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            textAlign: 'center',
            maxWidth: 480,
            mb: 4,
            lineHeight: 1.7,
            fontSize: 14,
          }}
        >
          Upload documents to create an intelligent knowledge base for{' '}
          <Box
            component="span"
            sx={{ fontWeight: 600, color: theme.palette.info.main }}
          >
            GraphRAG
          </Box>
          . Every document is processed, chunked, embedded, and connected into a
          knowledge graph — ready for AI-powered retrieval.
        </Typography>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          variant="contained"
          color="info"
          size="large"
          onClick={onClickUpload}
          startIcon={<CloudUploadRoundedIcon />}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2.5,
            fontSize: 15,
            fontWeight: 600,
            boxShadow: `0 4px 14px ${alpha(theme.palette.info.main, 0.25)}`,
            '&:hover': {
              boxShadow: `0 6px 20px ${alpha(theme.palette.info.main, 0.35)}`,
            },
          }}
        >
          Upload Your First Document
        </Button>
      </motion.div>

      {/* How it works - GraphRAG workflow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Box
          sx={{
            mt: 5,
            px: 3,
            py: 2.5,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.background.paper, 0.4),
            border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
            maxWidth: 520,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: alpha(theme.palette.text.secondary, 0.7),
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              display: 'block',
              mb: 2,
              textAlign: 'center',
            }}
          >
            How GraphRAG Works
          </Typography>

          <Box sx={{ position: 'relative' }}>
            {/* Vertical connecting line */}
            <Box
              sx={{
                position: 'absolute',
                left: 24,
                top: 8,
                bottom: 8,
                width: 1.5,
                bgcolor: alpha(theme.palette.info.main, 0.15),
              }}
            />

            {workflowSteps.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    mb: i < workflowSteps.length - 1 ? 2 : 0,
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 28,
                      borderRadius: 1.5,
                      bgcolor: alpha(theme.palette.info.main, 0.06),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: theme.palette.info.main,
                      zIndex: 1,
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Box sx={{ pt: 0.25 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, mb: 0.15, fontSize: 13 }}
                    >
                      {step.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: alpha(theme.palette.text.secondary, 0.7), fontSize: 11 }}
                    >
                      {step.desc}
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
};

export default EmptyState;

