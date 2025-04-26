import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Button,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Comment as CommentIcon,
  Favorite as FavoriteIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  MarkChatRead as MarkChatReadIcon,
  Info as InfoIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import notificationService from '../../services/notificationService';
import { useAuth } from '../../hooks/useAuth';

const NotificationsMenu = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (user) {
      // Connect to WebSocket for real-time notifications
      notificationService.connect(user.id);
      
      // Add notification listener
      notificationService.addNotificationListener(handleNewNotification);
      
      // Fetch initial notifications
      fetchNotifications(0);
    }
    
    return () => {
      if (user) {
        notificationService.disconnect();
        notificationService.removeNotificationListener(handleNewNotification);
      }
    };
  }, [user]);

  const fetchNotifications = async (pageNum) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await notificationService.getNotifications(pageNum);
      
      if (pageNum === 0) {
        setNotifications(response.data.content);
      } else {
        setNotifications(prev => [...prev, ...response.data.content]);
      }
      
      setHasMore(!response.data.last);
      
      // Update unread count
      const unread = response.data.content.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    handleClose();
    
    // Mark as read if unread
    if (!notification.read) {
      try {
        await notificationService.markAsRead(notification.id);
        
        // Update state
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => prev - 1);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    
    // Navigate to the link if available
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update state
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'COMMENT':
        return <CommentIcon color="primary" />;
      case 'LIKE':
        return <FavoriteIcon color="error" />;
      case 'FOLLOW':
        return <PersonIcon color="success" />;
      case 'LEARNING_PLAN_SHARED':
        return <CheckCircleIcon color="info" />;
      default:
        return <InfoIcon color="action" />;
    }
  };

  if (!user) return null;

  return (
    <>
      <IconButton
        onClick={handleClick}
        color="inherit"
        aria-label="notifications"
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Menu
        id="notifications-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: 360,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button 
              startIcon={<MarkChatReadIcon />} 
              size="small"
              onClick={handleMarkAllRead}
            >
              Mark all read
            </Button>
          )}
        </Box>
        
        <Divider />
        
        {loading && page === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <>
            {notifications.map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  whiteSpace: 'normal',
                  backgroundColor: notification.read ? 'inherit' : 'action.hover',
                  py: 1.5
                }}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={notification.content}
                  secondary={formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                />
              </MenuItem>
            ))}
            
            {hasMore && (
              <Box sx={{ p: 1, textAlign: 'center' }}>
                <Button 
                  size="small"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </Box>
            )}
            
            <Divider />
            
            <MenuItem onClick={() => { handleClose(); navigate('/settings/notifications'); }}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Notification Settings" />
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationsMenu;
