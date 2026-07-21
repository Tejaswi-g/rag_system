import React, { useState } from 'react';
import {
  Box,
  InputBase,
  IconButton,
  Chip,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  FormControl,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import SortRoundedIcon from '@mui/icons-material/SortRounded';

const FILTER_CHIPS = [
  { label: 'All', filter: 'all', color: 'info' },
  { label: 'Recent', filter: 'recent', color: 'primary' },
  { label: 'Processing', filter: 'processing', color: 'warning' },
  { label: 'Completed', filter: 'completed', color: 'success' },
  { label: 'Failed', filter: 'failed', color: 'error' },
];

const DocumentToolbar = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  hasPendingUploads,
  onUploadAll,
  onUploadClick,
}) => {
  const theme = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <Box sx={{ mb: 2 }}>
      {/* Top Row: Search + Upload */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
        {/* Search */}
        <Box
          component={motion.div}
          animate={{
            boxShadow: searchFocused
              ? `0 0 0 2px ${alpha(theme.palette.info.main, 0.2)}`
              : 'none',
          }}
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            bgcolor: theme.palette.background.paper,
            border: `1.5px solid ${
              searchFocused
                ? alpha(theme.palette.info.main, 0.4)
                : alpha(theme.palette.divider, 0.8)
            }`,
            borderRadius: 2.5,
            px: 1.75,
            py: 0.75,
            transition: 'border-color 0.2s',
            '&:hover': {
              borderColor: searchFocused
                ? alpha(theme.palette.info.main, 0.5)
                : alpha(theme.palette.text.secondary, 0.4),
            },
          }}
        >
          <SearchRoundedIcon
            sx={{
              color: searchFocused
                ? theme.palette.info.main
                : alpha(theme.palette.text.secondary, 0.5),
              mr: 1,
              fontSize: 18,
              transition: 'color 0.2s',
            }}
          />
          <InputBase
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            sx={{
              flex: 1,
              fontSize: 13,
              fontWeight: 500,
              '&::placeholder': {
                color: alpha(theme.palette.text.secondary, 0.5),
                fontWeight: 400,
                fontSize: 13,
              },
            }}
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <IconButton
                  size="small"
                  onClick={() => onSearchChange('')}
                  sx={{ color: alpha(theme.palette.text.disabled, 0.5) }}
                >
                  <ClearRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>

        {/* Sort */}
        <FormControl
          size="small"
          sx={{
            minWidth: 120,
            display: { xs: 'none', sm: 'inline-flex' },
          }}
        >
          <Select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            displayEmpty
            IconComponent={SortRoundedIcon}
            sx={{
              borderRadius: 2.5,
              bgcolor: theme.palette.background.paper,
              border: `1.5px solid ${alpha(theme.palette.divider, 0.8)}`,
              '& .MuiSelect-select': {
                py: 0.75,
                px: 1.25,
                fontSize: 12,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
              },
              '& fieldset': { border: 'none' },
              '&:hover': { borderColor: alpha(theme.palette.text.secondary, 0.4) },
            }}
          >
            <MenuItem value="newest" sx={{ fontSize: 12 }}>Newest</MenuItem>
            <MenuItem value="oldest" sx={{ fontSize: 12 }}>Oldest</MenuItem>
            <MenuItem value="alpha" sx={{ fontSize: 12 }}>A–Z</MenuItem>
            <MenuItem value="size" sx={{ fontSize: 12 }}>Size</MenuItem>
          </Select>
        </FormControl>

        {/* View toggle */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, val) => val && onViewModeChange(val)}
          size="small"
          sx={{
            display: { xs: 'none', sm: 'inline-flex' },
            bgcolor: theme.palette.background.paper,
            border: `1.5px solid ${alpha(theme.palette.divider, 0.8)}`,
            borderRadius: 2.5,
            '& .MuiToggleButton-root': {
              border: 'none',
              borderRadius: '20px !important',
              px: 1.25,
              py: 0.5,
              color: alpha(theme.palette.text.secondary, 0.6),
              '&.Mui-selected': {
                bgcolor: alpha(theme.palette.info.main, 0.08),
                color: theme.palette.info.main,
              },
            },
          }}
        >
          <ToggleButton value="grid">
            <Tooltip title="Grid view"><GridViewRoundedIcon sx={{ fontSize: 16 }} /></Tooltip>
          </ToggleButton>
          <ToggleButton value="list">
            <Tooltip title="List view"><ViewListRoundedIcon sx={{ fontSize: 16 }} /></Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Upload */}
        <Button
          variant="contained"
          color="info"
          onClick={hasPendingUploads ? onUploadAll : onUploadClick}
          startIcon={<CloudUploadRoundedIcon />}
          sx={{
            borderRadius: 2.5,
            px: 2,
            py: 0.75,
            fontWeight: 600,
            fontSize: 12,
            whiteSpace: 'nowrap',
            minWidth: 90,
            boxShadow: hasPendingUploads
              ? 'none'
              : `0 2px 6px ${alpha(theme.palette.info.main, 0.15)}`,
            '&:hover': {
              boxShadow: hasPendingUploads
                ? 'none'
                : `0 4px 12px ${alpha(theme.palette.info.main, 0.25)}`,
            },
          }}
        >
          {hasPendingUploads ? 'Process' : 'Upload'}
        </Button>
      </Box>

      {/* Filter Chips */}
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {FILTER_CHIPS.map((chip) => (
          <Chip
            key={chip.filter}
            label={chip.label}
            size="small"
            onClick={() => onFilterChange(chip.filter)}
            variant={activeFilter === chip.filter ? 'filled' : 'outlined'}
            color={activeFilter === chip.filter ? chip.color : 'default'}
            sx={{
              borderRadius: 1.5,
              fontWeight: 500,
              fontSize: 11,
              height: 24,
              transition: 'all 0.15s',
              ...(activeFilter !== chip.filter && {
                borderColor: alpha(theme.palette.divider, 0.7),
                color: alpha(theme.palette.text.secondary, 0.7),
                bgcolor: theme.palette.background.paper,
              }),
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default DocumentToolbar;

