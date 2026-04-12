import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Alert,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Tooltip,
  Collapse
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';

const DocumentUpload = ({ darkMode }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [expandedFile, setExpandedFile] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setError(`${rejectedFiles.length} file(s) rejected. Please upload PDF or TXT files only.`);
    }
    
    setFiles(prev => [...prev, ...acceptedFiles.map(file => ({
      file,
      status: 'pending',
      progress: 0,
      result: null
    }))]);
    
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    maxSize: 16 * 1024 * 1024 // 16MB
  });

  const uploadFile = async (fileItem, index) => {
    const formData = new FormData();
    formData.append('file', fileItem.file);

    try {
      // Update progress
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'uploading', progress: 30 } : f
      ));

      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setFiles(prev => prev.map((f, i) => 
          i === index ? { 
            ...f, 
            status: 'completed', 
            progress: 100, 
            result: data 
          } : f
        ));
        setSuccess(`Successfully processed ${fileItem.file.name}`);
        setTimeout(() => setSuccess(null), 5000);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'error', error: error.message } : f
      ));
      setError(`Failed to upload ${fileItem.file.name}: ${error.message}`);
    }
  };

  const handleUploadAll = async () => {
    setUploading(true);
    setError(null);

    const pendingFiles = files.filter(f => f.status === 'pending');
    
    for (let i = 0; i < pendingFiles.length; i++) {
      const fileIndex = files.findIndex(f => f === pendingFiles[i]);
      await uploadFile(pendingFiles[i], fileIndex);
    }

    setUploading(false);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status !== 'completed'));
  };

  const getFileIcon = (filename) => {
    if (filename.endsWith('.pdf')) return <PictureAsPdfIcon color="error" />;
    if (filename.endsWith('.txt')) return <TextSnippetIcon color="primary" />;
    return <DescriptionIcon />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'error': return 'error';
      case 'uploading': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper
            {...getRootProps()}
            sx={{
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: isDragActive 
                ? (darkMode ? '#1e3a5f' : '#e3f2fd')
                : (darkMode ? '#1e1e1e' : '#fafafa'),
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'divider',
              borderRadius: 3,
              mb: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: darkMode ? '#2d2d2d' : '#f5f5f5'
              }
            }}
          >
            <input {...getInputProps()} />
            <CloudUploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              {isDragActive ? 'Drop files here' : 'Upload Documents'}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Drag & drop files here, or click to select
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2 }}>
              <Chip label="PDF" icon={<PictureAsPdfIcon />} variant="outlined" />
              <Chip label="TXT" icon={<TextSnippetIcon />} variant="outlined" />
              <Chip label="Max 16MB" variant="outlined" />
            </Box>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          {files.length > 0 && (
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2 
              }}>
                <Typography variant="h6">
                  Files ({files.length})
                </Typography>
                <Box>
                  <Button 
                    onClick={clearCompleted} 
                    disabled={uploading}
                    sx={{ mr: 1 }}
                    size="small"
                  >
                    Clear Completed
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleUploadAll}
                    disabled={uploading || !files.some(f => f.status === 'pending')}
                    startIcon={<CloudUploadIcon />}
                  >
                    {uploading ? 'Processing...' : 'Upload All'}
                  </Button>
                </Box>
              </Box>

              <List>
                {files.map((fileItem, index) => (
                  <Card 
                    key={index} 
                    variant="outlined" 
                    sx={{ mb: 1, borderRadius: 2 }}
                  >
                    <ListItem>
                      <ListItemIcon>
                        {getFileIcon(fileItem.file.name)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">
                              {fileItem.file.name}
                            </Typography>
                            <Chip 
                              label={fileItem.status} 
                              size="small" 
                              color={getStatusColor(fileItem.status)}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              Size: {(fileItem.file.size / 1024).toFixed(2)} KB
                            </Typography>
                            {fileItem.status === 'completed' && fileItem.result && (
                              <>
                                <Typography variant="caption" display="block" color="success.main">
                                  ✓ Chunks: {fileItem.result.chunks} | 
                                  Entities: {fileItem.result.entities_found} | 
                                  Relationships: {fileItem.result.relationships_found}
                                </Typography>
                                <Typography variant="caption" display="block" color="text.secondary">
                                  Processing time: {fileItem.result.processing_time_seconds}s
                                </Typography>
                              </>
                            )}
                            {fileItem.status === 'error' && (
                              <Typography variant="caption" display="block" color="error">
                                Error: {fileItem.error}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {fileItem.status === 'uploading' && (
                          <Box sx={{ width: 100, mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={fileItem.progress} 
                            />
                          </Box>
                        )}
                        {fileItem.status === 'completed' && (
                          <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                        )}
                        {fileItem.status === 'error' && (
                          <ErrorIcon color="error" sx={{ mr: 1 }} />
                        )}
                        {fileItem.status !== 'uploading' && (
                          <Tooltip title="Remove">
                            <IconButton 
                              size="small" 
                              onClick={() => removeFile(index)}
                              disabled={uploading}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </ListItem>
                  </Card>
                ))}
              </List>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InfoIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">Information</Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Upload PDF or TXT documents to build your knowledge base. 
                The system will:
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="📄 Extract text content"
                    secondary="Automatically processes PDF and text files"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="🔍 Create semantic embeddings"
                    secondary="Enable intelligent similarity search"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="🕸️ Build knowledge graph"
                    secondary="Extract entities and relationships"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="💬 Enable Q&A"
                    secondary="Ask questions about your documents"
                  />
                </ListItem>
              </List>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Tip:</strong> Upload multiple documents to create a comprehensive knowledge base.
                  The system will automatically link related information across documents.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DocumentUpload;