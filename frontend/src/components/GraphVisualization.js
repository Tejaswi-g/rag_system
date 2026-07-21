import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Drawer,
  alpha,
  useTheme,
  Paper,
  Collapse,
  LinearProgress
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

// Icons
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import MemoryIcon from '@mui/icons-material/Memory';
import CloudOffIcon from '@mui/icons-material/CloudOff';

// Charts
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

// ─── Entity Type Color Mapping ────────────────────────────────────────────
const ENTITY_COLORS = {
  ORG: '#0EA5E9',
  PERSON: '#10B981',
  GPE: '#F59E0B',
  DATE: '#8B5CF6',
  PRODUCT: '#EC4899',
  EVENT: '#F97316',
  WORK_OF_ART: '#06B6D4',
  LAW: '#EF4444',
  NORP: '#14B8A6',
  FAC: '#6366F1',
  LOC: '#0EA5E9',
  LANGUAGE: '#A855F7',
  RELATED: '#6B7280',
  UNKNOWN: '#6B7280',
  DEFAULT: '#6B7280'
};

const CHART_COLORS = ['#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#F97316', '#06B6D4', '#EF4444', '#14B8A6', '#6366F1'];

const getEntityColor = (label) => ENTITY_COLORS[label] || ENTITY_COLORS.DEFAULT;

// ─── Motion Variants ──────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

