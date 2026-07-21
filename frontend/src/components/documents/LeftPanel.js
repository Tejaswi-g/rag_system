import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';

import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import LabelImportantRoundedIcon from '@mui/icons-material/LabelImportantRounded';

const LeftPanel = ({ documentCount = 0, activeFilter = 'all', onFilterChange }) => {
  const theme = useTheme();

  const navigationItems = [
    { label: 'All Documents', icon: <FolderOpenRoundedIcon fontSize="small" />, filter: 'all' },
    { label: 'Recent', icon: <HistoryRoundedIcon fontSize="small" />, filter: 'recent' },
    { label: 'Favorites', icon: <StarBorderRoundedIcon fontSize="small" />, filter: 'favorites' },
  ];

  const collections = [
    { label: 'Financial Reports', color: theme.palette.success.main, count: 0 },
    { label: 'Technical Specs', color: theme.palette.warning.main, count: 0 },
    { label: 'HR Policies', color: theme.palette.error.main, count: 0 },
  ];

  return (
    <Box
      sx={{
        width: 220,
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        flexShrink: 0,
        borderRadius: 2.5,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: alpha(theme.palette.text.secondary, 0.6),
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontSize: 10,
            }}
          >
            Knowledge Repository
          </Typography>
          <Chip
            label={documentCount}
            size="small"
            sx={{
              height: 18,
              minWidth: 18,
              fontSize: 10,
              fontWeight: 700,
              bgcolor: alpha(theme.palette.info.main, 0.08),
              color: theme.palette.info.main,
            }}
          />
        </Box>
      </Box>

      {/* Navigation */}
      <List disablePadding sx={{ px: 1 }}>
        {navigationItems.map((item) => {
          const active = activeFilter === item.filter;
          return (
            <ListItem key={item.filter} disablePadding sx={{ mb: 0.15 }}>
              <ListItemButton
                onClick={() => onFilterChange?.(item.filter)}
                sx={{
                  borderRadius: 1.5,
                  py: 0.6,
                  bgcolor: active ? alpha(theme.palette.info.main, 0.06) : 'transparent',
                  color: active ? theme.palette.info.main : alpha(theme.palette.text.secondary, 0.7),
                  '&:hover': {
                    bgcolor: active
                      ? alpha(theme.palette.info.main, 0.1)
                      : alpha(theme.palette.action.hover, 0.4),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 28, color: 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: active ? 600 : 500,
                    fontSize: 13,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ my: 1, mx: 2, borderColor: alpha(theme.palette.divider, 0.6) }} />

      {/* Collections */}
      <Box sx={{ px: 2, pb: 0.5, pt: 0.5 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: alpha(theme.palette.text.secondary, 0.6),
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            display: 'block',
            mb: 0.75,
            fontSize: 10,
          }}
        >
          Collections
        </Typography>
      </Box>
      <List disablePadding sx={{ px: 1 }}>
        {collections.map((item) => (
          <ListItem key={item.label} disablePadding sx={{ mb: 0.15 }}>
            <ListItemButton
              sx={{
                borderRadius: 1.5,
                py: 0.6,
                '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.4) },
              }}
            >
              <ListItemIcon sx={{ minWidth: 28 }}>
                <LabelImportantRoundedIcon sx={{ fontSize: 14, color: item.color }} />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: 500,
                  color: theme.palette.text.primary,
                  fontSize: 13,
                }}
              />
              <Chip
                label={item.count}
                size="small"
                sx={{
                  height: 16,
                  minWidth: 16,
                  fontSize: 9,
                  fontWeight: 600,
                  bgcolor: alpha(item.color, 0.08),
                  color: item.color,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 1, mx: 2, borderColor: alpha(theme.palette.divider, 0.6) }} />

      {/* Quick Filters */}
      <Box sx={{ px: 2, pb: 0.5, pt: 0.5 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: alpha(theme.palette.text.secondary, 0.6),
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            display: 'block',
            mb: 0.75,
            fontSize: 10,
          }}
        >
          Status
        </Typography>
      </Box>
      <Box sx={{ px: 1.5, pb: 2, display: 'flex', flexDirection: 'column', gap: 0.35 }}>
        {[
          { label: 'Processed', filter: 'completed', color: theme.palette.success.main },
          { label: 'Processing', filter: 'processing', color: theme.palette.warning.main },
          { label: 'Failed', filter: 'failed', color: theme.palette.error.main },
        ].map((item) => (
          <Box
            key={item.filter}
            onClick={() => onFilterChange?.(item.filter)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 1.25,
              py: 0.6,
              borderRadius: 1.5,
              cursor: 'pointer',
              transition: 'background-color 0.15s',
              '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.4) },
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: item.color,
                flexShrink: 0,
              }}
            />
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: alpha(theme.palette.text.secondary, 0.7),
                fontSize: 13,
              }}
            >
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default LeftPanel;

