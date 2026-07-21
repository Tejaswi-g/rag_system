import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Chip,
  Avatar,
  IconButton,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import { motion } from 'framer-motion';

// Icons
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';

const Home = ({ onNavigate }) => {
  const theme = useTheme();
  const [stats, setStats] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, docsRes, sessionsRes] = await Promise.all([
          fetch('http://localhost:5000/stats'),
          fetch('http://localhost:5000/documents'),
          fetch('http://localhost:5000/sessions')
        ]);
        const statsData = await statsRes.json();
        const docsData = await docsRes.json();
        const sessionsData = await sessionsRes.json();

        setStats(statsData);
        setDocuments(docsData.documents || []);
        setSessions(sessionsData.sessions || []);
      } catch (error) {
        console.error('Failed to load workspace data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flex: 1 }}>
        <CircularProgress size={40} thickness={4} sx={{ color: theme.palette.info.main }} />
      </Box>
    );
  }

  return (
    <Box 
      component={motion.div} 
      variants={containerVariants} 
      initial="hidden" 
      animate="show"
      sx={{ display: 'flex', flexDirection: 'column', gap: 4, pb: 4 }}
    >
      {/* Hero Section */}
      <Box component={motion.div} variants={itemVariants} sx={{ 
        position: 'relative',
        borderRadius: 4,
        overflow: 'hidden',
        p: { xs: 4, md: 6 },
        background: theme.palette.mode === 'light' 
          ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`
          : `linear-gradient(135deg, #0d1117 0%, #161b22 100%)`,
        border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
        color: '#fff',
        boxShadow: theme.palette.mode === 'light' ? '0 20px 40px rgba(15,23,42,0.1)' : 'none'
      }}>
        {/* Abstract Background Element */}
        <Box sx={{
          position: 'absolute',
          right: '-5%',
          top: '-20%',
          width: '50%',
          height: '150%',
          background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }} />
        
        <Grid container spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AutoAwesomeRoundedIcon sx={{ color: '#0EA5E9' }} />
              <Typography variant="overline" sx={{ fontWeight: 600, letterSpacing: '0.1em', color: '#0EA5E9' }}>
                Nexus Enterprise Workspace
              </Typography>
            </Box>
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 1, letterSpacing: '-0.03em' }}>
              Welcome back, Architect
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.8, mb: 4, maxWidth: 600 }}>
              Your Knowledge Graph has grown by {stats?.vector_store?.total_chunks || 0} embedded chunks across {documents.length} documents. The intelligence engine is ready.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                size="large"
                sx={{ 
                  bgcolor: '#FFFFFF', 
                  color: '#0F172A',
                  '&:hover': { bgcolor: '#F1F5F9' },
                  px: 3, py: 1.5, borderRadius: 3
                }}
                startIcon={<AddCircleOutlineRoundedIcon />}
              >
                New AI Query
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                sx={{ 
                  borderColor: 'rgba(255,255,255,0.3)', 
                  color: '#FFFFFF',
                  '&:hover': { borderColor: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.05)' },
                  px: 3, py: 1.5, borderRadius: 3
                }}
                startIcon={<UploadFileRoundedIcon />}
              >
                Upload Corpus
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
            {/* Visual AI Node representation */}
            <Box sx={{ 
              height: 200, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              position: 'relative'
            }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                style={{ position: 'absolute', width: 180, height: 180, border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '50%' }}
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                style={{ position: 'absolute', width: 120, height: 120, border: '1px solid rgba(14,165,233,0.3)', borderRadius: '50%' }}
              />
              <Avatar sx={{ width: 64, height: 64, bgcolor: '#0EA5E9', boxShadow: '0 0 30px rgba(14,165,233,0.5)' }}>
                <HubRoundedIcon fontSize="large" />
              </Avatar>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={3} component={motion.div} variants={itemVariants}>
        {[
          { label: 'Documents Indexed', value: documents.length, icon: <DescriptionRoundedIcon />, color: '#0EA5E9' },
          { label: 'Knowledge Nodes', value: stats?.knowledge_graph?.entity_count || 0, icon: <HubRoundedIcon />, color: '#10B981' },
          { label: 'Vector Chunks', value: stats?.vector_store?.total_chunks || 0, icon: <AutoAwesomeRoundedIcon />, color: '#8B5CF6' },
          { label: 'Active Sessions', value: stats?.sessions?.active || sessions.length || 0, icon: <ChatBubbleOutlineRoundedIcon />, color: '#F59E0B' }
        ].map((metric, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card sx={{ 
              height: '100%', 
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.palette.mode === 'light' ? '0 12px 24px rgba(0,0,0,0.05)' : 'none', borderColor: metric.color }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(metric.color, 0.1), color: metric.color }}>
                    {metric.icon}
                  </Box>
                  <TimelineRoundedIcon sx={{ color: theme.palette.text.disabled, fontSize: 16 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {metric.value.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {metric.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Complex Layout Area */}
      <Grid container spacing={3}>
        {/* Left Column: Recent Docs & Sessions */}
        <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Recent Documents */}
          <Box component={motion.div} variants={itemVariants}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Corpus Additions</Typography>
              <Button size="small" endIcon={<ArrowForwardIosRoundedIcon sx={{ fontSize: 12 }} />}>View All</Button>
            </Box>
            <Grid container spacing={2}>
              {documents.slice(0, 4).map((doc, idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <Card sx={{ 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: theme.palette.action.hover }
                  }}>
                    <Box sx={{ 
                      width: 40, height: 40, 
                      borderRadius: 2, 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <DescriptionRoundedIcon fontSize="small" />
                    </Box>
                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {doc.filename}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {doc.size_mb} MB • {new Date(doc.uploaded_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Chip size="small" label="Indexed" color="success" sx={{ height: 20, fontSize: 10, fontWeight: 600 }} />
                  </Card>
                </Grid>
              ))}
              {documents.length === 0 && (
                <Grid item xs={12}>
                  <Card sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed' }}>
                    <Typography color="text.secondary">No documents in the workspace yet.</Typography>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>

          {/* Recent Conversations */}
          <Box component={motion.div} variants={itemVariants}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Intelligence Threads</Typography>
            <Card>
              {sessions.length > 0 ? sessions.slice(0, 3).map((session, idx) => (
                <Box key={idx} sx={{ 
                  p: 2.5, 
                  borderBottom: idx < Math.min(sessions.length, 3) - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  transition: 'background-color 0.2s',
                  '&:hover': { bgcolor: theme.palette.action.hover, cursor: 'pointer' }
                }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main, width: 36, height: 36 }}>
                    <ChatBubbleOutlineRoundedIcon fontSize="small" />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {session.id ? `Session ${session.id.substring(0,8)}` : 'Active Conversation'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      {session.created_at ? new Date(session.created_at).toLocaleString() : 'Recent'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip size="small" variant="outlined" label="RAG Activated" sx={{ fontSize: 10, height: 20 }} />
                      <Chip size="small" variant="outlined" label="Graph Context" sx={{ fontSize: 10, height: 20 }} />
                    </Box>
                  </Box>
                  <IconButton size="small"><ArrowForwardIosRoundedIcon sx={{ fontSize: 14 }} /></IconButton>
                </Box>
              )) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">No recent conversations.</Typography>
                </Box>
              )}
            </Card>
          </Box>
        </Grid>

        {/* Right Column: Graph Preview & Insights */}
        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Knowledge Graph Preview */}
          <Box component={motion.div} variants={itemVariants} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Graph Topology</Typography>
            <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', minHeight: 300 }}>
              {/* Fake Graph SVG Background */}
              <Box sx={{ 
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                opacity: 0.6,
                backgroundImage: `radial-gradient(circle at 50% 50%, ${alpha(theme.palette.info.main, 0.1)} 0%, transparent 60%)` 
              }} />
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <HubRoundedIcon sx={{ fontSize: 120, color: alpha(theme.palette.text.secondary, 0.2) }} />
                {/* Overlaying nodes */}
                <Box sx={{ position: 'absolute', top: '30%', left: '20%', width: 8, height: 8, borderRadius: '50%', bgcolor: theme.palette.info.main, boxShadow: `0 0 10px ${theme.palette.info.main}` }} />
                <Box sx={{ position: 'absolute', top: '60%', left: '70%', width: 12, height: 12, borderRadius: '50%', bgcolor: theme.palette.success.main, boxShadow: `0 0 10px ${theme.palette.success.main}` }} />
                <Box sx={{ position: 'absolute', top: '20%', right: '30%', width: 6, height: 6, borderRadius: '50%', bgcolor: theme.palette.warning.main }} />
                
                {/* SVG Connecting lines */}
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                  <line x1="20%" y1="30%" x2="50%" y2="50%" stroke={alpha(theme.palette.text.disabled, 0.3)} strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="70%" y1="60%" x2="50%" y2="50%" stroke={alpha(theme.palette.text.disabled, 0.3)} strokeWidth="2" />
                  <line x1="70%" y1="20%" x2="50%" y2="50%" stroke={alpha(theme.palette.text.disabled, 0.3)} strokeWidth="1" />
                </svg>
              </Box>
              
              <Box sx={{ p: 2, bgcolor: theme.palette.background.muted, borderTop: `1px solid ${theme.palette.divider}`, zIndex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Topology Status</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">Entity Extraction</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Active</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Model</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>{stats?.llm_model || 'Standard'}</Typography>
                </Box>
                <Button fullWidth variant="outlined" size="small" sx={{ mt: 2, borderRadius: 2 }}>
                  Open Explorer
                </Button>
              </Box>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;
