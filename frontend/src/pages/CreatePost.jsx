import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  IconButton,
  ImageList,
  ImageListItem,
  Alert
} from '@mui/material';
import {
  AddPhotoAlternate as AddPhotoIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import postService from '../services/postService';
import fileService from '../services/fileService';

const validationSchema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .max(100, 'Title should be 100 characters or less'),
  content: yup
    .string()
    .required('Content is required')
    .max(5000, 'Content should be 5000 characters or less'),
  postType: yup
    .string()
    .required('Please select a post type')
});

const CreatePost = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
      
      if (selectedFiles.length > 3) {
        setError('You can only upload a maximum of 3 files');
        return;
      }
      
      // Create previews
      const newPreviews = selectedFiles.map(file => ({
        url: URL.createObjectURL(file),
        type: file.type.startsWith('video/') ? 'video' : 'image'
      }));
      
      setFiles(selectedFiles);
      setPreviews(newPreviews);
      setError(null);
    }
  };

  const handleRemoveFile = (index) => {
    const newFiles = [...files];
    const newPreviews = [...previews];
    
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviews[index].url);
    
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const uploadFiles = async () => {
    if (files.length === 0) return [];
    
    setUploadingFiles(true);
    try {
      const response = await fileService.uploadMultipleFiles(files);
      return response.data.map(fileData => fileData.fileDownloadUri);
    } catch (err) {
      setError('Failed to upload files. Please try again.');
      throw err;
    } finally {
      setUploadingFiles(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      title: '',
      content: '',
      postType: 'GENERAL'
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        let mediaUrls = [];
        
        if (files.length > 0) {
          mediaUrls = await uploadFiles();
        }
        
        const postData = {
          ...values,
          mediaUrls
        };
        
        const response = await postService.createPost(postData);
        navigate(`/post/${response.data.id}`);
      } catch (err) {
        setError('Failed to create post. Please try again.');
        console.error('Error creating post:', err);
      }
    },
  });

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create Post
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="title"
            name="title"
            label="Title"
            margin="normal"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.title && Boolean(formik.errors.title)}
            helperText={formik.touched.title && formik.errors.title}
          />
          
          <TextField
            fullWidth
            id="content"
            name="content"
            label="Content"
            multiline
            rows={8}
            margin="normal"
            value={formik.values.content}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.content && Boolean(formik.errors.content)}
            helperText={
              (formik.touched.content && formik.errors.content) ||
              `${formik.values.content.length}/5000 characters`
            }
          />
          
          <FormControl component="fieldset" margin="normal">
            <FormLabel component="legend">Post Type</FormLabel>
            <RadioGroup
              row
              name="postType"
              value={formik.values.postType}
              onChange={formik.handleChange}
            >
              <FormControlLabel 
                value="GENERAL" 
                control={<Radio />} 
                label="General" 
              />
              <FormControlLabel 
                value="SKILL_SHARE" 
                control={<Radio />} 
                label="Skill Share" 
              />
              <FormControlLabel 
                value="LEARNING_PROGRESS" 
                control={<Radio />} 
                label="Learning Progress" 
              />
              <FormControlLabel 
                value="QUESTION" 
                control={<Radio />} 
                label="Question" 
              />
            </RadioGroup>
            {formik.touched.postType && formik.errors.postType && (
              <Typography color="error" variant="caption">
                {formik.errors.postType}
              </Typography>
            )}
          </FormControl>
          
          <Box sx={{ mt: 3, mb: 2 }}>
            <input
              accept="image/*,video/*"
              style={{ display: 'none' }}
              id="contained-button-file"
              multiple
              type="file"
              onChange={handleFileChange}
              disabled={formik.isSubmitting || uploadingFiles}
            />
            <label htmlFor="contained-button-file">
              <Button
                variant="outlined"
                component="span"
                startIcon={<AddPhotoIcon />}
                disabled={formik.isSubmitting || uploadingFiles}
              >
                Add Photos/Videos
              </Button>
            </label>
            <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
              You can upload up to 3 files (images or videos)
            </Typography>
          </Box>
          
          {previews.length > 0 && (
            <ImageList cols={3} rowHeight={200} gap={8} sx={{ mb: 3 }}>
              {previews.map((preview, index) => (
                <ImageListItem key={index} sx={{ position: 'relative' }}>
                  {preview.type === 'video' ? (
                    <video 
                      src={preview.url} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      controls
                    />
                  ) : (
                    <img
                      src={preview.url}
                      alt={`Preview ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      },
                    }}
                    size="small"
                    onClick={() => handleRemoveFile(index)}
                    disabled={formik.isSubmitting || uploadingFiles}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </ImageListItem>
              ))}
            </ImageList>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/')}
              disabled={formik.isSubmitting || uploadingFiles}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting || uploadingFiles}
              startIcon={
                (formik.isSubmitting || uploadingFiles) && (
                  <CircularProgress size={20} color="inherit" />
                )
              }
            >
              {formik.isSubmitting || uploadingFiles ? 'Publishing...' : 'Publish Post'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default CreatePost;
