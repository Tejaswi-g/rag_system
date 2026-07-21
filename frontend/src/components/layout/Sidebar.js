import React from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton,
  ListItemIcon, 
  ListItemText, 
  Typography, 
  IconButton,
  Divider,
  Avatar,
  useTheme
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

// Icons
import HexagonIcon from '@mui/icons-material/Hexagon';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import FolderCopyRoundedIcon from '@mui/icons-material/FolderCopyRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 80;

const Sidebar = ({ open, setOpen, currentTab, onTabChange, isMobile }) => {
  const theme = useTheme();

  const navigationItems = [
    { text: 'Home', icon: <HomeRoundedIcon />, tab: 0 },
    { text: 'AI Assistant', icon: <ChatBubbleRoundedIcon />, tab: 1 },
    { text: 'Documents', icon: <FolderCopyRoundedIcon />, tab: 2 },
    { text: 'Knowledge Explorer', icon: <HubRoundedIcon />, tab: 3 },
    { text: 'Insights', icon: <InsightsRoundedIcon />, tab: 4 },
  ];

  const handleToggle = () => setOpen(!open);

  const sidebarContent = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: theme.palette.background.paper,
      borderRight: `1px solid ${theme.palette.divider}`,
      transition: 'width 0.3s ease'
    }}>
      {/* Logo & Toggle */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: open ? 'space-between' : 'center',
        p: 2, 
        height: 72,
      }}>
        {open && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
            <HexagonIcon sx={{ color: theme.palette.info.main, fontSize: 32 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
              Nexus AI
            </Typography>
          </Box>
        )}
        {!open && <HexagonIcon sx={{ color: theme.palette.info.main, fontSize: 32 }} />}
        
        {!isMobile && (
          <IconButton onClick={handleToggle} size="small" sx={{ 
            position: open ? 'relative' : 'absolute', 
            right: open ? 0 : -14,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            '&:hover': { bgcolor: theme.palette.action.hover },
            zIndex: 10
          }}>
            {open ? <KeyboardDoubleArrowLeftIcon fontSize="small" /> : <KeyboardDoubleArrowRightIcon fontSize="small" />}
          </IconButton>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, px: 2, pt: 2, overflowY: 'auto', overflowX: 'hidden' }}>
        {open && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, ml: 1, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Workspace
          </Typography>
        )}
        <List sx={{ p: 0 }}>
          {navigationItems.map((item) => {
            const active = currentTab === item.tab;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => onTabChange(null, item.tab)}
                  sx={{
                    borderRadius: 2,
                    minHeight: 44,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2,
                    bgcolor: active ? (theme.palette.mode === 'light' ? '#F1F5F9' : '#1E293B') : 'transparent',
                    color: active ? theme.palette.info.main : theme.palette.text.secondary,
                    position: 'relative',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: active ? (theme.palette.mode === 'light' ? '#E2E8F0' : '#334155') : theme.palette.action.hover,
                      color: active ? theme.palette.info.dark : theme.palette.text.primary,
                      transform: 'translateX(4px)'
                    },
                  }}
                >
                  {/* Active Indicator Line */}
                  {active && (
                    <motion.div
                      layoutId="active-indicator"
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: '15%',
                        bottom: '15%',
                        width: 3,
                        backgroundColor: theme.palette.info.main,
                        borderRadius: '0 4px 4px 0'
                      }}
                    />
                  )}
                  <ListItemIcon sx={{ 
                    minWidth: 0, 
                    mr: open ? 2 : 0, 
                    justifyContent: 'center',
                    color: 'inherit'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {open && (
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ 
                        variant: 'body2', 
                        fontWeight: active ? 600 : 500 
                      }} 
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Bottom Section */}
      <Box sx={{ p: 2 }}>
        <List sx={{ p: 0 }}>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton sx={{ borderRadius: 2, justifyContent: open ? 'initial' : 'center', px: 2 }}>
              <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 0, color: theme.palette.text.secondary }}>
                <SettingsRoundedIcon />
              </ListItemIcon>
              {open && <ListItemText primary="Settings" primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} />}
            </ListItemButton>
          </ListItem>
        </List>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: open ? 'flex-start' : 'center',
          gap: 1.5,
          p: 1,
          borderRadius: 2,
          '&:hover': { bgcolor: theme.palette.action.hover, cursor: 'pointer' }
        }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.info.main, fontSize: 14, fontWeight: 600 }}>JD</Avatar>
          {open && (
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>John Doe</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', whiteSpace: 'nowrap' }}>Enterprise Plan</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={isMobile ? handleToggle : undefined}
      sx={{
        width: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
          boxSizing: 'border-box',
          border: 'none',
          overflowX: 'hidden',
          transition: 'width 0.3s ease',
        },
      }}
    >
      {sidebarContent}
    </Drawer>
  );
};

export default Sidebar;
