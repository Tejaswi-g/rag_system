import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Box, 
  Typography, 
  IconButton, 
  InputBase, 
  Breadcrumbs,
  Link,
  useTheme,
  alpha
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

const TopHeader = ({ isMobile, sidebarOpen, setSidebarOpen, darkMode, toggleDarkMode, currentTabName }) => {
  const theme = useTheme();

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        backgroundColor: alpha(theme.palette.background.default, 0.8),
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
        zIndex: theme.zIndex.drawer - 1
      }}
    >
      <Toolbar sx={{ height: 72, px: { xs: 2, sm: 4 }, display: 'flex', gap: 2 }}>
        {isMobile && (
          <IconButton onClick={() => setSidebarOpen(true)} edge="start" color="inherit">
            <MenuIcon />
          </IconButton>
        )}

        {/* Breadcrumbs */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          {!isMobile && (
            <Breadcrumbs 
              separator={<ChevronRightRoundedIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />} 
              aria-label="breadcrumb"
            >
              <Link underline="hover" color="text.secondary" href="#" sx={{ fontWeight: 500, fontSize: 14 }}>
                Workspace
              </Link>
              <Typography color="text.primary" sx={{ fontWeight: 600, fontSize: 14 }}>
                {currentTabName}
              </Typography>
            </Breadcrumbs>
          )}
        </Box>

        {/* Global Search */}
        <Box sx={{ 
          flex: 2, 
          maxWidth: 400,
          position: 'relative',
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center'
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 8, // Pill shape
            px: 2,
            py: 0.5,
            transition: 'all 0.2s',
            '&:hover': { borderColor: theme.palette.text.secondary },
            '&:focus-within': { 
              borderColor: theme.palette.info.main,
              boxShadow: `0 0 0 2px ${alpha(theme.palette.info.main, 0.2)}`
            }
          }}>
            <SearchRoundedIcon sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: 20 }} />
            <InputBase 
              placeholder="Search documents, entities, or ask a question..." 
              sx={{ ml: 1, flex: 1, fontSize: 14 }}
            />
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5,
              color: theme.palette.text.secondary,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              px: 0.5,
              py: 0.25,
              fontSize: 10,
              fontWeight: 600
            }}>
              <span>⌘</span><span>K</span>
            </Box>
          </Box>
        </Box>

        {/* Quick Actions & Profile */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
          <IconButton 
            sx={{ 
              bgcolor: theme.palette.info.main, 
              color: 'white',
              '&:hover': { bgcolor: theme.palette.info.dark },
              display: { xs: 'none', sm: 'flex' }
            }}
            size="small"
          >
            <AddRoundedIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, borderLeft: `1px solid ${theme.palette.divider}`, pl: 2, gap: 1 }}>
            <IconButton onClick={toggleDarkMode} color="inherit" size="small">
              {darkMode ? <LightModeRoundedIcon fontSize="small" /> : <DarkModeRoundedIcon fontSize="small" />}
            </IconButton>
            <IconButton color="inherit" size="small">
              <NotificationsNoneRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopHeader;
