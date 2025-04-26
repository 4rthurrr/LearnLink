import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Divider,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Article as ArticleIcon,
  Tag as TagIcon
} from '@mui/icons-material';

import PostCard from '../components/post/PostCard';
import userService from '../services/userService';
import postService from '../services/postService';

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tabValue, setTabValue] = useState(0);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [topics, setTopics] = useState([]);
  const [followingStatus, setFollowingStatus] = useState({});
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      search(q);
    } else {
      // Load trending topics if no query
      fetchTrendingTopics();
    }
  }, [searchParams]);

  const fetchTrendingTopics = async () => {
    try {
      setLoading(true);
      const response = await postService.getTrendingTopics();
      setTopics(response.data);
    } catch (error) {
      console.error('Error fetching trending topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const search = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    
    try {
      // Search based on current tab
      if (tabValue === 0) {
        // Search all
        const [usersResponse, postsResponse] = await Promise.all([
          userService.searchUsers(searchQuery),
          postService.searchPosts(searchQuery)
        ]);
        setUsers(usersResponse.data.content);
        setPosts(postsResponse.data.content);
      } else if (tabValue === 1) {
        // Search users
        const response = await userService.searchUsers(searchQuery);
        setUsers(response.data.content);
      } else if (tabValue === 2) {
        // Search posts
        const response = await postService.searchPosts(searchQuery);
        setPosts(response.data.content);
      } else if (tabValue === 3) {
        // Search topics/hashtags
        const response = await postService.getPostsByTopic(searchQuery);
        setPosts(response.data.content);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ q: query });
    search(query);
  };

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
    if (query) {
      search(query);
    }
  };

  const handleToggleFollow = async (userId) => {
    try {
      setProcessing(prev => ({ ...prev, [userId]: true }));
      const response = await userService.toggleFollow(userId);
      
      setFollowingStatus(prev => ({
        ...prev,
        [userId]: response.data.following
      }));
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setProcessing(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleTopicClick = (topicName) => {
    setQuery(topicName);
    setSearchParams({ q: topicName });
    setTabValue(3); // Switch to topics tab
    search(topicName);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Explore
      </Typography>
      
      {/* Search Bar */}
      <Box component="form" onSubmit={handleSearch} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for users, posts, or topics..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: loading ? (
              <InputAdornment position="end">
                <CircularProgress size={24} />
              </InputAdornment>
            ) : null
          }}
        />
      </Box>
      
      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={handleChangeTab}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{ mb: 3 }}
      >
        <Tab icon={<SearchIcon />} label="All" />
        <Tab icon={<PersonIcon />} label="People" />
        <Tab icon={<ArticleIcon />} label="Posts" />
        <Tab icon={<TagIcon />} label="Topics" />
      </Tabs>
      
      {/* Search Results */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : query ? (
        <>
          {/* Show users if on All or People tab */}
          {(tabValue === 0 || tabValue === 1) && (
            <>
              <Typography variant="h6" gutterBottom>
                People
              </Typography>
              {users.length === 0 ? (
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  No users found matching "{query}"
                </Typography>
              ) : (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {users.map(user => (
                    <Grid item xs={12} sm={6} md={4} key={user.id}>
                      <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            src={user.imageUrl}
                            alt={user.name}
                            sx={{ width: 56, height: 56, mr: 2 }}
                          />
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6">{user.name}</Typography>
                            {user.bio && (
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {user.bio}
                              </Typography>
                            )}
                          </Box>
                          <Button
                            variant={followingStatus[user.id] ? "outlined" : "contained"}
                            size="small"
                            onClick={() => handleToggleFollow(user.id)}
                            disabled={processing[user.id]}
                          >
                            {followingStatus[user.id] ? 'Following' : 'Follow'}
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
              {tabValue === 0 && <Divider sx={{ mb: 3 }} />}
            </>
          )}
          
          {/* Show posts if on All, Posts, or Topics tab */}
          {(tabValue === 0 || tabValue === 2 || tabValue === 3) && (
            <>
              <Typography variant="h6" gutterBottom>
                {tabValue === 3 ? `Posts with #${query}` : 'Posts'}
              </Typography>
              {posts.length === 0 ? (
                <Typography color="text.secondary">
                  No posts found {tabValue === 3 ? `with topic #${query}` : `matching "${query}"`}
                </Typography>
              ) : (
                posts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
            </>
          )}
        </>
      ) : (
        // Show trending topics when no search query
        <>
          <Typography variant="h6" gutterBottom>
            Trending Topics
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
            {topics.map(topic => (
              <Chip
                key={topic.name}
                icon={<TagIcon />}
                label={`${topic.name} (${topic.count})`}
                onClick={() => handleTopicClick(topic.name)}
                clickable
                color="primary"
                variant="outlined"
              />
            ))}
            {topics.length === 0 && !loading && (
              <Typography color="text.secondary">
                No trending topics available right now
              </Typography>
            )}
          </Box>
        </>
      )}
    </Container>
  );
};

export default Explore;
