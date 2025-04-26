import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Divider,
  Box,
  Skeleton
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import userService from '../../services/userService';

const UserSuggestions = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingStatus, setFollowingStatus] = useState({});
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response = await userService.getSuggestions(5);
      setSuggestions(response?.data || []);
      
      // Initialize following status
      const initialStatus = {};
      if (response?.data) {
        response.data.forEach(suggestion => {
          initialStatus[suggestion.id] = false;
        });
      }
      setFollowingStatus(initialStatus);
    } catch (error) {
      console.error('Error fetching user suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async (userId) => {
    if (!user) return;
    
    try {
      setProcessing(prev => ({ ...prev, [userId]: true }));
      const response = await userService.toggleFollow(userId);
      
      setFollowingStatus(prev => ({
        ...prev,
        [userId]: response.data.following
      }));
    } catch (error) {
      console.error('Error toggling follow status:', error);
    } finally {
      setProcessing(prev => ({ ...prev, [userId]: false }));
    }
  };

  // If user is not logged in or there are no suggestions, don't render anything
  if (!user && suggestions.length === 0 && !loading) {
    return null;
  }

  return (
    <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
      <Typography variant="h6" sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        People to Follow
      </Typography>
      
      {loading ? (
        <List disablePadding>
          {[1, 2, 3].map((item) => (
            <ListItem key={item} sx={{ py: 1.5 }}>
              <ListItemAvatar>
                <Skeleton variant="circular" width={40} height={40} />
              </ListItemAvatar>
              <ListItemText 
                primary={<Skeleton width="80%" />} 
                secondary={<Skeleton width="60%" />} 
              />
              <Skeleton variant="rectangular" width={80} height={36} />
            </ListItem>
          ))}
        </List>
      ) : suggestions && suggestions.length > 0 ? (
        <List disablePadding>
          {suggestions.map((suggestion, index) => (
            <React.Fragment key={suggestion.id}>
              <ListItem sx={{ py: 1.5 }}>
                <ListItemAvatar>
                  <Avatar
                    component={Link}
                    to={`/profile/${suggestion.id}`}
                    src={suggestion.imageUrl}
                    alt={suggestion.name}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      component={Link}
                      to={`/profile/${suggestion.id}`}
                      sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 500 }}
                    >
                      {suggestion.name}
                    </Typography>
                  }
                  secondary={suggestion.bio ? `${suggestion.bio.substring(0, 30)}...` : ''}
                />
                <Button
                  size="small"
                  variant={followingStatus[suggestion.id] ? "outlined" : "contained"}
                  disabled={processing[suggestion.id]}
                  onClick={() => handleToggleFollow(suggestion.id)}
                >
                  {followingStatus[suggestion.id] ? 'Following' : 'Follow'}
                </Button>
              </ListItem>
              {index < suggestions.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No suggestions available at the moment
          </Typography>
        </Box>
      )}
      
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Button component={Link} to="/explore" size="small">
          See More
        </Button>
      </Box>
    </Paper>
  );
};

export default UserSuggestions;