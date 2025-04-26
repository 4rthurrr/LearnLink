import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Skeleton,
  Box
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Tag as TagIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import postService from '../../services/postService';

const TrendingTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingTopics = async () => {
      try {
        const response = await postService.getTrendingTopics();
        setTopics(response.data);
      } catch (error) {
        console.error('Error fetching trending topics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingTopics();
  }, []);

  if (topics.length === 0 && !loading) return null;

  return (
    <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
      <Typography variant="h6" sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Trending Topics
      </Typography>
      
      {loading ? (
        <List>
          {[...Array(5)].map((_, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <Skeleton variant="circular" width={24} height={24} />
              </ListItemIcon>
              <ListItemText primary={<Skeleton width="60%" />} />
              <Skeleton variant="rectangular" width={40} height={24} />
            </ListItem>
          ))}
        </List>
      ) : (
        <List>
          {topics.map((topic) => (
            <ListItem
              key={topic.name}
              component={Link}
              to={`/topics/${topic.name}`}
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <ListItemIcon>
                <TagIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText primary={topic.name} />
              <Chip 
                label={topic.count} 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
            </ListItem>
          ))}
        </List>
      )}
      
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Topics with the most engagement in the last 7 days
        </Typography>
      </Box>
    </Paper>
  );
};

export default TrendingTopics;
