import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { createLearningPlan } from '../api/learningPlanApi';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGraduationCap, faTimes, faPlus, faList, faInfoCircle, 
  faCalendarAlt, faClock, faGlobe, faSave
} from '@fortawesome/free-solid-svg-icons';
import AOS from 'aos';

const CreateLearningPlanPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    // Initialize AOS animation library
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out'
    });
  }, []);

  // Define validation schema
  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
    description: Yup.string().required('Description is required'),
    category: Yup.string().required('Please select a category'),
    isPublic: Yup.boolean(),
    estimatedDays: Yup.number().positive('Days must be positive').integer('Days must be a whole number').required('Estimated days is required'),
    startDate: Yup.date().nullable(),
    targetCompletionDate: Yup.date().nullable()
      .min(
        Yup.ref('startDate'), 
        'Target completion date must be after start date'
      ),
    topics: Yup.array().of(
      Yup.object({
        title: Yup.string().required('Topic title is required'),
        description: Yup.string()
      })
    ).min(1, 'At least one topic is required')
  });

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    setError('');
    try {
      // Format the data properly for the API
      const formattedValues = {
        title: values.title,
        description: values.description,
        category: values.category,
        isPublic: values.isPublic,
        estimatedDays: parseInt(values.estimatedDays),
        // Include date fields if they have values
        startDate: values.startDate || null,
        targetCompletionDate: values.targetCompletionDate || null,
        topics: values.topics.map((topic, index) => ({
          title: topic.title,
          description: topic.description || "",
          orderIndex: index
        }))
      };
      
      console.log('Submitting learning plan:', JSON.stringify(formattedValues, null, 2));
      const learningPlan = await createLearningPlan(formattedValues);
      
      // Show success animation before redirecting
      setTimeout(() => {
        // Navigate to the created learning plan
        navigate(`/learning-plan/${learningPlan.id}`);
      }, 1000);
    } catch (error) {
      console.error('Error creating learning plan:', error);
      setError(error.response?.data?.message || 'Failed to create learning plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    },
    exit: { 
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 }
    }
  };

  const slideIn = {
    hidden: { x: 300, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    exit: { 
      x: -300, 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Header with Animation */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          <span className="inline-block mr-2">
            <FontAwesomeIcon icon={faGraduationCap} className="text-indigo-600" />
          </span>
          Create Learning Plan
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          Share your knowledge and help others learn with a structured learning plan
        </p>
      </motion.div>

      {/* Steps Indicator */}
      <div className="mb-8" data-aos="fade-up" data-aos-delay="100">
        <div className="flex items-center justify-center">
          <div className="flex items-center w-full max-w-3xl mx-auto">
            {[1, 2].map((step) => (
              <div key={step} className="flex-1">
                <div className="flex items-center">
                  <div 
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center 
                      ${currentStep >= step ? 'bg-indigo-600' : 'bg-gray-300'} 
                      transition-colors duration-300`}
                  >
                    <span className="text-white font-medium">{step}</span>
                  </div>
                  <div 
                    className={`flex-1 ml-4 ${step === 2 ? 'hidden' : ''}`}
                  >
                    <div 
                      className={`h-1 ${currentStep > step ? 'bg-indigo-600' : 'bg-gray-300'} 
                        transition-colors duration-300`}
                    ></div>
                  </div>
                </div>
                <div className="text-center mt-2">
                  <span 
                    className={`text-sm font-medium ${currentStep >= step ? 'text-indigo-600' : 'text-gray-500'}`}
                  >
                    {step === 1 ? 'Basic Information' : 'Topics'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Error Message with Animation */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md shadow-sm"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <FontAwesomeIcon icon={faTimes} className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Formik
        initialValues={{
          title: '',
          description: '',
          category: '',
          isPublic: true,
          estimatedDays: 30,
          startDate: '',
          targetCompletionDate: '',
          topics: [{ title: '', description: '' }]
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting: formSubmitting, errors, touched }) => (
          <Form>
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  variants={slideIn}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-100"
                >
                  {/* Basic Information */}
                  <div className="space-y-6" data-aos="fade-up">
                    <div className="flex items-center mb-2">
                      <FontAwesomeIcon icon={faInfoCircle} className="text-indigo-600 mr-2" />
                      <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                    </div>
                    
                    <div className="relative group">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                      <Field
                        type="text"
                        name="title"
                        id="title"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        placeholder="Give your learning plan a clear, descriptive title"
                      />
                      <ErrorMessage name="title">
                        {msg => (
                          <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="mt-1 text-red-600 text-sm"
                          >
                            {msg}
                          </motion.div>
                        )}
                      </ErrorMessage>
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                      <Field
                        as="textarea"
                        name="description"
                        id="description"
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        placeholder="Describe what learners will achieve with this learning plan..."
                      />
                      <ErrorMessage name="description">
                        {msg => (
                          <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="mt-1 text-red-600 text-sm"
                          >
                            {msg}
                          </motion.div>
                        )}
                      </ErrorMessage>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <Field
                            as="select"
                            name="category"
                            id="category"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none transition-all duration-200"
                          >
                            <option value="" disabled>Select a category</option>
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
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <ErrorMessage name="category">
                          {msg => (
                            <motion.div 
                              initial={{ opacity: 0 }} 
                              animate={{ opacity: 1 }} 
                              className="mt-1 text-red-600 text-sm"
                            >
                              {msg}
                            </motion.div>
                          )}
                        </ErrorMessage>
                      </div>
                      
                      <div>
                        <label htmlFor="estimatedDays" className="block text-sm font-medium text-gray-700 mb-1">
                          <FontAwesomeIcon icon={faClock} className="mr-1" /> Estimated Days to Complete <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="number"
                          name="estimatedDays"
                          id="estimatedDays"
                          min="1"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        />
                        <ErrorMessage name="estimatedDays">
                          {msg => (
                            <motion.div 
                              initial={{ opacity: 0 }} 
                              animate={{ opacity: 1 }} 
                              className="mt-1 text-red-600 text-sm"
                            >
                              {msg}
                            </motion.div>
                          )}
                        </ErrorMessage>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                          <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" /> Start Date (Optional)
                        </label>
                        <Field
                          type="date"
                          name="startDate"
                          id="startDate"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        />
                        <ErrorMessage name="startDate">
                          {msg => (
                            <motion.div 
                              initial={{ opacity: 0 }} 
                              animate={{ opacity: 1 }} 
                              className="mt-1 text-red-600 text-sm"
                            >
                              {msg}
                            </motion.div>
                          )}
                        </ErrorMessage>
                      </div>
                      
                      <div>
                        <label htmlFor="targetCompletionDate" className="block text-sm font-medium text-gray-700 mb-1">
                          <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" /> Target Completion Date (Optional)
                        </label>
                        <Field
                          type="date"
                          name="targetCompletionDate"
                          id="targetCompletionDate"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        />
                        <ErrorMessage name="targetCompletionDate">
                          {msg => (
                            <motion.div 
                              initial={{ opacity: 0 }} 
                              animate={{ opacity: 1 }} 
                              className="mt-1 text-red-600 text-sm"
                            >
                              {msg}
                            </motion.div>
                          )}
                        </ErrorMessage>
                      </div>
                    </div>

                    <div className="flex items-center mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="relative inline-block w-10 mr-4 align-middle select-none">
                        <Field
                          type="checkbox"
                          name="isPublic"
                          id="isPublic"
                          className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer focus:outline-none transition-transform duration-200 ease-in-out"
                        />
                        <label
                          htmlFor="isPublic"
                          className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                        ></label>
                      </div>
                      <label htmlFor="isPublic" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center">
                        <FontAwesomeIcon icon={faGlobe} className="mr-2 text-indigo-500" />
                        Make this learning plan public and help others learn
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <motion.button
                      type="button"
                      onClick={nextStep}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={
                        !values.title || !values.description || !values.category || !values.estimatedDays ||
                        errors.title || errors.description || errors.category || errors.estimatedDays
                      }
                    >
                      Continue to Topics
                      <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  variants={slideIn}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-100"
                >
                  <div className="space-y-6" data-aos="fade-up">
                    <div className="flex items-center mb-2">
                      <FontAwesomeIcon icon={faList} className="text-indigo-600 mr-2" />
                      <h2 className="text-xl font-semibold text-gray-900">Define Your Learning Topics</h2>
                    </div>
                    
                    <p className="text-sm text-gray-500">
                      Break down your learning plan into manageable topics to help learners track their progress.
                    </p>

                    <FieldArray name="topics">
                      {({ push, remove }) => (
                        <div className="space-y-6">
                          {values.topics.map((topic, index) => (
                            <motion.div 
                              key={index} 
                              className="border rounded-xl p-6 bg-gray-50 relative group"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              whileHover={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                            >
                              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                {values.topics.length > 1 && (
                                  <motion.button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                                  </motion.button>
                                )}
                              </div>
                              
                              <div className="flex items-center mb-4">
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                                  {index + 1}
                                </div>
                                <h3 className="ml-3 font-medium text-gray-900">Topic {index + 1}</h3>
                              </div>
                              
                              <div className="space-y-4">
                                <div>
                                  <label htmlFor={`topics.${index}.title`} className="block text-sm font-medium text-gray-700 mb-1">Topic Title <span className="text-red-500">*</span></label>
                                  <Field
                                    type="text"
                                    name={`topics.${index}.title`}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                    placeholder="What will be learned in this topic?"
                                  />
                                  <ErrorMessage name={`topics.${index}.title`}>
                                    {msg => (
                                      <motion.div 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        className="mt-1 text-red-600 text-sm"
                                      >
                                        {msg}
                                      </motion.div>
                                    )}
                                  </ErrorMessage>
                                </div>
                                <div>
                                  <label htmlFor={`topics.${index}.description`} className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                  <Field
                                    as="textarea"
                                    name={`topics.${index}.description`}
                                    rows="3"
                                    placeholder="Provide additional details about this topic..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                  />
                                </div>
                              </div>
                            </motion.div>
                          ))}

                          <motion.button
                            type="button"
                            onClick={() => push({ title: '', description: '' })}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <FontAwesomeIcon icon={faPlus} className="mr-2 text-indigo-600" />
                            Add Another Topic
                          </motion.button>
                        </div>
                      )}
                    </FieldArray>
                  </div>

                  <div className="flex justify-between pt-6 border-t border-gray-200">
                    <motion.button
                      type="button"
                      onClick={prevStep}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <svg className="mr-2 -ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                      Back
                    </motion.button>

                    <motion.button
                      type="submit"
                      disabled={isSubmitting || formSubmitting}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-all duration-200"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <FontAwesomeIcon icon={faSave} className="mr-2" />
                      {isSubmitting || formSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v1a7 7 0 00-7 7h1zm10-1a1 1 0 011 1v4a1 1 0 11-2 0v-4a1 1 0 011-1z"></path>
                          </svg>
                          Creating...
                        </span>
                      ) : (
                        "Create Learning Plan"
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreateLearningPlanPage;
