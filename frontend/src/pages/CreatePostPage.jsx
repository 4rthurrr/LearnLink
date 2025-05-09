import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createPost } from '../api/postApi';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeading, faAlignLeft, faLayerGroup, faChartLine, 
  faImages, faUpload, faTimes, faPaperPlane, faSpinner
} from '@fortawesome/free-solid-svg-icons';
import AOS from 'aos';
import 'aos/dist/aos.css';

const CreatePostPage = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Initialize AOS animation library
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out'
    });
    
    // Clean up preview URLs when component unmounts
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

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
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      
      // Validate file types and sizes
      const validFiles = droppedFiles.filter(file => {
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
        
        const newPreviewUrls = validFiles.map(file => {
          return URL.createObjectURL(file);
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

  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl overflow-hidden mb-8"
      >
        <div className="p-8 md:p-12 relative">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl md:text-4xl font-extrabold text-white mb-4"
            >
              Create a Post
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-indigo-100 text-lg mb-0 max-w-3xl"
            >
              Share your knowledge, ask questions, or document your learning journey with the community.
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="max-w-3xl mx-auto">
        {error && (
          <motion.div 
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            exit={fadeIn.exit}
            className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FontAwesomeIcon icon={faTimes} className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white shadow-lg rounded-2xl overflow-hidden"
          data-aos="fade-up"
        >
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
              <Form className="p-8">
                <div className="space-y-6">
                  {/* Title Field */}
                  <div data-aos="fade-up" data-aos-delay="100">
                    <label htmlFor="title" className="flex items-center text-gray-700 font-medium mb-2">
                      <FontAwesomeIcon icon={faHeading} className="mr-2 text-indigo-500" />
                      <span>Title</span>
                    </label>
                    <Field
                      type="text"
                      name="title"
                      id="title"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="What would you like to share today?"
                    />
                    <ErrorMessage name="title" component="div" className="mt-2 text-red-600 text-sm" />
                  </div>

                  {/* Content Field */}
                  <div data-aos="fade-up" data-aos-delay="200">
                    <label htmlFor="content" className="flex items-center text-gray-700 font-medium mb-2">
                      <FontAwesomeIcon icon={faAlignLeft} className="mr-2 text-indigo-500" />
                      <span>Content</span>
                    </label>
                    <Field
                      as="textarea"
                      name="content"
                      id="content"
                      rows="8"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Share your learning journey, tips, or questions with the community..."
                    />
                    <ErrorMessage name="content" component="div" className="mt-2 text-red-600 text-sm" />
                  </div>

                  {/* Category Field */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div data-aos="fade-up" data-aos-delay="300">
                      <label htmlFor="category" className="flex items-center text-gray-700 font-medium mb-2">
                        <FontAwesomeIcon icon={faLayerGroup} className="mr-2 text-indigo-500" />
                        <span>Category</span>
                      </label>
                      <Field
                        as="select"
                        name="category"
                        id="category"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
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
                      <ErrorMessage name="category" component="div" className="mt-2 text-red-600 text-sm" />
                    </div>

                    {/* Learning Progress Field */}
                    <div data-aos="fade-up" data-aos-delay="400">
                      <label htmlFor="learningProgressPercent" className="flex items-center text-gray-700 font-medium mb-2">
                        <FontAwesomeIcon icon={faChartLine} className="mr-2 text-indigo-500" />
                        <span>Learning Progress: <span className="font-bold text-indigo-600">{values.learningProgressPercent}%</span></span>
                      </label>
                      <Field
                        type="range"
                        name="learningProgressPercent"
                        id="learningProgressPercent"
                        min="0"
                        max="100"
                        step="5"
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Beginner</span>
                        <span>Intermediate</span>
                        <span>Advanced</span>
                      </div>
                    </div>
                  </div>

                  {/* Media Upload Field */}
                  <div data-aos="fade-up" data-aos-delay="500">
                    <label className="flex items-center text-gray-700 font-medium mb-2">
                      <FontAwesomeIcon icon={faImages} className="mr-2 text-indigo-500" />
                      <span>Media (Optional)</span>
                    </label>
                    <div 
                      className={`mt-2 border-2 border-dashed rounded-lg p-6 transition-colors ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="text-center">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="mb-4 inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100"
                        >
                          <FontAwesomeIcon icon={faUpload} className="h-8 w-8 text-indigo-600" />
                        </motion.div>
                        <p className="text-sm text-gray-700 mb-2">Drag and drop your files here, or</p>
                        <motion.label
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faImages} className="mr-2" />
                          Browse Files
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            multiple
                            onChange={handleFileChange}
                            accept="image/*,video/*"
                          />
                        </motion.label>
                        <p className="mt-2 text-xs text-gray-500">
                          JPG, PNG, GIF, MP4 (max 10MB)
                        </p>
                      </div>
                    </div>
                    
                    {/* Preview Section */}
                    {previewUrls.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                        className="mt-4"
                      >
                        <h3 className="text-sm font-medium text-gray-700 mb-3">File Preview</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {previewUrls.map((url, index) => (
                            <motion.div 
                              key={index} 
                              className="relative rounded-lg overflow-hidden shadow-sm border border-gray-200 group"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2 }}
                              whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                            >
                              <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                                {url && files[index].type.startsWith('image/') ? (
                                  <img src={url} alt={`Preview ${index}`} className="object-cover w-full h-full" />
                                ) : (
                                  <video className="object-cover w-full h-full" controls>
                                    <source src={url} type={files[index].type} />
                                    Your browser does not support the video tag.
                                  </video>
                                )}
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1, backgroundColor: "#ef4444" }}
                                whileTap={{ scale: 0.9 }}
                                type="button"
                                onClick={() => removeFile(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm"
                                aria-label="Remove"
                              >
                                <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                              </motion.button>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Submit Button */}
                  <motion.div 
                    className="mt-8 text-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    data-aos="fade-up" 
                    data-aos-delay="600"
                  >
                    <button
                      type="submit"
                      disabled={isSubmitting || formSubmitting}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      {isSubmitting || formSubmitting ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                          Publish Post
                        </>
                      )}
                    </button>
                  </motion.div>
                </div>
              </Form>
            )}
          </Formik>
        </motion.div>
      </div>
    </div>
  );
};

export default CreatePostPage;

