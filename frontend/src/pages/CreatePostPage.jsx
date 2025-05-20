import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createPost } from '../api/postApi';

const CreatePostPage = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [videoErrors, setVideoErrors] = useState({});
  const fileInputRef = useRef(null);

  const validationSchema = Yup.object({
    title: Yup.string()
      .required('Title is required')
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must be at most 100 characters'),
    content: Yup.string().required('Content is required'),
    category: Yup.string().required('Please select a category'),
    learningProgressPercent: Yup.number().min(0).max(100).nullable()
  });

  const validateVideoLength = (file, index) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('video/')) {
        resolve(true);
        return;
      }

      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 30) {
          setVideoErrors(prev => ({
            ...prev,
            [index]: `Video exceeds 30 seconds (${Math.round(video.duration)}s)`
          }));
          reject(new Error('Video exceeds 30 seconds'));
        } else {
          setVideoErrors(prev => {
            const newErrors = {...prev};
            delete newErrors[index];
            return newErrors;
          });
          resolve(true);
        }
      };
      
      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        setVideoErrors(prev => ({
          ...prev,
          [index]: 'Failed to load video'
        }));
        reject(new Error('Failed to load video'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const newFiles = [...files];
      const newPreviewUrls = [...previewUrls];
      const maxFiles = 10; // Maximum number of files allowed
      
      if (newFiles.length + selectedFiles.length > maxFiles) {
        setError(`You can upload a maximum of ${maxFiles} files.`);
        return;
      }

      // Validate file types and sizes
      let hasError = false;
      for (const file of selectedFiles) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'];
        const validSize = 50 * 1024 * 1024; // 50MB
        
        if (!validTypes.includes(file.type)) {
          setError('Only images (JPEG, PNG, GIF, WEBP) and videos (MP4, QuickTime) are allowed.');
          hasError = true;
          break;
        }
        
        if (file.size > validSize) {
          setError('Files must be less than 50MB.');
          hasError = true;
          break;
        }
        
        // Add file to the array
        newFiles.push(file);
        
        // Create preview URL
        if (file.type.startsWith('image/')) {
          newPreviewUrls.push({
            url: URL.createObjectURL(file),
            type: 'image'
          });
        } else if (file.type.startsWith('video/')) {
          newPreviewUrls.push({
            url: URL.createObjectURL(file),
            type: 'video'
          });
          
          // Validate video length (async)
          try {
            await validateVideoLength(file, newFiles.length - 1);
          } catch (err) {
            // We'll still allow adding the video but show an error
            hasError = true;
          }
        }
      }
      
      if (!hasError) {
        setError('');
      }
      
      setFiles(newFiles);
      setPreviewUrls(newPreviewUrls);
    }
  };
  
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      // Revoke the URL to prevent memory leaks
      if (prev[index]?.url) URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
    setVideoErrors(prev => {
      const newErrors = {...prev};
      delete newErrors[index];
      // Adjust indices for remaining errors
      const adjustedErrors = {};
      Object.keys(newErrors).forEach(key => {
        const numKey = parseInt(key);
        if (numKey > index) {
          adjustedErrors[numKey - 1] = newErrors[key];
        } else {
          adjustedErrors[key] = newErrors[key];
        }
      });
      return adjustedErrors;
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileInput = fileInputRef.current;
      fileInput.files = e.dataTransfer.files;
      const event = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(event);
    }
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const createdPost = await createPost(values, files);
      navigate(`/post/${createdPost.id}`);
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      <div className="bg-white shadow-card rounded-xl p-8 mb-6">
        <div className="flex items-center mb-6">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
        </div>
        
        <p className="text-gray-600 mb-6">Share your knowledge and learning journey with the LearnLink community.</p>
      
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
      
      <Formik
        initialValues={{
          title: '',
          content: '',
          category: '',
          learningProgressPercent: 0
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting: formSubmitting, values }) => (          <Form className="space-y-6">
            <div className="form-group">
              <label htmlFor="title" className="modern-label text-base mb-2">Title</label>
              <Field
                type="text"
                name="title"
                id="title"
                className="modern-input py-3"
                placeholder="Give your post a descriptive title"
              />
              <ErrorMessage name="title" component="div" className="mt-1.5 text-red-600 text-sm" />
            </div>

            <div className="form-group">
              <label htmlFor="content" className="modern-label text-base mb-2">Content</label>
              <Field
                as="textarea"
                name="content"
                id="content"
                rows="7"
                className="modern-input py-3 resize-y"
                placeholder="Share your learning insights, experiences, or questions..."
              />
              <ErrorMessage name="content" component="div" className="mt-1.5 text-red-600 text-sm" />
            </div>

            <div className="form-group">
              <label htmlFor="category" className="modern-label text-base mb-2">Category</label>
              <div className="relative">
                <Field
                  as="select"
                  name="category"
                  id="category"
                  className="modern-input py-3 appearance-none pr-10"
                >
                  <option value="">Select a category</option>
                  <option value="PROGRAMMING">Programming</option>
                  <option value="DESIGN">Design</option>
                  <option value="BUSINESS">Business</option>
                  <option value="LANGUAGE">Language</option>
                  <option value="MUSIC">Music</option>
                  <option value="ART">Art</option>
                  <option value="SCIENCE">Science</option>
                  <option value="MATH">Math</option>
                  <option value="HISTORY">History</option>
                  <option value="OTHER">Other</option>
                </Field>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <ErrorMessage name="category" component="div" className="mt-1.5 text-red-600 text-sm" />
            </div>

            <div className="form-group bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <label htmlFor="learningProgressPercent" className="modern-label text-base mb-0 mr-2">
                  Learning Progress:
                </label>
                <span className="text-lg font-semibold text-primary-600">{values.learningProgressPercent}%</span>
              </div>
              <Field
                type="range"
                name="learningProgressPercent"
                id="learningProgressPercent"
                min="0"
                max="100"
                step="5"
                className="w-full accent-primary-500 h-2 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0% (Just started)</span>
                <span>50% (Making progress)</span>
                <span>100% (Mastered)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Media (Images & Videos)
              </label>              <div 
                className="mt-1 flex justify-center px-6 pt-6 pb-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="space-y-3 text-center">
                  <svg
                    className="mx-auto h-14 w-14 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                    >
                      <span>Upload files</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        onChange={handleFileChange}
                        accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime"
                        ref={fileInputRef}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF, WEBP, MP4 videos (max 30 seconds)
                  </p>
                  <p className="text-xs text-gray-500">
                    {files.length} of 10 files selected ({files.filter(f => f.type.startsWith('image/')).length} images, {files.filter(f => f.type.startsWith('video/')).length} videos)
                  </p>
                </div>
              </div>
                {previewUrls.length > 0 && (
                <div className="mt-5 border border-gray-200 rounded-xl p-4 bg-white">
                  <div className="flex items-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-sm font-medium text-gray-700">Attached Media ({previewUrls.length})</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {previewUrls.map((preview, index) => (
                      <div key={index} className="relative group overflow-hidden rounded-lg shadow-sm border border-gray-200">
                        {preview.type === 'image' ? (
                          <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                            <img 
                              src={preview.url} 
                              alt={`Preview ${index}`} 
                              className="h-full w-full object-cover transition-transform group-hover:scale-105" 
                            />
                          </div>
                        ) : (
                          <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
                            <video 
                              className="h-full w-full object-cover" 
                              controls
                            >
                              <source src={preview.url} type={files[index].type} />
                              Your browser does not support the video tag.
                            </video>
                            <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                              Video
                            </div>
                            {videoErrors[index] && (
                              <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs py-1 px-2">
                                {videoErrors[index]}
                              </div>
                            )}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-2 right-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1.5 shadow-sm transition-colors"
                          aria-label="Remove"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>            <div className="flex flex-col sm:flex-row sm:justify-between gap-4 pt-4 border-t border-gray-200 mt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="modern-button-outline flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || formSubmitting || Object.keys(videoErrors).length > 0}
                className="modern-button-primary flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:transform-none px-8"
              >
                {isSubmitting || formSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Publishing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Publish Post
                  </>
                )}
              </button>
            </div>
            {Object.keys(videoErrors).length > 0 && (
              <p className="text-red-500 text-sm text-center">
                Please fix the video errors before publishing
              </p>
            )}          </Form>
        )}
      </Formik>
      </div>
    </div>
  );
};

export default CreatePostPage;
