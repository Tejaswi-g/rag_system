import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import '@fontsource/inter';
import Home from './components/Home';
import AppLayout from './components/layout/AppLayout';

import ChatInterface from './components/ChatInterface';
import DocumentUpload from './components/DocumentUpload';
import GraphVisualization from './components/GraphVisualization';
import Dashboard from './components/Dashboard';
import { getTheme } from './theme';
import './App.css';

function App() {
  const [currentTab, setCurrentTab] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const theme = getTheme(darkMode ? 'dark' : 'light');

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
      <AppLayout 
        currentTab={currentTab} 
        onTabChange={handleTabChange}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      >
        {currentTab === 0 && <Home />}
        
        {currentTab === 1 && (
          <ChatInterface 
            sessionId={sessionId}
            setSessionId={setSessionId} 
            onCreateNewSession={createNewSession}
            darkMode={darkMode}
          />
        )}
        
        {currentTab === 2 && <DocumentUpload darkMode={darkMode} />}
        
        {currentTab === 3 && <GraphVisualization darkMode={darkMode} />}
        
        {currentTab === 4 && <Dashboard darkMode={darkMode} />}
      </AppLayout>
    </ThemeProvider>
  );
}

export default App;