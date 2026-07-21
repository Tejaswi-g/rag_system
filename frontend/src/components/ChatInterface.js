import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Button,
  Avatar,
  Divider,
  IconButton,
  InputBase,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Paper,
  Grid
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

// Icons
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';

const ChatInterface = ({ sessionId, setSessionId, onCreateNewSession }) => {
  const theme = useTheme();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionList, setSessionList] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (sessionId) {
      loadConversationHistory();
    }
  }, [sessionId]);

  const fetchSessions = async () => {
    try {
      const response = await fetch('http://localhost:5000/sessions');
      const data = await response.json();
      setSessionList(data.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions', error);
    }
  };

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

  const handleSend = async (text = input) => {
    if (!text.trim() || loading) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
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
      }
    } catch (error) {
      console.error('Error sending query:', error);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
      fetchSessions(); // refresh history
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Get active context from the last assistant message
  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
  const activeSources = lastAssistantMessage?.metadata?.sources || [];
  const contextUsed = lastAssistantMessage?.metadata?.context_used || 0;

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 120px)', width: '100%', gap: 2 }}>
      
      {/* LEFT PANEL: History */}
      <Card sx={{ width: 280, display: { xs: 'none', lg: 'flex' }, flexDirection: 'column', bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Button 
            fullWidth 
            variant="contained" 
            startIcon={<AddRoundedIcon />}
            onClick={() => { onCreateNewSession(); setMessages([]); }}
            sx={{ borderRadius: 2 }}
          >
            New Workspace
          </Button>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
          <Typography variant="caption" sx={{ ml: 1, mb: 1, display: 'block', fontWeight: 600, color: theme.palette.text.secondary }}>
            RECENT THREADS
          </Typography>
          <List disablePadding>
            {sessionList.map((s) => (
              <ListItem key={s.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton 
                  selected={s.id === sessionId}
                  onClick={() => setSessionId(s.id)}
                  sx={{ 
                    borderRadius: 2, 
                    px: 1.5, py: 1,
                    '&.Mui-selected': { bgcolor: alpha(theme.palette.info.main, 0.1) }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 18, color: s.id === sessionId ? theme.palette.info.main : theme.palette.text.secondary }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={s.id ? `Thread ${s.id.substring(0,6)}` : 'Active'} 
                    secondary={s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Just now'}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: s.id === sessionId ? 600 : 500 }}
                    secondaryTypographyProps={{ variant: 'caption', fontSize: 10 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Card>

      {/* CENTER PANEL: Chat */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2, pb: 12 }}>
          {messages.length === 0 ? (
            <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main, mb: 3 }}>
                <AutoAwesomeRoundedIcon fontSize="large" />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>AI Research Workspace</Typography>
              <Typography color="text.secondary" sx={{ mb: 4, textAlign: 'center', maxWidth: 400 }}>
                Query your entire knowledge graph and document corpus simultaneously. 
              </Typography>
              
              <Grid container spacing={2} sx={{ maxWidth: 600 }}>
                {['Summarize the latest technical guidelines', 'Find relationships between Project X and Client Y', 'What are the main risks mentioned in the docs?'].map((suggestion, i) => (
                  <Grid item xs={12} sm={4} key={i}>
                    <Card 
                      onClick={() => handleSend(suggestion)}
                      sx={{ 
                        p: 2, height: '100%', cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: theme.palette.info.main, transform: 'translateY(-2px)' }
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{suggestion}</Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <Box component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={idx} sx={{ display: 'flex', gap: 2, mb: 4, flexDirection: isUser ? 'row-reverse' : 'row' }}>
                    <Avatar sx={{ 
                      bgcolor: isUser ? theme.palette.primary.main : alpha(theme.palette.info.main, 0.1),
                      color: isUser ? theme.palette.primary.contrastText : theme.palette.info.main,
                      width: 32, height: 32
                    }}>
                      {isUser ? <PersonRoundedIcon fontSize="small" /> : <AutoAwesomeRoundedIcon fontSize="small" />}
                    </Avatar>
                    <Box sx={{ 
                      flex: 1, 
                      maxWidth: '85%',
                      bgcolor: isUser ? theme.palette.background.paper : 'transparent',
                      border: isUser ? `1px solid ${theme.palette.divider}` : 'none',
                      borderRadius: 3, p: isUser ? 2 : 0, pt: isUser ? 2 : 0.5
                    }}>
                      <Typography component="div" variant="body1" sx={{ 
                        '& p': { mt: 0, mb: 2, lineHeight: 1.6 },
                        '& pre': { p: 2, borderRadius: 2, bgcolor: theme.palette.mode === 'light' ? '#F1F5F9' : '#0D1117', overflowX: 'auto' },
                        '& code': { fontFamily: 'monospace' }
                      }}>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
              {loading && (
                <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main, width: 32, height: 32 }}>
                    <AutoAwesomeRoundedIcon fontSize="small" />
                  </Avatar>
                  <Box sx={{ pt: 1 }}><CircularProgress size={20} thickness={4} /></Box>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>
          )}
        </Box>

        {/* Floating Input */}
        <Box sx={{ 
          position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', 
          width: '100%', maxWidth: 760, px: 2 
        }}>
          <Paper sx={{ 
            p: '4px 8px', display: 'flex', alignItems: 'flex-end', 
            borderRadius: 4, border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.palette.mode === 'light' ? '0 10px 25px rgba(0,0,0,0.05)' : '0 10px 25px rgba(0,0,0,0.5)',
            bgcolor: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(10px)',
            transition: 'border-color 0.2s',
            '&:focus-within': { borderColor: theme.palette.info.main }
          }}>
            <IconButton sx={{ p: '10px', color: theme.palette.text.secondary }}>
              <AttachFileRoundedIcon />
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1, py: 1.5, fontSize: 15 }}
              placeholder="Ask anything about your documents and graph..."
              multiline
              maxRows={6}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              inputRef={inputRef}
              disabled={loading}
            />
            <IconButton 
              color="primary" 
              onClick={() => handleSend(input)}
              disabled={!input.trim() || loading}
              sx={{ p: '10px', mb: 0.5, bgcolor: input.trim() ? theme.palette.info.main : 'transparent', color: input.trim() ? '#fff' : theme.palette.text.disabled, '&:hover': { bgcolor: theme.palette.info.dark } }}
            >
              <SendRoundedIcon fontSize="small" />
            </IconButton>
          </Paper>
        </Box>
      </Box>

      {/* RIGHT PANEL: Context */}
      <Card sx={{ width: 320, display: { xs: 'none', md: 'flex' }, flexDirection: 'column', bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DataObjectRoundedIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Response Context</Typography>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          {messages.length === 0 ? (
            <Box sx={{ textAlign: 'center', mt: 4, opacity: 0.6 }}>
              <PushPinRoundedIcon sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="body2">Context will appear here when the AI responds.</Typography>
            </Box>
          ) : (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                {/* Metric Badges */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                  <Chip size="small" icon={<DescriptionRoundedIcon />} label={`${activeSources.length} Sources`} sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main, fontWeight: 600 }} />
                  <Chip size="small" icon={<HubRoundedIcon />} label={`${contextUsed} Entities`} sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, fontWeight: 600 }} />
                </Box>
                
                {/* Source Cards */}
                <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.secondary, mb: 1, display: 'block', textTransform: 'uppercase' }}>
                  Retrieved Documents
                </Typography>
                
                {activeSources.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {activeSources.map((src, i) => (
                      <Card key={i} sx={{ p: 1.5, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', '&:hover': { borderColor: theme.palette.info.main } }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <DescriptionRoundedIcon sx={{ color: theme.palette.info.main, fontSize: 18, mt: 0.2 }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-all' }}>
                              {src.filename}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Chunk ID: {src.chunk_index}
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">No direct sources referenced.</Typography>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </Box>
      </Card>
      
    </Box>
  );
};



export default ChatInterface;