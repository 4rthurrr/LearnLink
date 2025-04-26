import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Avatar,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  Grid,
  Divider,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  School as SchoolIcon,
  Article as ArticleIcon
} from '@mui/icons-material';
import PostCard from '../components/post/PostCard';
import { useAuth } from '../hooks/useAuth';
import userService from '../services/userService';
import postService from '../services/postService';
import learningPlanService from '../services/learningPlanService';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [posts, setPosts] = useState([]);
  const [learningPlans, setLearningPlans] = useState([]);
  const [postPage, setPostPage] = useState(0);
  const [planPage, setPlanPage] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [hasMorePlans, setHasMorePlans] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [processingFollow, setProcessingFollow] = useState(false);

  // Check if profile is the current user's own profile
  const isOwnProfile = currentUser && currentUser.id === Number(id);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const [userResponse, followResponse] = await Promise.all([
          userService.getUserById(id),
          currentUser ? userService.getFollowStatus(id) : Promise.resolve({ data: { following: false } })
        ]);
        
        setProfileUser(userResponse.data);
        setFollowing(followResponse.data.following);
        setFollowerCount(userResponse.data.followerCount);
        setFollowingCount(userResponse.data.followingCount);
        
        // Reset tabs and data
        setTabValue(0);
        fetchUserPosts(0, false);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id, currentUser]);

  const fetchUserPosts = async (page = 0, append = false) => {
    try {
      setLoadingMore(true);
      const response = await postService.getUserPosts(id, page);
      
      const newPosts = response.data.content;
      if (newPosts.length === 0 || newPosts.length < 10) {
        setHasMorePosts(false);
      }
      
      setPosts(prev => append ? [...prev, ...newPosts] : newPosts);
      setPostPage(page);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const fetchUserLearningPlans = async (page = 0, append = false) => {
    try {
      setLoadingMore(true);
      const response = await learningPlanService.getUserLearningPlans(id, page);
      
      const newPlans = response.data.content;
      if (newPlans.length === 0 || newPlans.length < 10) {
        setHasMorePlans(false);
      }
      
      setLearningPlans(prev => append ? [...prev, ...newPlans] : newPlans);
      setPlanPage(page);
    } catch (error) {
      console.error('Error fetching learning plans:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 0) {
      fetchUserPosts(0, false);
    } else if (newValue === 1) {
      fetchUserLearningPlans(0, false);
    }
  };

  const handleLoadMorePosts = () => {
    const nextPage = postPage + 1;
    setPostPage(nextPage);
    fetchUserPosts(nextPage, true);
  };

  const handleLoadMorePlans = () => {
    const nextPage = planPage + 1;
    setPlanPage(nextPage);
    fetchUserLearningPlans(nextPage, true);
  };

  const handleToggleFollow = async () => {
    if (!currentUser) return;
    
    try {
      setProcessingFollow(true);
      const response = await userService.toggleFollow(id);
      setFollowing(response.data.following);
      setFollowerCount(prev => response.data.following ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setProcessingFollow(false);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await postService.deletePost(postId);
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profileUser) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Typography variant="h5">User not found</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
        {/* Cover image - placeholder gray background */}
        <Box sx={{ height: 200, bgcolor: 'grey.200' }} />
        
        {/* Profile info */}
        <Box sx={{ p: 3, position: 'relative' }}>
          <Avatar
            src={profileUser.imageUrl}
            alt={profileUser.name}
            sx={{
              width: 120,
              height: 120,
              border: '4px solid white',
              position: 'absolute',
              top: -60,
              left: 24,
            }}
          />
          
          <Box sx={{ ml: { xs: 0, sm: 18 }, pt: { xs: 8, sm: 0 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" component="h1">
                {profileUser.name}
              </Typography>
              
              {isOwnProfile ? (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  component={RouterLink}
                  to="/settings/profile"
                >
                  Edit Profile
                </Button>
              ) : (
                <Button
                  variant={following ? "outlined" : "contained"}
                  onClick={handleToggleFollow}
                  disabled={processingFollow}
                >
                  {following ? 'Following' : 'Follow'}
                </Button>
              )}
            </Box>
            
            {profileUser.bio && (
              <Typography variant="body1" sx={{ mb: 2 }}>
                {profileUser.bio}
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Typography variant="body2">
                <strong>{posts.length}</strong> posts
              </Typography>
              <Typography variant="body2">
                <strong>{followerCount}</strong> followers
              </Typography>
              <Typography variant="body2">
                <strong>{followingCount}</strong> following
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
      
      {/* Tabs for Posts/Learning Plans */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleChangeTab}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<ArticleIcon />} label="Posts" />
          <Tab icon={<SchoolIcon />} label="Learning Plans" />
        </Tabs>
      </Box>
      
      {/* Create button for own profile */}
      {isOwnProfile && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          {tabValue === 0 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              component={RouterLink}
              to="/create-post"
            >
              Create Post
            </Button>
          )}
          
          {tabValue === 1 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              component={RouterLink}
              to="/create-learning-plan"
            >
              Create Learning Plan
            </Button>
          )}
        </Box>
      )}
      
      {/* Tab content */}
      <Box>
        {/* Posts Tab */}
        {tabValue === 0 && (
          <>
            {posts.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No posts yet
                </Typography>
                {isOwnProfile && (
                  <>
                    <Typography variant="body1" color="text.secondary">
                      Share what you're learning or teaching!
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      component={RouterLink}
                      to="/create-post"
                      sx={{ mt: 2 }}
                    >
                      Create First Post
                    </Button>
                  </>
                )}
              </Paper>
            ) : (
              <>
                {posts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onDelete={handleDeletePost}
                  />
                ))}
                
                {hasMorePosts && (
                  <Box display="flex" justifyContent="center" my={3}>
                    <Button 
                      variant="outlined" 
                      onClick={handleLoadMorePosts}
                      disabled={loadingMore}
                    >
                      {loadingMore ? 'Loading...' : 'Load More'}
                    </Button>
                  </Box>
                )}
              </>
            )}
          </>
        )}
        
        {/* Learning Plans Tab */}
        {tabValue === 1 && (
          <>
            {learningPlans.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No learning plans yet
                </Typography>
                {isOwnProfile && (
                  <>
                    <Typography variant="body1" color="text.secondary">
                      Create a learning plan to track your progress!
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      component={RouterLink}
                      to="/create-learning-plan"
                      sx={{ mt: 2 }}
                    >
                      Create First Learning Plan
                    </Button>
                  </>
                )}
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {learningPlans.map(plan => (
                  <Grid item xs={12} sm={6} md={4} key={plan.id}>
                    <Paper
                      component={RouterLink}
                      to={`/learning-plan/${plan.id}`}
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 3
                        },
                        textDecoration: 'none',
                        color: 'inherit'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" noWrap>
                          {plan.title}
                        </Typography>
                        {!plan.isPublic && (
                          <Chip size="small" label="Private" />
                        )}
                      </Box>
                      
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {plan.description}
                      </Typography>
                      
                      <Box sx={{ mt: 'auto', pt: 2 }}>
                        <Typography variant="caption" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{plan.itemCount} items</span>
                          <span>
                            {Math.round((plan.completedItemCount / plan.itemCount) * 100)}% complete
                          </span>
                        </Typography>
                        <Box
                          sx={{
                            mt: 1,
                            width: '100%',
                            height: 4,
                            bgcolor: 'grey.200',
                            borderRadius: 5,
                            overflow: 'hidden'
                          }}
                        >
                          <Box
                            sx={{
                              width: `${Math.round((plan.completedItemCount / plan.itemCount) * 100)}%`,
                              height: '100%',
                              bgcolor: 'success.main'
                            }}
                          />
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
            
            {hasMorePlans && (
              <Box display="flex" justifyContent="center" my={3}>
                <Button 
                  variant="outlined" 
                  onClick={handleLoadMorePlans}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default Profile;