// ─── GraphVisualization Component ─────────────────────────────────────────
const GraphVisualization = ({ darkMode }) => {
  const theme = useTheme();
  const mode = theme.palette.mode;

  // State
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [entityTypeFilter, setEntityTypeFilter] = useState('all');
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [storageMode, setStorageMode] = useState('memory');

  // ─── API Base URL ──────────────────────────────────────────────────────
  const API_BASE = 'http://localhost:5000';

  // ─── Data Fetching ──────────────────────────────────────────────────────
  useEffect(() => {
    fetchStats();
    checkDocumentStatus();
  }, []);

  const checkDocumentStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/documents`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      console.log('📄 Documents:', data);
      
      const processedDocs = data.filter(doc => doc.processed);
      console.log('✅ Processed documents:', processedDocs);
      
      setDebugInfo({
        totalDocs: data.length,
        processedDocs: processedDocs.length,
        documents: data
      });
      
      if (data.length === 0) {
        setError('📄 No documents uploaded. Please upload documents first.');
      } else if (processedDocs.length === 0) {
        setError('📄 Documents uploaded but not processed. Click "Process Documents" to extract entities.');
      }
    } catch (error) {
      console.error('❌ Error checking documents:', error);
    }
  };

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/graph/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      console.log('📊 Graph Stats:', data);
      setStats(data);
      
      // Check storage mode
      if (data.mode && data.mode.includes('MEMORY')) {
        setStorageMode('memory');
      } else if (data.database) {
        setStorageMode('arangodb');
      }
      
      if (data.entity_count === 0 && data.relationship_count === 0) {
        setError('🔍 No entities or relationships found. Process your documents to build the knowledge graph.');
      } else {
        setError(null);
      }
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      setError('Failed to load knowledge graph statistics. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  const processDocuments = async () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setError(null);

    try {
      // Start processing
      const response = await fetch(`${API_BASE}/documents/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to start processing');

      const data = await response.json();
      console.log('🔄 Processing started:', data);

      // Simulate progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress > 100) progress = 100;
        setProcessingProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setProcessingProgress(0);
          // Refresh stats after processing
          setTimeout(async () => {
            await fetchStats();
            await checkDocumentStatus();
            setError('✅ Documents processed successfully! Entities and relationships extracted.');
            setTimeout(() => setError(null), 5000);
          }, 1000);
        }
      }, 300);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(interval);
        if (progress < 100) {
          setIsProcessing(false);
          setProcessingProgress(0);
          setError('⏱️ Processing timed out. Please try again.');
        }
      }, 30000);

    } catch (error) {
      console.error('❌ Error processing documents:', error);
      setError('Failed to process documents: ' + error.message);
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const handleSearch = useCallback(async (queryOverride) => {
    const query = queryOverride !== undefined ? queryOverride : searchQuery;
    if (!query.trim()) return;

    setSearching(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/graph/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 50 })
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }
      const data = await response.json();
      console.log('🔍 Search results:', data);
      setSearchResults(data.results || []);
      
      if (data.results?.length === 0) {
        setError(`🔍 No entities found matching "${query}". Try a different search term.`);
      } else {
        setError(null);
      }
    } catch (error) {
      console.error('❌ Error searching:', error);
      setError('Search failed: ' + error.message);
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') handleSearch();
  }, [handleSearch]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedEntity(null);
    setInspectorOpen(false);
    setError(null);
  }, []);

  // ─── Entity Selection ───────────────────────────────────────────────────
  const handleSelectEntity = useCallback((entity) => {
    setSelectedEntity(entity);
    setInspectorOpen(true);
  }, []);

  const handleCloseInspector = useCallback(() => {
    setInspectorOpen(false);
    setSelectedEntity(null);
  }, []);

  // ─── Derived Data ───────────────────────────────────────────────────────
  const entityTypes = [...new Set((searchResults.length > 0 ? searchResults : stats?.top_entities || []).map(e => e.label))];

  const displayedEntities =
    searchResults.length > 0
      ? searchResults
      : (stats?.top_entities || []);

  const filteredResults =
    displayedEntities.filter(entity =>
      entityTypeFilter === "all" ||
      entity.label === entityTypeFilter
    );

  // Entity category distribution for bar chart
  const entityCategoryData = (stats?.top_entities || []).reduce((acc, e) => {
    const label = e.label || 'UNKNOWN';
    const existing = acc.find(item => item.name === label);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ name: label, count: 1, fill: getEntityColor(label) });
    }
    return acc;
  }, []).sort((a, b) => b.count - a.count);

  // ─── Loading State ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 2 }}>
        <CircularProgress size={48} thickness={4} sx={{ color: theme.palette.info.main }} />
        <Typography variant="body2" color="text.secondary">Loading knowledge graph data...</Typography>
      </Box>
    );
  }

  // ─── KPI Card Component ─────────────────────────────────────────────────
  const KpiCard = ({ title, value, icon, color, subtitle }) => (
    <Card
      component={motion.div}
      variants={itemVariants}
      sx={{
        height: '100%',
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.02)} 100%)`,
        border: `1px solid ${alpha(color, 0.15)}`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: `0 12px 24px ${alpha(color, 0.1)}`
        }
      }}
    >
      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            backgroundColor: alpha(color, 0.12),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color
          }}>
            {icon}
          </Box>
          {subtitle && (
            <Chip
              label={subtitle}
              size="small"
              sx={{
                height: 22,
                fontSize: 10,
                fontWeight: 600,
                backgroundColor: alpha(color, 0.1),
                color: color,
                borderRadius: 1
              }}
            />
          )}
        </Box>
        <Typography variant="h4">
          {typeof value === "number"
            ? value.toLocaleString()
            : (value || "-")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
      </CardContent>
      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, transparent)` }} />
    </Card>
  );

  // ─── Entity Card Component ──────────────────────────────────────────────
  const EntityCard = ({ entity, index }) => {
    const isSelected = selectedEntity?.entity_id === entity.entity_id;
    const color = getEntityColor(entity.label);

    return (
      <Card
        component={motion.div}
        variants={cardVariants}
        whileHover={{ y: -4 }}
        onClick={() => handleSelectEntity(entity)}
        sx={{
          borderRadius: 2.5,
          cursor: 'pointer',
          border: `1px solid ${isSelected ? alpha(color, 0.5) : theme.palette.divider}`,
          boxShadow: isSelected ? `0 0 0 2px ${alpha(color, 0.2)}, 0 4px 12px ${alpha(color, 0.1)}` : 'none',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          bgcolor: isSelected ? alpha(color, 0.04) : 'background.paper',
          position: 'relative',
          '&:hover': {
            borderColor: alpha(color, 0.4),
            boxShadow: `0 8px 24px ${alpha(color, 0.08)}`,
            bgcolor: alpha(color, 0.02)
          }
        }}
      >
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: 15, lineHeight: 1.3, mr: 1 }}>
              {entity.text}
            </Typography>
            <Chip
              label={entity.label}
              size="small"
              sx={{
                height: 22,
                fontSize: 10,
                fontWeight: 700,
                backgroundColor: alpha(color, 0.12),
                color: color,
                borderRadius: 1,
                letterSpacing: '0.02em',
                flexShrink: 0
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2.5 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, fontWeight: 500, display: 'block', mb: 0.25 }}>
                Frequency
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14 }}>
                {entity.frequency}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, fontWeight: 500, display: 'block', mb: 0.25 }}>
                Documents
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14 }}>
                {entity.document_count || 1}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <Box
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="show"
      sx={{ display: 'flex', flexDirection: 'column', gap: 4, pb: 4 }}
    >
      {/* Debug Information */}
      <Collapse in={showDebug}>
        <Box sx={{ mb: 2, p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2, border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              🐛 Debug Information
            </Typography>
            <IconButton size="small" onClick={() => setShowDebug(false)}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 1 }} />
          <Typography variant="body2" component="pre" sx={{ fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {JSON.stringify(debugInfo, null, 2)}
          </Typography>
          <Typography variant="body2" component="pre" sx={{ fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all', mt: 1 }}>
            {JSON.stringify(stats, null, 2)}
          </Typography>
        </Box>
      </Collapse>

      {/* ═══════════════════════════════════════════════════════════════════
          1. KNOWLEDGE OVERVIEW HERO
         ═══════════════════════════════════════════════════════════════════ */}
      <Box
        component={motion.div}
        variants={itemVariants}
        sx={{
          position: 'relative',
          borderRadius: 4,
          overflow: 'hidden',
          p: { xs: 3, md: 5 },
          background: mode === 'light'
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.info.main, 0.06)} 100%)`
            : `linear-gradient(135deg, ${alpha('#0EA5E9', 0.06)} 0%, ${alpha('#0F172A', 0.3)} 100%)`,
          border: `1px solid ${alpha(theme.palette.info.main, 0.08)}`,
          isolation: 'isolate'
        }}
      >
        {/* Abstract Background Graphic */}
        <Box sx={{
          position: 'absolute',
          right: '-5%',
          top: '-30%',
          width: '45%',
          height: '160%',
          background: `radial-gradient(circle at 50% 50%, ${alpha(theme.palette.info.main, 0.08)} 0%, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(40px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.info.main, 0.12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.palette.info.main
              }}>
                <HubRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '0.08em', color: theme.palette.info.main, fontSize: 12 }}>
                Knowledge Intelligence
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={storageMode === 'memory' ? 'In-Memory Storage (No Database)' : 'ArangoDB Storage'}>
                <Chip
                  size="small"
                  icon={storageMode === 'memory' ? <MemoryIcon /> : <StorageRoundedIcon />}
                  label={storageMode === 'memory' ? 'In-Memory' : 'ArangoDB'}
                  color={storageMode === 'memory' ? 'warning' : 'success'}
                  sx={{ height: 28 }}
                />
              </Tooltip>
              <Tooltip title="Toggle Debug Info">
                <IconButton size="small" onClick={() => setShowDebug(!showDebug)} sx={{ color: theme.palette.text.secondary }}>
                  <InfoRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Title & Description */}
          <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: '-0.03em', mb: 1, lineHeight: 1.2 }}>
            Knowledge Explorer
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mb: 4, lineHeight: 1.7, fontSize: 15 }}>
            Explore entities and relationships extracted from your documents. The knowledge graph organizes your content into an intelligent, searchable network.
          </Typography>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert 
                  severity={
                    error.includes('No entities') || 
                    error.includes('No documents') || 
                    error.includes('uploaded') ? 'warning' : 
                    error.includes('Failed') ? 'error' : 'info'
                  } 
                  sx={{ mb: 3, borderRadius: 2 }}
                  onClose={() => setError(null)}
                  action={
                    (error.includes('No entities') || error.includes('uploaded')) ? (
                      <Button 
                        color="inherit" 
                        size="small" 
                        onClick={processDocuments}
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Processing...' : 'Process Documents'}
                      </Button>
                    ) : undefined
                  }
                >
                  {isProcessing && (
                    <Box sx={{ mt: 1, width: '100%' }}>
                      <LinearProgress variant="determinate" value={processingProgress} sx={{ height: 8, borderRadius: 4 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        Processing documents... {Math.round(processingProgress)}%
                      </Typography>
                    </Box>
                  )}
                  {error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* KPI Cards */}
          <Grid container spacing={2.5}>
            <Grid item xs={6} sm={3}>
              <KpiCard
                title="Total Entities"
                value={stats?.entity_count}
                icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 22 }} />}
                color={theme.palette.info.main}
                subtitle="Extracted"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <KpiCard
                title="Relationships"
                value={stats?.relationship_count}
                icon={<HubRoundedIcon sx={{ fontSize: 22 }} />}
                color={theme.palette.success.main}
                subtitle="Connected"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <KpiCard
                title="Storage Mode"
                value={stats?.database || 'In-Memory'}
                icon={storageMode === 'memory' ? <MemoryIcon sx={{ fontSize: 22 }} /> : <StorageRoundedIcon sx={{ fontSize: 22 }} />}
                color={storageMode === 'memory' ? theme.palette.warning.main : theme.palette.success.main}
                subtitle={storageMode === 'memory' ? '⚠️ Volatile' : 'Persistent'}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <KpiCard
                title="Status"
                value="Active"
                icon={<AccountTreeRoundedIcon sx={{ fontSize: 22 }} />}
                color={theme.palette.secondary.main}
                subtitle="GraphRAG Ready"
              />
            </Grid>
          </Grid>

          {/* Storage Mode Warning */}
          {storageMode === 'memory' && (
            <Alert 
              severity="info" 
              sx={{ mt: 3, borderRadius: 2 }}
              icon={<CloudOffIcon />}
            >
              <Typography variant="body2">
                <strong>In-Memory Storage Mode:</strong> Data is stored in memory and will be lost when the server restarts. 
                To enable persistent storage, configure ArangoDB in your backend.
              </Typography>
            </Alert>
          )}
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════════════════════════
          2. ENTITY EXPLORER
         ═══════════════════════════════════════════════════════════════════ */}
      <Box sx={{ display: 'flex', gap: 3, position: 'relative' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Search Bar */}
          <Box
            component={motion.div}
            variants={itemVariants}
            sx={{ mb: 3 }}
          >
            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: 3,
                border: `1px solid ${searchQuery ? alpha(theme.palette.info.main, 0.3) : theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
                px: 2,
                py: 0.75,
                transition: 'all 0.25s ease',
                '&:focus-within': {
                  borderColor: theme.palette.info.main,
                  boxShadow: `0 0 0 3px ${alpha(theme.palette.info.main, 0.12)}`
                }
              }}
            >
              <SearchRoundedIcon sx={{ color: searchQuery ? theme.palette.info.main : theme.palette.text.secondary, mr: 1.5, fontSize: 22 }} />
              <TextField
                fullWidth
                placeholder="Search entities, people, organizations, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  sx: { fontSize: 15, fontWeight: 500 }
                }}
              />
              {searchQuery && (
                <IconButton size="small" onClick={handleClearSearch} sx={{ mr: 0.5 }}>
                  <ClearRoundedIcon fontSize="small" />
                </IconButton>
              )}
              <Button
                variant="contained"
                color="info"
                onClick={() => handleSearch()}
                disabled={searching || !searchQuery.trim()}
                sx={{
                  borderRadius: 2,
                  px: 2.5,
                  py: 0.75,
                  minWidth: 80,
                  fontWeight: 600,
                  fontSize: 13,
                  ml: 1
                }}
              >
                {searching ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Search'}
              </Button>
            </Paper>

            {/* Type Filter Chips */}
            {entityTypes.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                <Chip
                  label="All Types"
                  size="small"
                  variant={entityTypeFilter === 'all' ? 'filled' : 'outlined'}
                  color={entityTypeFilter === 'all' ? 'info' : 'default'}
                  onClick={() => setEntityTypeFilter('all')}
                  sx={{ fontWeight: 600, fontSize: 11, borderRadius: 1 }}
                />
                {entityTypes.map(type => (
                  <Chip
                    key={type}
                    label={type}
                    size="small"
                    variant={entityTypeFilter === type ? 'filled' : 'outlined'}
                    onClick={() => setEntityTypeFilter(type)}
                    sx={{
                      fontWeight: 600,
                      fontSize: 11,
                      borderRadius: 1,
                      borderColor: alpha(getEntityColor(type), 0.3),
                      color: entityTypeFilter === type ? 'white' : getEntityColor(type),
                      bgcolor: entityTypeFilter === type ? getEntityColor(type) : alpha(getEntityColor(type), 0.06),
                      '&:hover': {
                        bgcolor: entityTypeFilter === type ? getEntityColor(type) : alpha(getEntityColor(type), 0.12)
                      }
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* Search Results */}
          <AnimatePresence mode="wait">
            {searching ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}
              >
                <CircularProgress size={32} thickness={4} sx={{ color: theme.palette.info.main }} />
              </motion.div>
            ) : filteredResults.length > 0 ? (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Found <strong style={{ color: theme.palette.text.primary }}>{filteredResults.length}</strong> entities
                    {searchQuery && <span> for "<strong>{searchQuery}</strong>"</span>}
                  </Typography>
                  <Tooltip title="Refresh">
                    <IconButton size="small" onClick={fetchStats}>
                      <RefreshRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Grid container spacing={2}>
                  <AnimatePresence>
                    {filteredResults.map((entity, index) => (
                      <Grid item xs={12} sm={6} lg={4} key={entity.entity_id || index}>
                        <EntityCard entity={entity} index={index} />
                      </Grid>
                    ))}
                  </AnimatePresence>
                </Grid>
              </motion.div>
            ) : searchQuery && !searching ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ textAlign: 'center', padding: '60px 20px' }}
              >
                <TravelExploreRoundedIcon sx={{ fontSize: 56, color: alpha(theme.palette.text.secondary, 0.2), mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  No Entities Found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No entities matching "{searchQuery}" were found in the knowledge graph.
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setError(null);
                  }}
                  sx={{ mt: 2 }}
                >
                  Clear Search
                </Button>
              </motion.div>
            ) : stats?.entity_count === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ textAlign: 'center', padding: '60px 20px' }}
              >
                <WarningRoundedIcon sx={{ fontSize: 56, color: alpha(theme.palette.warning.main, 0.3), mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Knowledge Graph is Empty
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
                  No entities or relationships found. Upload and process documents to build the knowledge graph.
                </Typography>
                <Button
                  variant="contained"
                  color="info"
                  onClick={processDocuments}
                  disabled={isProcessing}
                  startIcon={isProcessing ? <CircularProgress size={16} /> : null}
                >
                  {isProcessing ? 'Processing...' : 'Process Documents'}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="initial"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ textAlign: 'center', padding: '40px 20px' }}
              >
                <SearchRoundedIcon sx={{ fontSize: 48, color: alpha(theme.palette.text.secondary, 0.15), mb: 2 }} />
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Search the knowledge graph to discover entities
                </Typography>
                <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                  Try searching for "company", "person", or "technology"
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>

        {/* ── Entity Inspector Panel (Desktop) ─────────────────────────── */}
        {inspectorOpen && window.innerWidth >= 900 && selectedEntity && (
          <Box sx={{
            width: 340,
            flexShrink: 0,
            display: { xs: 'none', md: 'block' }
          }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                position: 'sticky',
                top: 16,
                overflow: 'hidden'
              }}
            >
              {selectedEntity && (
                <>
                  <Box sx={{
                    p: 2.5,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: alpha(getEntityColor(selectedEntity.label), 0.03)
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>
                      Entity Details
                    </Typography>
                    <IconButton size="small" onClick={handleCloseInspector}>
                      <CloseRoundedIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Box sx={{ p: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, letterSpacing: '-0.02em' }}>
                      {selectedEntity.text}
                    </Typography>
                    <Chip
                      label={selectedEntity.label}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: 11,
                        backgroundColor: alpha(getEntityColor(selectedEntity.label), 0.12),
                        color: getEntityColor(selectedEntity.label),
                        borderRadius: 1,
                        px: 0.5
                      }}
                    />
                  </Box>

                  <Box sx={{ p: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="overline" sx={{ fontWeight: 700, fontSize: 10, letterSpacing: '0.08em', color: 'text.secondary', mb: 2, display: 'block' }}>
                      Entity Overview
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Type</Typography>
                        <Chip
                          label={selectedEntity.label}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: 10,
                            backgroundColor: alpha(getEntityColor(selectedEntity.label), 0.1),
                            color: getEntityColor(selectedEntity.label),
                            borderRadius: 0.5,
                            height: 22
                          }}
                        />
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Frequency</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedEntity.frequency}</Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Documents</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedEntity.document_count || 1}</Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ p: 2.5 }}>
                    <Typography variant="overline" sx={{ fontWeight: 700, fontSize: 10, letterSpacing: '0.08em', color: 'text.secondary', mb: 2, display: 'block' }}>
                      Knowledge Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Entity ID</Typography>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 10, color: 'text.secondary', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>
                          {selectedEntity.entity_id?.substring(0, 16)}...
                        </Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Category</Typography>
                        <Chip
                          label={selectedEntity.label || 'UNKNOWN'}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600, fontSize: 10, height: 22 }}
                        />
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Occurrence Score</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {((selectedEntity.frequency || 1) * 10).toFixed(0)}%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}
            </Paper>
          </Box>
        )}
      </Box>

      {/* ═══════════════════════════════════════════════════════════════════
          3. KNOWLEDGE INSIGHTS
         ═══════════════════════════════════════════════════════════════════ */}
      {(stats?.entity_count > 0 || stats?.top_entities?.length > 0) && (
        <Box component={motion.div} variants={itemVariants}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <AutoAwesomeRoundedIcon sx={{ color: theme.palette.info.main, fontSize: 22 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              Knowledge Insights
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* ── Entity Category Distribution ──────────────── */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 15 }}>
                        Entity Category Distribution
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Breakdown of entity types in the knowledge graph
                      </Typography>
                    </Box>
                    <CategoryRoundedIcon sx={{ color: alpha(theme.palette.text.secondary, 0.3), fontSize: 28 }} />
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  {entityCategoryData.length > 0 ? (
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={entityCategoryData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} vertical={false} />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11, fontWeight: 600, fill: theme.palette.text.secondary }}
                            axisLine={{ stroke: alpha(theme.palette.divider, 0.3) }}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fontWeight: 500, fill: theme.palette.text.secondary }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                          />
                          <RechartsTooltip
                            contentStyle={{
                              borderRadius: 12,
                              border: `1px solid ${theme.palette.divider}`,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              backgroundColor: theme.palette.background.paper
                            }}
                          />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
                            {entityCategoryData.map((entry, index) => (
                              <Cell key={index} fill={entry.fill || CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">No category data available</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* ── Relationship Distribution ─────────────────── */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 15 }}>
                        Relationship Distribution
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Most frequent relationship types between entities
                      </Typography>
                    </Box>
                    <TimelineRoundedIcon sx={{ color: alpha(theme.palette.text.secondary, 0.3), fontSize: 28 }} />
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  {stats?.top_relationships?.length > 0 ? (
                    <Box sx={{ height: 300, display: 'flex', alignItems: 'center' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.top_relationships}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="count"
                            nameKey="predicate"
                          >
                            {stats.top_relationships.map((entry, index) => (
                              <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="transparent" />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            contentStyle={{
                              borderRadius: 12,
                              border: `1px solid ${theme.palette.divider}`,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              backgroundColor: theme.palette.background.paper
                            }}
                            formatter={(value, name) => [`${value} occurrences`, name]}
                          />
                          <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value) => (
                              <span style={{ fontSize: 11, fontWeight: 500, color: theme.palette.text.secondary }}>{value}</span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, flexDirection: 'column', gap: 1 }}>
                      <HubRoundedIcon sx={{ fontSize: 40, color: alpha(theme.palette.text.secondary, 0.15) }} />
                      <Typography variant="body2" color="text.secondary">No relationships found yet</Typography>
                      <Typography variant="caption" color="text.disabled">Relationships appear when multiple entities co-occur</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* ── Top Entities ──────────────────────────────────────────── */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 15 }}>
                        Most Frequent Entities
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Top entities by occurrence frequency across all documents
                      </Typography>
                    </Box>
                    <AutoAwesomeRoundedIcon sx={{ color: alpha(theme.palette.text.secondary, 0.3), fontSize: 28 }} />
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  {stats?.top_entities?.length > 0 ? (
                    <Grid container spacing={2}>
                      {stats.top_entities.map((entity, index) => {
                        const color = getEntityColor(entity.label);
                        return (
                          <Grid item xs={12} sm={6} md={4} lg={3} key={entity.entity_id || index}>
                            <Box
                              onClick={() => handleSelectEntity(entity)}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                p: 1.5,
                                borderRadius: 2,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                border: `1px solid transparent`,
                                '&:hover': {
                                  bgcolor: alpha(color, 0.04),
                                  borderColor: alpha(color, 0.15),
                                  transform: 'translateX(4px)'
                                }
                              }}
                            >
                              <Box sx={{
                                width: 28,
                                height: 28,
                                borderRadius: 1.5,
                                backgroundColor: alpha(color, 0.1),
                                color: color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: 12,
                                flexShrink: 0
                              }}>
                                {index + 1}
                              </Box>

                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {entity.text}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1.5, mt: 0.25 }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                                    Freq: {entity.frequency}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                                    Docs: {entity.document_count || 1}
                                  </Typography>
                                </Box>
                              </Box>

                              <Chip
                                label={entity.label}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: 9,
                                  fontWeight: 700,
                                  backgroundColor: alpha(color, 0.1),
                                  color: color,
                                  borderRadius: 0.5,
                                  flexShrink: 0
                                }}
                              />
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4, flexDirection: 'column', gap: 1 }}>
                      <DescriptionRoundedIcon sx={{ fontSize: 40, color: alpha(theme.palette.text.secondary, 0.15) }} />
                      <Typography variant="body2" color="text.secondary">No entities extracted yet</Typography>
                      <Typography variant="caption" color="text.disabled">Upload documents to populate the knowledge graph</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE INSPECTOR DRAWER
        ═══════════════════════════════════════════════════════════════════ */}
      <Drawer
        anchor="bottom"
        open={inspectorOpen && window.innerWidth < 900}
        onClose={handleCloseInspector}
        sx={{ display: { md: 'none' } }}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '80vh',
            p: 3
          }
        }}
      >
        {selectedEntity && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: theme.palette.divider }} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {selectedEntity.text}
              </Typography>
              <IconButton onClick={handleCloseInspector} size="small">
                <CloseRoundedIcon />
              </IconButton>
            </Box>

            <Chip
              label={selectedEntity.label}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: 11,
                backgroundColor: alpha(getEntityColor(selectedEntity.label), 0.12),
                color: getEntityColor(selectedEntity.label),
                borderRadius: 1,
                mb: 3
              }}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Frequency</Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedEntity.frequency}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Documents</Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedEntity.document_count || 1}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Category</Typography>
                <Chip label={selectedEntity.label || 'UNKNOWN'} size="small" sx={{ fontWeight: 600, fontSize: 10 }} />
              </Box>
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default GraphVisualization;