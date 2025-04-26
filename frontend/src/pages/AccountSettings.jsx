import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Switch,
  Divider,
  Alert,
  TextField,
  Button,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Language as LanguageIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useFormik } from 'formik';
import * as yup from 'yup';
import userService from '../services/userService';

const passwordValidationSchema = yup.object({
  currentPassword: yup
    .string()
    .required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password should be at least 8 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
});

const AccountSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    followNotifications: true,
    commentNotifications: true,
    likeNotifications: true
  });

  const handleSettingChange = (setting) => (event) => {
    setSettings({
      ...settings,
      [setting]: event.target.checked
    });
  };

  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(true);
        setError(null);
        
        // This would call a backend endpoint to change password
        await userService.changePassword(values);
        
        resetForm();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        console.error('Error changing password:', err);
        setError(err.response?.data?.message || 'Failed to change password');
      } finally {
        setLoading(false);
      }
    }
  });

  if (!user) {
    return <Container maxWidth="md">
      <Typography variant="h5" align="center" sx={{ mt: 4 }}>
        You need to be logged in to access this page
      </Typography>
    </Container>;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Account Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account settings and preferences
        </Typography>
      </Box>
      
      {/* Notification Settings */}
      <Paper sx={{ mb: 4, p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <NotificationsIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Notification Preferences</Typography>
        </Box>
        
        <List>
          <ListItem>
            <ListItemText 
              primary="Email Notifications" 
              secondary="Receive notifications via email" 
            />
            <ListItemSecondaryAction>
              <Switch 
                edge="end"
                checked={settings.emailNotifications}
                onChange={handleSettingChange('emailNotifications')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider component="li" />
          
          <ListItem>
            <ListItemText 
              primary="Push Notifications" 
              secondary="Receive notifications in browser" 
            />
            <ListItemSecondaryAction>
              <Switch 
                edge="end"
                checked={settings.pushNotifications}
                onChange={handleSettingChange('pushNotifications')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider component="li" />
          
          <ListItem>
            <ListItemText 
              primary="Follow Notifications" 
              secondary="When someone follows you" 
            />
            <ListItemSecondaryAction>
              <Switch 
                edge="end"
                checked={settings.followNotifications}
                onChange={handleSettingChange('followNotifications')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider component="li" />
          
          <ListItem>
            <ListItemText 
              primary="Comment Notifications" 
              secondary="When someone comments on your posts" 
            />
            <ListItemSecondaryAction>
              <Switch 
                edge="end"
                checked={settings.commentNotifications}
                onChange={handleSettingChange('commentNotifications')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider component="li" />
          
          <ListItem>
            <ListItemText 
              primary="Like Notifications" 
              secondary="When someone likes your posts" 
            />
            <ListItemSecondaryAction>
              <Switch 
                edge="end"
                checked={settings.likeNotifications}
                onChange={handleSettingChange('likeNotifications')}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button variant="contained">Save Preferences</Button>
        </Box>
      </Paper>
      
      {/* Password Change */}
      <Paper sx={{ mb: 4, p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LockIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Password Settings</Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Password changed successfully
          </Alert>
        )}
        
        <form onSubmit={passwordFormik.handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            id="currentPassword"
            name="currentPassword"
            label="Current Password"
            type="password"
            value={passwordFormik.values.currentPassword}
            onChange={passwordFormik.handleChange}
            onBlur={passwordFormik.handleBlur}
            error={passwordFormik.touched.currentPassword && Boolean(passwordFormik.errors.currentPassword)}
            helperText={passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword}
          />
          
          <TextField
            fullWidth
            margin="normal"
            id="newPassword"
            name="newPassword"
            label="New Password"
            type="password"
            value={passwordFormik.values.newPassword}
            onChange={passwordFormik.handleChange}
            onBlur={passwordFormik.handleBlur}
            error={passwordFormik.touched.newPassword && Boolean(passwordFormik.errors.newPassword)}
            helperText={passwordFormik.touched.newPassword && passwordFormik.errors.newPassword}
          />
          
          <TextField
            fullWidth
            margin="normal"
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            value={passwordFormik.values.confirmPassword}
            onChange={passwordFormik.handleChange}
            onBlur={passwordFormik.handleBlur}
            error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
            helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading && <CircularProgress size={16} />}
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </Button>
          </Box>
        </form>
      </Paper>
      
      {/* Account Information */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <EmailIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Account Information</Typography>
        </Box>
        
        <List>
          <ListItem>
            <ListItemText 
              primary="Email" 
              secondary={user.email} 
            />
          </ListItem>
          <Divider component="li" />
          
          <ListItem>
            <ListItemText 
              primary="Account Created" 
              secondary={new Date(user.createdAt).toLocaleDateString()} 
            />
          </ListItem>
        </List>
      </Paper>
    </Container>
  );
};

export default AccountSettings;
