import React from 'react';
import {
  Box,
  Typography,
  Card,
  Divider,
  Chip,
  Avatar,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import TextSnippetRoundedIcon from '@mui/icons-material/TextSnippetRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';

import KnowledgePipeline from './KnowledgePipeline';

const getFileIcon = (filename, theme) => {
  if (!filename) return <DescriptionRoundedIcon />;
  if (filename.toLowerCase().endsWith('.pdf'))
    return <PictureAsPdfRoundedIcon sx={{ color: theme.palette.error.main }} />;
  if (filename.toLowerCase().endsWith('.txt'))
    return <TextSnippetRoundedIcon sx={{ color: theme.palette.info.main }} />;
  return <DescriptionRoundedIcon sx={{ color: theme.palette.text.secondary }} />;
};

const InfoRow = ({ icon, label, value, delay = 0 }) => {
  const rowTheme = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.25, ease: 'easeOut' }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          py: 0.75,
          px: 2,
          borderRadius: 1.5,
          '&:hover': { bgcolor: alpha(rowTheme.palette.action.hover, 0.3) },
        }}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1.25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(rowTheme.palette.text.secondary, 0.06),
            color: alpha(rowTheme.palette.text.secondary, 0.6),
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.1, fontSize: 10 }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: 13 }}>
            {value}
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
};

const SectionBlock = ({ label, children, icon }) => {
  const theme = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ px: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: 0.75,
              bgcolor: alpha(theme.palette.info.main, 0.08),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.palette.info.main,
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: alpha(theme.palette.text.secondary, 0.7),
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontSize: 10,
            }}
          >
            {label}
          </Typography>
        </Box>
        {children}
      </Box>
      <Divider sx={{ mx: 2, mb: 2, borderColor: alpha(theme.palette.divider, 0.5) }} />
    </motion.div>
  );
};

