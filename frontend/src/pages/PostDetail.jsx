import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Typography,
  Avatar,
  IconButton,
  Button,
  TextField,
  Divider,
  Grid,
  CircularProgress,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  MoreVert as MoreVertIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../hooks/useAuth';
import postService from '../services/postService';
import commentService from '../services/commentService';

const validationSchema = yup.object({
  content: yup
    .string()
    .required('Comment cannot be empty')
    .max(1000, 'Comment cannot exceed 1000 characters')
});

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentPage, setCommentPage] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  useEffect(() => {
    fetchPostDetails();
    fetchComments(0);
  }, [id]);

  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      const response = await postService.getPostById(id);
      setPost(response.data);
      setLiked(response.data.liked);
      setLikeCount(response.data.likeCount);
    } catch (error) {
      console.error('Error fetching post details:', error);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (page = 0, append = false) => {
    try {
      setLoadingComments(true);
      const response = await commentService.getCommentsByPost(id, page);
      
      const newComments = response.data.content;
      if (newComments.length === 0 || newComments.length < 10) {
        setHasMoreComments(false);
      }
      
      setComments(prev => append ? [...prev, ...newComments] : newComments);
      setCommentPage(page);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/post/${id}` } });
      return;
    }
    
    try {
      const response = await postService.likePost(id);
      setLiked(response.data.liked);
      setLikeCount(response.data.likeCount);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleLoadMoreComments = () => {
    const nextPage = commentPage + 1;
    setCommentPage(nextPage);
    fetchComments(nextPage, true);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeletePost = async () => {
    try {
      await postService.deletePost(id);
      navigate('/');
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleMediaNav = (index) => {
    setCurrentMediaIndex(index);
  };

  const formik = useFormik({
    initialValues: {
      content: ''
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!user) {
        navigate('/login', { state: { from: `/post/${id}` } });
        return;
      }
      
      try {
        const response = await commentService.createComment(id, values.content);
        setComments([response.data, ...comments]);
        resetForm();
        
        // Update comment count in post object
        setPost({
          ...post,
          commentCount: post.commentCount + 1
        });
      } catch (error) {
        console.error('Error creating comment:', error);
      }
    }
  });

  const renderMedia = () => {
    if (!post || !post.mediaUrls || post.mediaUrls.length === 0) return null;
    
    const currentMedia = post.mediaUrls[currentMediaIndex];
    
    return (
      <Box sx={{ mt: 2, mb: 3 }}>
        {currentMedia.endsWith('.mp4') || currentMedia.endsWith('.webm') ? (
          <Box sx={{ width: '100%', borderRadius: 2, overflow: 'hidden', bgcolor: 'black' }}>
            <video
              controls
              width="100%"
              style={{ display: 'block', maxHeight: '500px', margin: '0 auto' }}
            >
              <source src={currentMedia} />
              Your browser does not support the video tag.
            </video>
          </Box>
        ) : (
          <Box 
            sx={{ 
              width: '100%', 
              borderRadius: 2, 
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              bgcolor: 'black'
            }}
          >
            <img
              src={currentMedia}
              alt={`Post media ${currentMediaIndex + 1}`}
              style={{ 
                maxWidth: '100%',
                maxHeight: '500px',
                objectFit: 'contain'
              }}
            />
          </Box>
        )}
        
        {post.mediaUrls.length > 1 && (
          <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'center' }}>
            {post.mediaUrls.map((_, index) => (
              <Box
                key={index}
                onClick={() => handleMediaNav(index)}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: index === currentMediaIndex ? 'primary.main' : 'gray',
                  cursor: 'pointer'
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (!post) {
    return (
      <Container maxWidth="md">
        <Box textAlign="center" py={8}>
          <Typography variant="h5">Post not found</Typography>
        </Box>
      </Container>
    );
  }

  const isAuthor = user && user.id === post.user.id;

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        {/* Post Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              component={RouterLink}
              to={`/profile/${post.user.id}`}
              src={post.user.imageUrl}
              alt={post.user.name}
              sx={{ width: 48, height: 48 }}
            />
            <Box sx={{ ml: 2 }}>
              <Typography 
                component={RouterLink} 
                to={`/profile/${post.user.id}`} 
                variant="subtitle1" 
                sx={{ fontWeight: 500, textDecoration: 'none', color: 'inherit' }}
              >
                {post.user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </Typography>
            </Box>
          </Box>
          
          <IconButton onClick={handleMenuClick}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={handleMenuClose}
          >
            {isAuthor && (
              <MenuItem component={RouterLink} to={`/edit-post/${post.id}`}>
                Edit
              </MenuItem>
            )}
            {isAuthor && (
              <MenuItem onClick={handleDeletePost}>Delete</MenuItem>
            )}
            <MenuItem onClick={handleMenuClose}>Copy link</MenuItem>
            {!isAuthor && (
              <MenuItem onClick={handleMenuClose}>Report</MenuItem>
            )}
          </Menu>
        </Box>
        
        {/* Post Content */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            {post.title}
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {post.content}
          </Typography>
        </Box>
        
        {/* Media */}
        {renderMedia()}
        
        {/* Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <Button
            startIcon={liked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
            onClick={handleLike}
          >
            {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            {post.commentCount} {post.commentCount === 1 ? 'Comment' : 'Comments'}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Add Comment */}
        <Box component="form" onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="content"
            name="content"
            placeholder={user ? "Add a comment..." : "Login to add a comment"}
            multiline
            rows={2}
            value={formik.values.content}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.content && Boolean(formik.errors.content)}
            helperText={formik.touched.content && formik.errors.content}
            disabled={!user}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              endIcon={<SendIcon />}
              disabled={formik.isSubmitting || !user}
            >
              Comment
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Comments */}
        <Typography variant="h6" gutterBottom>
          Comments
        </Typography>
        
        {comments.length === 0 ? (
          <Box textAlign="center" py={3}>
            <Typography variant="body1" color="text.secondary">
              No comments yet. Be the first to comment!
            </Typography>
          </Box>
        ) : (
          <List>
            {comments.map((comment) => (
              <ListItem key={comment.id} alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar
                    component={RouterLink}
                    to={`/profile/${comment.user.id}`}
                    src={comment.user.imageUrl}
                    alt={comment.user.name}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography
                        component={RouterLink}
                        to={`/profile/${comment.user.id}`}
                        sx={{ fontWeight: 500, textDecoration: 'none', color: 'inherit' }}
                      >
                        {comment.user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography
                      variant="body1"
                      color="text.primary"
                      sx={{ mt: 1, whiteSpace: 'pre-wrap' }}
                    >
                      {comment.content}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
        
        {hasMoreComments && (
          <Box display="flex" justifyContent="center" mt={2}>
            <Button
              variant="outlined"
              onClick={handleLoadMoreComments}
              disabled={loadingComments}
            >
              {loadingComments ? 'Loading...' : 'Load More Comments'}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default PostDetail;
