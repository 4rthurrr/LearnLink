import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Container, 
    Grid, 
    Typography, 
    CircularProgress,
    Tabs,
    Tab,
    Button,
    Paper
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Add as AddIcon } from '@mui/icons-material';
import PostCard from '../components/post/PostCard';
import UserSuggestions from '../components/profile/UserSuggestions';
import TrendingTopics from '../components/common/TrendingTopics';
import postService from '../services/postService';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [deletePostId, setDeletePostId] = useState(null);

    const fetchPosts = async (tabIndex, pageNumber = 0, append = false) => {
        try {
            setLoading(true);
            const response = tabIndex === 0 
                ? await postService.getFeedPosts(pageNumber, 10)
                : await postService.getPosts(pageNumber, 10);
                
            const newPosts = response.data.content;
            if (newPosts.length === 0 || newPosts.length < 10) {
                setHasMore(false);
            }
            
            setPosts(append ? [...posts, ...newPosts] : newPosts);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts(tabValue);
    }, [tabValue]);

    const handleChangeTab = (event, newValue) => {
        setTabValue(newValue);
        setPage(0);
        setHasMore(true);
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPosts(tabValue, nextPage, true);
    };

    const handleDeletePost = async (postId) => {
        try {
            setDeletePostId(postId);
            await postService.deletePost(postId);
            setPosts(posts.filter(post => post.id !== postId));
        } catch (error) {
            console.error("Failed to delete post:", error);
        } finally {
            setDeletePostId(null);
        }
    };

    return (
        <Container maxWidth="lg">
            <Grid container spacing={3}>
                {/* Main Content Area */}
                <Grid item xs={12} md={8}>
                    <Box sx={{ mb: 3 }}>
                        <Tabs 
                            value={tabValue} 
                            onChange={handleChangeTab}
                            variant="fullWidth"
                            indicatorColor="primary"
                            textColor="primary"
                        >
                            <Tab label="My Feed" disabled={!user} />
                            <Tab label="Discover" />
                        </Tabs>
                    </Box>
                    
                    {user && (
                        <Box sx={{ mb: 3 }}>
                            <Paper 
                                sx={{ 
                                    p: 2, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    borderRadius: 2
                                }}
                            >
                                <Typography variant="body1" color="text.secondary">
                                    Share what you're learning or teaching...
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    component={Link}
                                    to="/create-post"
                                >
                                    Create Post
                                </Button>
                            </Paper>
                        </Box>
                    )}
                    
                    {loading && page === 0 ? (
                        <Box display="flex" justifyContent="center" my={4}>
                            <CircularProgress />
                        </Box>
                    ) : posts.length === 0 ? (
                        <Box textAlign="center" my={4}>
                            <Typography variant="h6" color="text.secondary">
                                No posts found
                            </Typography>
                            <Typography variant="body1" color="text.secondary" mt={1}>
                                {tabValue === 0 ? 
                                    'Follow more people to see their posts here' : 
                                    'Be the first to create a post!'}
                            </Typography>
                            {user && (
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    component={Link}
                                    to="/create-post"
                                    sx={{ mt: 2 }}
                                >
                                    Create Post
                                </Button>
                            )}
                        </Box>
                    ) : (
                        <>
                            {posts.map(post => (
                                <PostCard 
                                    key={post.id} 
                                    post={post} 
                                    onDelete={handleDeletePost}
                                    isDeleting={deletePostId === post.id}
                                />
                            ))}
                            
                            {hasMore && (
                                <Box display="flex" justifyContent="center" my={3}>
                                    <Button 
                                        variant="outlined" 
                                        onClick={handleLoadMore}
                                        disabled={loading}
                                    >
                                        {loading ? 'Loading...' : 'Load More'}
                                    </Button>
                                </Box>
                            )}
                        </>
                    )}
                </Grid>
                
                {/* Sidebar */}
                <Grid item xs={12} md={4}>
                    <Box sx={{ position: { md: 'sticky' }, top: { md: '80px' } }}>
                        <UserSuggestions />
                        <TrendingTopics />
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Home;
