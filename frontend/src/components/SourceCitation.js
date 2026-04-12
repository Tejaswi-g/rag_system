import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Tooltip,
  IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArticleIcon from '@mui/icons-material/Article';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import InfoIcon from '@mui/icons-material/Info';

const SourceCitation = ({ sources, darkMode }) => {
  const [expanded, setExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  const getRelevanceColor = (score) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.5) return 'warning';
    return 'default';
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Accordion 
        expanded={expanded} 
        onChange={() => setExpanded(!expanded)}
        sx={{
          backgroundColor: darkMode ? '#2d2d2d' : '#f5f5f5',
          borderRadius: '8px !important',
          '&:before': { display: 'none' }
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ArticleIcon fontSize="small" color="primary" />
            <Typography variant="body2" fontWeight={500}>
              Sources ({sources.length})
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List dense disablePadding>
            {sources.map((source, index) => (
              <ListItem 
                key={index} 
                sx={{ 
                  display: 'block', 
                  mb: 2,
                  p: 1.5,
                  backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="subtitle2" color="primary">
                    {source.filename}
                  </Typography>
                  <Chip 
                    label={`Chunk ${source.chunk_index}`} 
                    size="small" 
                    variant="outlined"
                  />
                  <Tooltip title={`Relevance Score: ${(source.relevance_score * 100).toFixed(1)}%`}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Relevance:
                      </Typography>
                      <Box sx={{ width: 60 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={source.relevance_score * 100}
                          color={getRelevanceColor(source.relevance_score)}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {(source.relevance_score * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                  </Tooltip>
                </Box>
                
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    fontStyle: 'italic',
                    p: 1,
                    backgroundColor: darkMode ? '#2d2d2d' : '#f5f5f5',
                    borderRadius: 1,
                    borderLeft: '3px solid',
                    borderColor: 'primary.main'
                  }}
                >
                  "{source.preview}"
                </Typography>
              </ListItem>
            ))}
          </List>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <InfoIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              Sources are ranked by relevance to your query
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default SourceCitation;