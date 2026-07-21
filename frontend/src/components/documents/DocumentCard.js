import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
} from '@mui/material';
import { motion } from 'framer-motion';

import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import TextSnippetRoundedIcon from '@mui/icons-material/TextSnippetRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

const getFileIcon = (filename, theme) => {
  if (!filename) return <DescriptionRoundedIcon />;
  if (filename.toLowerCase().endsWith('.pdf'))
    return <PictureAsPdfRoundedIcon sx={{ color: theme.palette.error.main }} />;
  if (filename.toLowerCase().endsWith('.txt'))
    return <TextSnippetRoundedIcon sx={{ color: theme.palette.info.main }} />;
  return <DescriptionRoundedIcon sx={{ color: theme.palette.text.secondary }} />;
};

const StatusBadge = ({ label, color, icon }) => {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.4,
        px: 0.75,
        py: 0.2,
        borderRadius: 0.75,
        bgcolor: alpha(color, 0.08),
        color: color,
      }}
    >
      {icon}
      <Typography sx={{ fontWeight: 600, fontSize: 10, lineHeight: 1.3 }}>
        {label}
      </Typography>
    </Box>
  );
};

const DocumentCard = ({ doc, isSelected, onSelect, onRemoveUpload }) => {
  const theme = useTheme();
  const [contextMenu, setContextMenu] = useState(null);
  const FileIcon = getFileIcon(doc.filename, theme);

  const handleContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ mouseX: event.clientX - 2, mouseY: event.clientY - 4 });
  };

  const handleClose = () => setContextMenu(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diff = now - d;
      if (diff < 86400000) return 'Today';
      if (diff < 172800000) return 'Yesterday';
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <Card
          onClick={() => onSelect(doc)}
          onContextMenu={handleContextMenu}
          elevation={0}
          sx={{
            p: 2,
            cursor: 'pointer',
            borderRadius: 2.5,
            border: `1.5px solid ${
              isSelected ? alpha(theme.palette.info.main, 0.5) : theme.palette.divider
            }`,
            bgcolor: isSelected
              ? alpha(theme.palette.info.main, 0.02)
              : theme.palette.background.paper,
            transition: 'border-color 0.25s, box-shadow 0.25s, background-color 0.25s',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              borderColor: alpha(theme.palette.info.main, 0.25),
              bgcolor: isSelected
                ? alpha(theme.palette.info.main, 0.04)
                : alpha(theme.palette.background.paper, 0.8),
            },
          }}
        >
          {/* Selection indicator */}
          {isSelected && (
            <motion.div
              layoutId="sel-indicator"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 3,
                height: '100%',
                backgroundColor: theme.palette.info.main,
                borderRadius: '0 3px 3px 0',
              }}
            />
          )}

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            {/* Icon */}
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: alpha(
                  doc.filename?.toLowerCase().endsWith('.pdf')
                    ? theme.palette.error.main
                    : theme.palette.info.main,
                  0.06
                ),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {FileIcon}
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  mb: 0.25,
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  color: theme.palette.text.primary,
                  lineHeight: 1.4,
                }}
              >
                {doc.filename}
              </Typography>

              <Typography
                variant="caption"
                sx={{ color: alpha(theme.palette.text.secondary, 0.7), fontSize: 11 }}
              >
                {doc.size_mb || '?'} MB · {formatDate(doc.uploaded_at)}
              </Typography>

              {doc.status === 'uploading' ? (
                <Box sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={doc.progress}
                    sx={{
                      height: 3,
                      borderRadius: 1.5,
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      '& .MuiLinearProgress-bar': { bgcolor: theme.palette.info.main },
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ mt: 0.25, fontWeight: 600, fontSize: 10, color: theme.palette.info.main, display: 'block' }}
                  >
                    {doc.progress}%
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'center', gap: 1 }}>
                  {doc.status === 'pending' && (
                    <StatusBadge
                      label="Pending"
                      color={theme.palette.warning.main}
                      icon={<HourglassBottomRoundedIcon sx={{ fontSize: 10 }} />}
                    />
                  )}
                  {doc.status === 'error' && (
                    <StatusBadge
                      label="Failed"
                      color={theme.palette.error.main}
                      icon={<ErrorOutlineRoundedIcon sx={{ fontSize: 10 }} />}
                    />
                  )}
                  {(doc.status === 'completed' || (!doc.status && doc.filename)) && (
                    <StatusBadge
                      label="Indexed"
                      color={theme.palette.success.main}
                      icon={<CheckCircleRoundedIcon sx={{ fontSize: 10 }} />}
                    />
                  )}
                  {doc.result?.entities_found > 0 && (
                    <Typography variant="caption" sx={{ fontSize: 10, color: alpha(theme.palette.text.secondary, 0.6) }}>
                      {doc.result.entities_found} entities
                    </Typography>
                  )}
                </Box>
              )}
            </Box>

            {/* More button */}
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                if (doc.status === 'pending' && onRemoveUpload) {
                  onRemoveUpload(doc.id);
                } else {
                  handleContextMenu(e);
                }
              }}
              sx={{
                color: alpha(theme.palette.text.secondary, 0.4),
                mt: -0.5,
                mr: -0.5,
                '&:hover': {
                  color: doc.status === 'pending' ? theme.palette.error.main : theme.palette.text.primary,
                },
              }}
            >
              {doc.status === 'pending' ? (
                <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
              ) : (
                <MoreHorizRoundedIcon sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          </Box>
        </Card>
      </motion.div>

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              minWidth: 170,
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
              border: `1px solid ${theme.palette.divider}`,
              '& .MuiMenuItem-root': {
                borderRadius: 0.75,
                mx: 0.5,
                my: 0.15,
                px: 1.5,
                py: 0.75,
                fontSize: 13,
              },
            },
          },
        }}
      >
        <MenuItem onClick={handleClose}>
          <ListItemIcon><VisibilityRoundedIcon sx={{ fontSize: 16 }} /></ListItemIcon>
          <ListItemText primary="View Details" primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} />
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon><SmartToyRoundedIcon sx={{ fontSize: 16 }} /></ListItemIcon>
          <ListItemText primary="Ask AI About This" primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} />
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon><AccountTreeRoundedIcon sx={{ fontSize: 16 }} /></ListItemIcon>
          <ListItemText primary="View Knowledge Graph" primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} />
        </MenuItem>
      </Menu>
    </>
  );
};

export default DocumentCard;

