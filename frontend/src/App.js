import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ChatIcon from '@mui/icons-material/Chat';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DashboardIcon from '@mui/icons-material/Dashboard';

import ChatInterface from './components/ChatInterface';
import DocumentUpload from './components/DocumentUpload';
import GraphVisualization from './components/GraphVisualization';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [currentTab, setCurrentTab] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#dc004e',
        light: '#ff4081',
        dark: '#c51162',
        contrastText: '#ffffff',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#ffffff' : '#000000',
        secondary: darkMode ? '#b0b0b0' : '#666666',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: darkMode 
              ? '0 4px 6px rgba(0,0,0,0.3)' 
              : '0 4px 6px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });

  useEffect(() => {
    createNewSession();
  }, []);

  const createNewSession = async () => {
    try {
      const response = await fetch('http://localhost:5000/session/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      setSessionId(data.session_id);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="sticky" elevation={0} sx={{ 
          backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#1976d2',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                Advanced RAG System
              </Typography>
              <Typography variant="caption" sx={{ ml: 2, opacity: 0.8 }}>
                Powered by Gemini AI
              </Typography>
            </Box>
            
            <IconButton color="inherit" onClick={toggleDarkMode}>
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 3, mb: 3, flex: 1 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab icon={<ChatIcon />} label="Chat" iconPosition="start" />
              <Tab icon={<CloudUploadIcon />} label="Upload" iconPosition="start" />
              <Tab icon={<AccountTreeIcon />} label="Knowledge Graph" iconPosition="start" />
              <Tab icon={<DashboardIcon />} label="Dashboard" iconPosition="start" />
            </Tabs>
          </Box>

          <Box sx={{ mt: 2 }}>
            {currentTab === 0 && (
              <ChatInterface 
                sessionId={sessionId} 
                onCreateNewSession={createNewSession}
                darkMode={darkMode}
              />
            )}
            
            {currentTab === 1 && (
              <DocumentUpload darkMode={darkMode} />
            )}
            
            {currentTab === 2 && (
              <GraphVisualization darkMode={darkMode} />
            )}
            
            {currentTab === 3 && (
              <Dashboard darkMode={darkMode} />
            )}
          </Box>
        </Container>

        <Box component="footer" sx={{ 
          py: 2, 
          textAlign: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5'
        }}>
          <Typography variant="body2" color="text.secondary">
            Advanced RAG System with Knowledge Graph Integration © 2024
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;