const InspectorPanel = ({ selectedDoc, onClose, darkMode }) => {
  const theme = useTheme();
  const result = selectedDoc?.result || {};

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const hasDocumentInfo = selectedDoc?.filename || selectedDoc?.size_mb || selectedDoc?.uploaded_at;
  const hasProcessingInfo = result?.chunks !== undefined || result?.text_length !== undefined || result?.processing_time_seconds !== undefined;
  const hasExtractionInfo = result?.entities_found !== undefined || result?.relationships_found !== undefined;
  const hasAnyInfo = hasDocumentInfo || hasProcessingInfo || hasExtractionInfo;

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 32 }}
      transition={{ type: 'spring', stiffness: 250, damping: 26 }}
      sx={{
        width: 300,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        borderRadius: 2.5,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: 'none',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HubRoundedIcon sx={{ fontSize: 16, color: theme.palette.info.main }} />
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>
            Document Intelligence
          </Typography>
        </Box>
        {onClose && (
          <IconButton size="small" onClick={onClose} sx={{ color: alpha(theme.palette.text.disabled, 0.6) }}>
            <CloseRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 2 }}>
        {!selectedDoc || !hasAnyInfo ? (
          <Box sx={{ textAlign: 'center', mt: 6, px: 2.5, opacity: 0.6 }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  bgcolor: alpha(theme.palette.info.main, 0.06),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 1.5,
                }}
              >
                <HubRoundedIcon sx={{ fontSize: 24, color: alpha(theme.palette.info.main, 0.35) }} />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: 13 }}>
                No Document Selected
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                Select a document to view its intelligence metadata and AI processing pipeline.
              </Typography>
            </motion.div>
          </Box>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDoc.filename || 'doc'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* Document Preview */}
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <Box sx={{ textAlign: 'center', mb: 2, px: 2 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: alpha(theme.palette.info.main, 0.06),
                      mx: 'auto',
                      mb: 1,
                    }}
                  >
                    {getFileIcon(selectedDoc.filename, theme)}
                  </Avatar>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      wordBreak: 'break-all',
                      mb: 0.5,
                      lineHeight: 1.3,
                      fontSize: 13,
                    }}
                  >
                    {selectedDoc.filename}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                    {selectedDoc.size_mb && (
                      <Chip size="small" label={`${selectedDoc.size_mb} MB`} sx={{ height: 18, fontSize: 9, fontWeight: 500 }} />
                    )}
                    {selectedDoc.uploaded_at && (
                      <Chip size="small" label={formatDate(selectedDoc.uploaded_at)} sx={{ height: 18, fontSize: 9, fontWeight: 500 }} />
                    )}
                    {result?.document_id && (
                      <Chip size="small" label={`ID: ${result.document_id.slice(0, 8)}`} variant="outlined" sx={{ height: 18, fontSize: 9 }} />
                    )}
                  </Box>
                </Box>
              </motion.div>

              {/* Pipeline */}
              <Box sx={{ px: 2, mb: 1 }}>
                <KnowledgePipeline documentResult={result} />
              </Box>

              <Divider sx={{ mx: 2, mb: 2, borderColor: alpha(theme.palette.divider, 0.5) }} />

              {/* Document Information */}
              {hasDocumentInfo && (
                <SectionBlock label="Document Information" icon={<DescriptionRoundedIcon sx={{ fontSize: 13 }} />}>
                  {selectedDoc.filename && (
                    <InfoRow icon={<DescriptionRoundedIcon sx={{ fontSize: 14 }} />} label="File Name" value={selectedDoc.filename} delay={0.1} />
                  )}
                  {selectedDoc.filename && (
                    <InfoRow
                      icon={<TextSnippetRoundedIcon sx={{ fontSize: 14 }} />}
                      label="File Type"
                      value={selectedDoc.filename?.toLowerCase().endsWith('.pdf') ? 'PDF Document' : selectedDoc.filename?.toLowerCase().endsWith('.txt') ? 'Text File' : 'Unknown'}
                      delay={0.15}
                    />
                  )}
                  {selectedDoc.uploaded_at && (
                    <InfoRow icon={<CalendarTodayRoundedIcon sx={{ fontSize: 14 }} />} label="Upload Date" value={formatDate(selectedDoc.uploaded_at)} delay={0.2} />
                  )}
                  {selectedDoc.size_mb && (
                    <InfoRow icon={<StorageRoundedIcon sx={{ fontSize: 14 }} />} label="File Size" value={`${selectedDoc.size_mb} MB`} delay={0.25} />
                  )}
                </SectionBlock>
              )}

              {/* AI Processing */}
              {hasProcessingInfo && (
                <SectionBlock label="AI Processing" icon={<MemoryRoundedIcon sx={{ fontSize: 13 }} />}>
                  {result?.chunks !== undefined && (
                    <InfoRow icon={<ContentCutRoundedIcon sx={{ fontSize: 14 }} />} label="Chunks Created" value={`${result.chunks} chunks`} delay={0.1} />
                  )}
                  {result?.text_length !== undefined && (
                    <InfoRow icon={<TextSnippetOutlinedIcon sx={{ fontSize: 14 }} />} label="Text Length" value={`${result.text_length.toLocaleString()} chars`} delay={0.15} />
                  )}
                  {result?.processing_time_seconds !== undefined && (
                    <InfoRow icon={<AccessTimeRoundedIcon sx={{ fontSize: 14 }} />} label="Processing Time" value={`${result.processing_time_seconds}s`} delay={0.2} />
                  )}
                  {hasProcessingInfo && (
                    <InfoRow icon={<CheckCircleRoundedIcon sx={{ fontSize: 14, color: theme.palette.success.main }} />} label="Embedding Status" value="Stored in Vector DB" delay={0.25} />
                  )}
                  {result?.entities_found > 0 && (
                    <InfoRow icon={<MemoryRoundedIcon sx={{ fontSize: 14, color: theme.palette.info.main }} />} label="Knowledge Graph" value="Graph nodes generated" delay={0.3} />
                  )}
                </SectionBlock>
              )}

              {/* Knowledge Extraction */}
              {hasExtractionInfo && (
                <SectionBlock label="Knowledge Extraction" icon={<CategoryRoundedIcon sx={{ fontSize: 13 }} />}>
                  {result?.entities_found !== undefined && (
                    <InfoRow icon={<CategoryRoundedIcon sx={{ fontSize: 14 }} />} label="Entities Found" value={`${result.entities_found} entities`} delay={0.1} />
                  )}
                  {result?.relationships_found !== undefined && (
                    <InfoRow icon={<LinkRoundedIcon sx={{ fontSize: 14 }} />} label="Relationships Found" value={`${result.relationships_found} relations`} delay={0.15} />
                  )}
                  {result?.entities_found > 0 && (
                    <InfoRow icon={<AccountTreeRoundedIcon sx={{ fontSize: 14 }} />} label="Connected Documents" value="Available in KG" delay={0.2} />
                  )}
                </SectionBlock>
              )}

              {/* No data */}
              {!hasDocumentInfo && !hasProcessingInfo && !hasExtractionInfo && (
                <Box sx={{ textAlign: 'center', px: 2, opacity: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                    No intelligence data available for this document yet.
                  </Typography>
                </Box>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </Box>
    </Card>
  );
};

export default InspectorPanel;

