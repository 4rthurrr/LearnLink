import React, { useState } from 'react';
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

  const validationSchema = Yup.object({
    title: Yup.string()
      .required('Title is required')
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must be at most 100 characters'),
    content: Yup.string().required('Content is required'),
    category: Yup.string().required('Please select a category'),
    learningProgressPercent: Yup.number().min(0).max(100).nullable()
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      
      // Validate file types and sizes
      const validFiles = selectedFiles.filter(file => {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
        const validSize = 10 * 1024 * 1024; // 10MB
        
        if (!validTypes.includes(file.type)) {
          setError('Only images (JPEG, PNG, GIF) and videos (MP4, QuickTime) are allowed.');
          return false;
        }
        
        if (file.size > validSize) {
          setError('Files must be less than 10MB.');
          return false;
        }
        
        return true;
      });
      
      if (validFiles.length > 0) {
        setFiles(validFiles);
        setError('');
        
        // Create preview URLs for images
        const newPreviewUrls = validFiles.map(file => {
          if (file.type.startsWith('image/')) {
            return URL.createObjectURL(file);
          } else if (file.type.startsWith('video/')) {
            return URL.createObjectURL(file);
          }
          return null;
        });
        
        setPreviewUrls(newPreviewUrls);
      }
    }
  };
  
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      // Revoke the URL to prevent memory leaks
      if (prev[index]) URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create Post</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
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
        {({ isSubmitting: formSubmitting, values }) => (
          <Form className="space-y-6 bg-white p-6 rounded-lg shadow">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <Field
                type="text"
                name="title"
                id="title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Give your post a title"
              />
              <ErrorMessage name="title" component="div" className="mt-1 text-red-600 text-sm" />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <Field
                as="textarea"
                name="content"
                id="content"
                rows="5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Share your learning journey..."
              />
              <ErrorMessage name="content" component="div" className="mt-1 text-red-600 text-sm" />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Field
                as="select"
                name="category"
                id="category"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
              <ErrorMessage name="category" component="div" className="mt-1 text-red-600 text-sm" />
            </div>

            <div>
              <label htmlFor="learningProgressPercent" className="block text-sm font-medium text-gray-700 mb-1">
                Learning Progress: {values.learningProgressPercent}%
              </label>
              <Field
                type="range"
                name="learningProgressPercent"
                id="learningProgressPercent"
                min="0"
                max="100"
                step="5"
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Media (optional)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
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
                        accept="image/*,video/*"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
              
              {previewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      {url && files[index].type.startsWith('image/') ? (
                        <img src={url} alt={`Preview ${index}`} className="h-32 object-cover w-full rounded-lg" />
                      ) : (
                        <video className="h-32 object-cover w-full rounded-lg" controls>
                          <source src={url} type={files[index].type} />
                          Your browser does not support the video tag.
                        </video>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"
                        aria-label="Remove"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || formSubmitting}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isSubmitting || formSubmitting ? 'Publishing...' : 'Publish Post'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreatePostPage;
