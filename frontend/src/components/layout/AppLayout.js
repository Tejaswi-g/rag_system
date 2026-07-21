import React, { useState, useEffect } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

const AppLayout = ({ children, currentTab, onTabChange, darkMode, toggleDarkMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Auto close sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const tabNames = ['Home', 'AI Assistant', 'Documents', 'Knowledge Explorer', 'Insights'];
  const currentTabName = tabNames[currentTab] || 'Workspace';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar 
        open={sidebarOpen} 
        setOpen={setSidebarOpen} 
        currentTab={currentTab} 
        onTabChange={onTabChange}
        isMobile={isMobile}
      />
      
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        minWidth: 0, // important for flex children truncating
        transition: 'margin 0.3s ease',
      }}>
        <TopHeader 
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          currentTabName={currentTabName}
        />
        
        <Box component="main" sx={{ 
          flexGrow: 1, 
          p: { xs: 2, md: 4 },
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflowX: 'hidden'
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
