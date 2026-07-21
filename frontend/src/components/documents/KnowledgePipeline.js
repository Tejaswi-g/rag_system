import React from 'react';
import {
  Box,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import PsycholoGyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

const PIPELINE_STAGES = [
  { key: 'document', label: 'Document', icon: DescriptionRoundedIcon, color: '#0EA5E9' },
  { key: 'chunking', label: 'Chunking', icon: ContentCutRoundedIcon, color: '#8B5CF6' },
  { key: 'embedding', label: 'Embedding', icon: AutoFixHighRoundedIcon, color: '#10B981' },
  { key: 'knowledge_graph', label: 'Knowledge Graph', icon: HubRoundedIcon, color: '#F59E0B' },
  { key: 'ai_ready', label: 'AI Ready', icon: PsycholoGyRoundedIcon, color: '#EF4444' },
];

const StageNode = ({ stage, isCompleted, isActive, index, showDetails }) => {
  const theme = useTheme();
  const StageIcon = stage.icon;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        mb: 2.5,
        position: 'relative',
      }}
    >
      {/* Node */}
      <motion.div
        animate={
          isCompleted
            ? {
                scale: [1, 1.2, 1],
                backgroundColor: stage.color,
                boxShadow: [
                  `0 0 0 0px ${alpha(stage.color, 0.4)}`,
                  `0 0 0 8px ${alpha(stage.color, 0)}}`,
                  `0 0 0 0px ${alpha(stage.color, 0.4)}`,
                ],
              }
            : isActive
            ? {
                scale: [1, 1.1, 1],
                backgroundColor: alpha(stage.color, 0.15),
              }
            : {
                scale: 1,
                backgroundColor: alpha(theme.palette.text.secondary, 0.08),
              }
        }
        transition={
          isCompleted
            ? { duration: 0.8, ease: 'easeOut' }
            : isActive
            ? { scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } }
            : {}
        }
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: isActive
            ? `2px solid ${stage.color}`
            : `2px solid ${isCompleted ? stage.color : 'transparent'}`,
          flexShrink: 0,
          zIndex: 1,
          position: 'relative',
        }}
      >
        {isCompleted ? (
          <CheckCircleRoundedIcon sx={{ fontSize: 17, color: '#FFFFFF' }} />
        ) : (
          <StageIcon
            sx={{
              fontSize: 17,
              color: isActive ? stage.color : alpha(theme.palette.text.secondary, 0.35),
            }}
          />
        )}
      </motion.div>

      {/* Content */}
      <Box sx={{ flex: 1, pt: 0.35 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: isCompleted ? 600 : 500,
            color: isCompleted
              ? theme.palette.text.primary
              : isActive
              ? stage.color
              : alpha(theme.palette.text.secondary, 0.5),
            fontSize: 13,
            mb: 0.15,
          }}
        >
          {stage.label}
        </Typography>

        <AnimatePresence>
          {isCompleted && showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Typography
                variant="caption"
                sx={{ color: alpha(theme.palette.text.secondary, 0.6), fontSize: 11 }}
              >
                {stage.key === 'document' &&
                  `ID: ${showDetails?.document_id?.slice(0, 8)}...`}
                {stage.key === 'chunking' &&
                  `${showDetails?.chunks || 0} chunks`}
                {stage.key === 'embedding' && 'Embedded in vector DB'}
                {stage.key === 'knowledge_graph' &&
                  `${showDetails?.entities_found || 0} entities, ${showDetails?.relationships_found || 0} relations`}
                {stage.key === 'ai_ready' &&
                  `${showDetails?.processing_time_seconds || 0}s total`}
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Status chip */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
          >
            <Box
              sx={{
                px: 0.75,
                py: 0.15,
                borderRadius: 0.75,
                bgcolor: alpha(stage.color, 0.08),
                color: stage.color,
                fontSize: 10,
                fontWeight: 600,
                lineHeight: 1.4,
              }}
            >
              ✓ Done
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

const KnowledgePipeline = ({ documentResult }) => {
  const theme = useTheme();
  const hasData = documentResult && Object.keys(documentResult).length > 0;

  const completedStages = hasData
    ? {
        document: true,
        chunking: (documentResult.chunks || 0) > 0,
        embedding: true,
        knowledge_graph:
          (documentResult.entities_found || 0) > 0 &&
          (documentResult.relationships_found || 0) > 0,
        ai_ready: true,
      }
    : {
        document: false,
        chunking: false,
        embedding: false,
        knowledge_graph: false,
        ai_ready: false,
      };

  const visibleStages = PIPELINE_STAGES.filter((stage) => {
    if (!hasData) return true;
    return completedStages[stage.key];
  });

  const activeStageIndex = visibleStages.findIndex(
    (stage) => !completedStages[stage.key]
  );

  return (
    <Box sx={{ py: 1.5 }}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          color: alpha(theme.palette.text.secondary, 0.6),
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          mb: 2,
          display: 'block',
          fontSize: 10,
        }}
      >
        Knowledge Pipeline
      </Typography>

      <Box sx={{ position: 'relative', ml: 0.25 }}>
        {/* Connecting line */}
        <Box
          sx={{
            position: 'absolute',
            left: 17,
            top: 8,
            bottom: 8,
            width: 1.5,
            bgcolor: alpha(theme.palette.divider, 0.6),
            borderRadius: 1,
          }}
        />

        {visibleStages.map((stage, index) => (
          <StageNode
            key={stage.key}
            stage={stage}
            isCompleted={completedStages[stage.key]}
            isActive={index === activeStageIndex}
            index={index}
            showDetails={hasData ? documentResult : null}
          />
        ))}
      </Box>
    </Box>
  );
};

export default KnowledgePipeline;

