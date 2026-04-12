import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Chip,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import StorageIcon from '@mui/icons-material/Storage';
import ChatIcon from '@mui/icons-material/Chat';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DescriptionIcon from '@mui/icons-material/Description';
import TimelineIcon from '@mui/icons-material/Timeline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const Dashboard = ({ darkMode }) => {
  const [stats, setStats] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
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
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ 
      height: '100%',
      borderRadius: 3,
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            backgroundColor: `${color}20`,
            borderRadius: 2,
            p: 1,
            mr: 2
          }}>
            {icon}
          </Box>
          <Box>
            <Typography variant="h6" color="text.secondary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 600, color: color }}>
          {value?.toLocaleString() || '0'}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">System Dashboard</Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={fetchAllData}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Documents"
            value={documents.length}
            icon={<DescriptionIcon sx={{ color: '#0088FE' }} />}
            color="#0088FE"
            subtitle="Uploaded files"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Vector Chunks"
            value={stats?.vector_store?.total_chunks || 0}
            icon={<StorageIcon sx={{ color: '#00C49F' }} />}
            color="#00C49F"
            subtitle="Embedded segments"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Graph Entities"
            value={stats?.knowledge_graph?.entity_count || 0}
            icon={<AccountTreeIcon sx={{ color: '#FFBB28' }} />}
            color="#FFBB28"
            subtitle="Knowledge graph"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Active Sessions"
            value={stats?.sessions?.active || 0}
            icon={<ChatIcon sx={{ color: '#FF8042' }} />}
            color="#FF8042"
            subtitle="Conversations"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Overview
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                <ListItem>
                  <ListItemText 
                    primary="LLM Model"
                    secondary={
                      <Chip 
                        label={stats?.llm_model || 'N/A'} 
                        color="primary" 
                        size="small" 
                      />
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Vector Database"
                    secondary={stats?.vector_store?.collection_name || 'ChromaDB'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Embedding Model"
                    secondary={stats?.vector_store?.embedding_model || 'all-MiniLM-L6-v2'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Total Messages"
                    secondary={stats?.sessions?.total_messages || 0}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Storage Usage
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Documents Storage
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((documents.length / 100) * 100, 100)}
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {documents.length} / 100 documents
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Vector Store Usage
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(((stats?.vector_store?.total_chunks || 0) / 10000) * 100, 100)}
                  sx={{ height: 10, borderRadius: 5 }}
                  color="secondary"
                />
                <Typography variant="caption" color="text.secondary">
                  {stats?.vector_store?.total_chunks || 0} / 10,000 chunks
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Documents
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {documents.length > 0 ? (
                <List>
                  {documents.slice(0, 5).map((doc, index) => (
                    <ListItem key={index} divider={index < documents.length - 1}>
                      <ListItemText
                        primary={doc.filename}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              Size: {doc.size_mb} MB
                            </Typography>
                            <Typography variant="caption" display="block">
                              Uploaded: {new Date(doc.uploaded_at).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                      <Chip 
                        label={`${doc.size_mb} MB`}
                        size="small"
                        variant="outlined"
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" sx={{ p: 2 }}>
                  No documents uploaded yet. Go to the Upload tab to add documents.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;