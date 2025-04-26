import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    Card, 
    CardHeader, 
    CardMedia, 
    CardContent, 
    CardActions,
    Avatar, 
    IconButton, 
    Typography,
    Box,
    Menu,
    MenuItem,
    Divider
} from '@mui/material';
import { 
    MoreVert as MoreVertIcon,
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Comment as CommentIcon,
    Share as ShareIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import postService from '../../services/postService';

const PostCard = ({ post, onDelete, refreshPost }) => {
    const { user } = useAuth();
    const [liked, setLiked] = useState(post.liked);
    const [likeCount, setLikeCount] = useState(post.likeCount);
    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);
    const isAuthor = user?.id === post.user.id;

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLike = async () => {
        try {
            const response = await postService.likePost(post.id);
            setLiked(response.data.liked);
            setLikeCount(response.data.likeCount);
        } catch (error) {
            console.error("Failed to like post:", error);
        }
    };

    const handleDelete = () => {
        handleMenuClose();
        onDelete(post.id);
    };

    const getPostTypeLabel = (type) => {
        switch(type) {
            case 'SKILL_SHARE': return 'Shared a skill';
            case 'LEARNING_PROGRESS': return 'Learning progress';
            case 'QUESTION': return 'Asked a question';
            default: return '';
        }
    };

    const renderMedia = () => {
        if (post.mediaUrls && post.mediaUrls.length > 0) {
            // For simplicity, just showing the first media
            const mediaUrl = post.mediaUrls[0];
            if (mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.webm')) {
                return (
                    <Box sx={{ pt: 2 }}>
                        <video 
                            controls 
                            width="100%" 
                            style={{ borderRadius: '8px' }}
                        >
                            <source src={mediaUrl} />
                            Your browser does not support the video tag.
                        </video>
                    </Box>
                );
            } else {
                return (
                    <CardMedia
                        component="img"
                        height="280"
                        image={mediaUrl}
                        alt={post.title}
                        sx={{ pt: 2 }}
                    />
                );
            }
        }
        return null;
    };

    return (
        <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardHeader
                avatar={
                    <Link to={`/profile/${post.user.id}`}>
                        <Avatar src={post.user.imageUrl} alt={post.user.name} />
                    </Link>
                }
                action={
                    <>
                        <IconButton aria-label="settings" onClick={handleMenuClick}>
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={isMenuOpen}
                            onClose={handleMenuClose}
                        >
                            {isAuthor && (
                                <MenuItem component={Link} to={`/edit-post/${post.id}`}>
                                    Edit
                                </MenuItem>
                            )}
                            {isAuthor && (
                                <MenuItem onClick={handleDelete}>Delete</MenuItem>
                            )}
                            <MenuItem onClick={handleMenuClose}>Copy link</MenuItem>
                            {!isAuthor && (
                                <MenuItem onClick={handleMenuClose}>Report</MenuItem>
                            )}
                        </Menu>
                    </>
                }
                title={
                    <Link to={`/profile/${post.user.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Typography variant="subtitle1" fontWeight={500}>
                            {post.user.name}
                        </Typography>
                    </Link>
                }
                subheader={
                    <>
                        <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </Typography>
                        {post.postType && (
                            <Typography variant="caption" color="primary" sx={{ ml: 1 }}>
                                • {getPostTypeLabel(post.postType)}
                            </Typography>
                        )}
                    </>
                }
            />
            
            <CardContent sx={{ pt: 0, pb: 1 }}>
                <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography variant="h6" gutterBottom>
                        {post.title}
                    </Typography>
                </Link>
                <Typography variant="body1" color="text.secondary">
                    {post.content.length > 250 
                        ? `${post.content.substring(0, 250)}...` 
                        : post.content}
                </Typography>
                {post.content.length > 250 && (
                    <Link to={`/post/${post.id}`} style={{ textDecoration: 'none' }}>
                        <Typography color="primary" variant="body2" sx={{ mt: 1 }}>
                            Read more
                        </Typography>
                    </Link>
                )}
            </CardContent>
            
            {renderMedia()}
            
            <Divider sx={{ mt: 1 }} />
            
            <CardActions disableSpacing>
                <IconButton 
                    aria-label="add to favorites"
                    onClick={handleLike}
                    color={liked ? "primary" : "default"}
                >
                    {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                    {likeCount}
                </Typography>
                
                <IconButton 
                    aria-label="comment"
                    component={Link}
                    to={`/post/${post.id}`}
                >
                    <CommentIcon />
                </IconButton>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                    {post.commentCount}
                </Typography>
                
                <IconButton aria-label="share">
                    <ShareIcon />
                </IconButton>
            </CardActions>
        </Card>
    );
};

export default PostCard;
