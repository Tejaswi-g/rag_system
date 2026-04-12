import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Button,
  Avatar,
  Divider,
  Tooltip,
  Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ReactMarkdown from 'react-markdown';

const ChatInterface = ({ sessionId, onCreateNewSession, darkMode }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (sessionId) {
      loadConversationHistory();
    }
  }, [sessionId]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const loadConversationHistory = async () => {
    try {
      const response = await fetch(`http://localhost:5000/session/${sessionId}`);
      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: input,
          session_id: sessionId
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        const assistantMessage = {
          role: 'assistant',
          content: data.answer,
          metadata: { 
            sources: data.sources,
            context_used: data.context_used
          }
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending query:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    onCreateNewSession();
    setMessages([]);
    setError(null);
  };

  const MessageBubble = ({ message, isUser }) => (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      mb: 2
    }}>
      <Box sx={{ 
        display: 'flex', 
        maxWidth: '80%',
        flexDirection: isUser ? 'row-reverse' : 'row'
      }}>
        <Avatar sx={{ 
          bgcolor: isUser ? '#1976d2' : '#dc004e',
          width: 40,
          height: 40,
          mx: 1
        }}>
          {isUser ? <PersonIcon /> : <SmartToyIcon />}
        </Avatar>
        
        <Card sx={{ 
          borderRadius: 3,
          backgroundColor: isUser ? '#e3f2fd' : '#ffffff'
        }}>
          <CardContent sx={{ py: 1.5, px: 2 }}>
            <ReactMarkdown>
              {message.content}
            </ReactMarkdown>
            
            {!isUser && message.metadata?.sources && message.metadata.sources.length > 0 && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip 
                    icon={<AutoAwesomeIcon />}
                    label={`${message.metadata.context_used || 0} sources`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                {message.metadata.sources.map((source, idx) => (
                  <Typography key={idx} variant="caption" display="block" color="text.secondary">
                    📄 {source.filename} (chunk {source.chunk_index})
                  </Typography>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">Chat Session</Typography>
          <Chip 
            label={sessionId ? sessionId.substring(0, 8) : 'Loading...'}
            size="small"
            variant="outlined"
          />
        </Box>
        
        <Tooltip title="Start New Chat">
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleNewChat}
            size="small"
          >
            New Chat
          </Button>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper 
        elevation={2} 
        sx={{ 
          flex: 1, 
          overflow: 'auto', 
          p: 2, 
          mb: 2,
          backgroundColor: darkMode ? '#1e1e1e' : '#fafafa',
          borderRadius: 3
        }}
      >
        {messages.length === 0 && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            opacity: 0.7
          }}>
            <AutoAwesomeIcon sx={{ fontSize: 48, mb: 2, color: '#1976d2' }} />
            <Typography variant="h6" gutterBottom>
              Start a Conversation
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center">
              Ask questions about your uploaded documents.<br />
              The system will use AI to provide accurate, sourced answers.
            </Typography>
          </Box>
        )}
        
        {messages.map((message, index) => (
          <MessageBubble 
            key={index}
            message={message} 
            isUser={message.role === 'user'}
          />
        ))}
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Paper>

      <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about your documents..."
            disabled={loading}
            variant="outlined"
            inputRef={inputRef}
          />
          <IconButton 
            color="primary" 
            onClick={handleSend} 
            disabled={loading || !input.trim()}
            sx={{ 
              alignSelf: 'flex-end',
              bgcolor: '#1976d2',
              color: 'white',
              '&:hover': {
                bgcolor: '#1565c0',
              },
              width: 48,
              height: 48
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatInterface;