import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Divider,
  Alert,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../hooks/useAuth';
import userService from '../services/userService';
import fileService from '../services/fileService';

const validationSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .max(50, 'Name should be 50 characters or less'),
  bio: yup
    .string()
    .max(500, 'Bio should be 500 characters or less')
});

const ProfileSettings = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      bio: user?.bio || '',
      imageUrl: user?.imageUrl || ''
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await userService.updateProfile(user.id, values);
        
        // Update user in auth context
        setUser(response.data);
        
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        console.error('Error updating profile:', err);
        setError(err.response?.data?.message || 'Failed to update profile');
      } finally {
        setLoading(false);
      }
    }
  });

  const handleImageUpload = async (event) => {
    if (!event.target.files || !event.target.files[0]) return;
    
    const file = event.target.files[0];
    
    try {
      setUploadingImage(true);
      const response = await fileService.uploadFile(file);
      
      // Update form value
      formik.setFieldValue('imageUrl', response.data.fileDownloadUri);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      await userService.deleteAccount(user.id);
      
      // Logout and redirect to home page
      localStorage.removeItem('token');
      setUser(null);
      navigate('/');
    } catch (err) {
      console.error('Error deleting account:', err);
      setError(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  if (!user) {
    return <Container maxWidth="md">
      <Typography variant="h5" align="center" sx={{ mt: 4 }}>
        You need to be logged in to access this page
      </Typography>
    </Container>;
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile Settings
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Profile updated successfully
          </Alert>
        )}
        
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={formik.values.imageUrl}
                alt={formik.values.name}
                sx={{ width: 120, height: 120, mb: 2 }}
              />
              <input
                accept="image/*"
                id="profile-image-upload"
                type="file"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              <label htmlFor="profile-image-upload">
                <IconButton
                  color="primary"
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'background.paper'
                  }}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? <CircularProgress size={24} /> : <PhotoCameraIcon />}
                </IconButton>
              </label>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              Click the camera icon to change your profile picture
            </Typography>
          </Box>
          
          <TextField
            fullWidth
            id="name"
            name="name"
            label="Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            margin="normal"
          />
          
          <TextField
            fullWidth
            id="bio"
            name="bio"
            label="Bio"
            multiline
            rows={4}
            value={formik.values.bio}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.bio && Boolean(formik.errors.bio)}
            helperText={
              (formik.touched.bio && formik.errors.bio) ||
              `${formik.values.bio?.length || 0}/500 characters`
            }
            margin="normal"
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              disabled={loading || !formik.dirty}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </form>
        
        <Divider sx={{ my: 4 }} />
        
        <Box>
          <Typography variant="h6" color="error" gutterBottom>
            Danger Zone
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Once you delete your account, there is no going back. Please be certain.
          </Typography>
          
          <Button
            variant="outlined"
            color="error"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete Account
          </Button>
        </Box>
      </Paper>
      
      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action cannot be undone, and all your data will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteAccount} 
            color="error" 
            disabled={loading}
            startIcon={loading && <CircularProgress size={16} />}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfileSettings;
