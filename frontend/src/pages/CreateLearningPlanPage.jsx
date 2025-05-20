import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { createLearningPlan, getLearningPlanById, updateLearningPlan, uploadResourceFile, addResource } from '../api/learningPlanApi';
import { useAuth } from '../contexts/AuthContext';

const CreateLearningPlanPage = () => {
  const navigate = useNavigate();
  const { planId } = useParams();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [initialValues, setInitialValues] = useState({
    title: '',
    description: '',
    category: '',
    isPublic: true,
    estimatedDays: 30,
    startDate: '',
    targetCompletionDate: '',
    topics: [{ title: '', description: '', resources: [] }]
  });
  const [isLoading, setIsLoading] = useState(!!planId);
  const isEditMode = !!planId;
  const [fileResources, setFileResources] = useState({});  // To track file resources that need to be uploaded

  // Fetch learning plan data if in edit mode
  useEffect(() => {
    const fetchLearningPlan = async () => {
      if (planId) {
        try {
          setIsLoading(true);
          const planData = await getLearningPlanById(planId);
          
          // Check if the current user is the creator of the plan
          if (currentUser.id !== planData.creator?.id) {
            setError("You don't have permission to edit this learning plan");
            return;
          }
          
          // Format dates for form fields (YYYY-MM-DD)
          const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
          };
          
          setInitialValues({
            title: planData.title || '',
            description: planData.description || '',
            category: planData.category || '',
            isPublic: planData.isPublic !== undefined ? planData.isPublic : true,
            estimatedDays: planData.estimatedDays || 30,
            startDate: formatDate(planData.startDate),
            targetCompletionDate: formatDate(planData.targetCompletionDate),
            topics: planData.topics && planData.topics.length > 0 
              ? planData.topics.map(topic => ({
                  id: topic.id,
                  title: topic.title || '',
                  description: topic.description || '',
                  resources: topic.resources || []
                }))
              : [{ title: '', description: '', resources: [] }]
          });
        } catch (err) {
          console.error('Error fetching learning plan:', err);
          setError('Failed to load learning plan data');
          navigate('/profile');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchLearningPlan();
  }, [planId, currentUser, navigate]);

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
        description: Yup.string(),
        resources: Yup.array().of(
          Yup.object({
            title: Yup.string().required('Resource title is required'),
            url: Yup.string().when('resourceType', {
              is: 'url',
              then: () => Yup.string().required('Resource URL is required').url('Must be a valid URL'),
              otherwise: () => Yup.string().nullable()
            }),
            type: Yup.string().required('Resource type is required'),
            description: Yup.string(),
            resourceType: Yup.string().oneOf(['url', 'file'])
          })
        )
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
        topics: values.topics.map((topic, index) => {
          // Create a formatted topic object
          const formattedTopic = {
            id: topic.id, // Include ID for existing topics in edit mode
            title: topic.title,
            description: topic.description || "",
            orderIndex: index
          };
          
          // Only include resources if they exist and have items
          if (topic.resources && topic.resources.length > 0) {
            formattedTopic.resources = topic.resources.map((resource, resourceIndex) => ({
              id: resource.id, // Include ID for existing resources in edit mode
              title: resource.title,
              url: resource.resourceType === 'url' ? resource.url : '', // URL will be updated for file resources
              type: resource.type,
              description: resource.description || "",
              orderIndex: resourceIndex
            }));
          } else {
            formattedTopic.resources = []; // Ensure resources is always an array
          }
          
          return formattedTopic;
        })
      };
      
      console.log('Formatted values for submission:', JSON.stringify(formattedValues, null, 2));
      
      let learningPlan;
      
      if (isEditMode) {
        console.log('Updating learning plan:', JSON.stringify(formattedValues, null, 2));
        learningPlan = await updateLearningPlan(planId, formattedValues);
      } else {
        console.log('Creating learning plan:', JSON.stringify(formattedValues, null, 2));
        learningPlan = await createLearningPlan(formattedValues);
      }
      
      // Check if the response includes topics and resources
      if (!learningPlan.topics || learningPlan.topics.length === 0) {
        console.warn('Response missing topics array or has empty topics array');
      } else {
        learningPlan.topics.forEach((topic, i) => {
          if (!topic.resources) {
            console.warn(`Response topic ${i} (${topic.title}) missing resources array!`);
          } else if (topic.resources.length === 0) {
            console.log(`Response topic ${i} (${topic.title}) has empty resources array`);
          } else {
            console.log(`Response topic ${i} (${topic.title}) has ${topic.resources.length} resources`);
          }
        });
      }
      
      // After creating the learning plan, fetch it again to make sure we have the complete data
      const newPlanId = learningPlan.id || planId;
      console.log(`Fetching complete learning plan with ID: ${newPlanId}`);
      const completeLearningPlan = await getLearningPlanById(newPlanId);
      
      // Handle PDF file uploads after the learning plan is created/updated
      const fileUploads = [];
      
      // Process all file resources
      if (completeLearningPlan.topics && completeLearningPlan.topics.length > 0) {
        for (let topicIndex = 0; topicIndex < values.topics.length && topicIndex < completeLearningPlan.topics.length; topicIndex++) {
          const topic = values.topics[topicIndex];
          const serverTopic = completeLearningPlan.topics[topicIndex];
          
          // Make sure we have a corresponding topic in the response
          if (serverTopic && serverTopic.id) {
            const topicId = serverTopic.id;
            
            if (topic.resources && topic.resources.length > 0) {
              // Create resources manually if they don't exist in the response
              if (!serverTopic.resources || serverTopic.resources.length < topic.resources.length) {
                console.log(`Server topic ${topicIndex} is missing resources, will create them individually`);
                
                // Create resources one by one for this topic
                for (let resourceIndex = 0; resourceIndex < topic.resources.length; resourceIndex++) {
                  const resource = topic.resources[resourceIndex];
                  
                  // Check if this resource needs to be created
                  const serverResources = serverTopic.resources || [];
                  if (resourceIndex >= serverResources.length) {
                    try {
                      // Create a resource directly
                      const resourceData = {
                        title: resource.title,
                        url: resource.resourceType === 'url' ? resource.url : '',
                        type: resource.type,
                        description: resource.description || "",
                        orderIndex: resourceIndex
                      };
                      
                      console.log(`Creating resource for topic ${topicIndex}:`, resourceData);
                      const createdResource = await addResource(newPlanId, topicId, resourceData);
                      console.log(`Resource created:`, createdResource);
                      
                      // If this is a file resource, upload the file
                      if (resource.resourceType === 'file') {
                        const fileKey = `${topicIndex}-${resourceIndex}`;
                        const file = fileResources[fileKey];
                        
                        if (file && createdResource.id) {
                          // Create FormData and append the file
                          const formData = new FormData();
                          formData.append('file', file);
                          formData.append('resourceId', createdResource.id);
                          
                          // Upload the file now
                          console.log(`Uploading file for resource ${createdResource.id}`);
                          await uploadResourceFile(newPlanId, topicId, formData, createdResource.id);
                        }
                      }
                    } catch (err) {
                      console.error(`Failed to create resource:`, err);
                    }
                  } else if (resource.resourceType === 'file') {
                    // Handle file upload for existing resources
                    const fileKey = `${topicIndex}-${resourceIndex}`;
                    const file = fileResources[fileKey];
                    const resourceId = serverResources[resourceIndex].id;
                    
                    if (file && resourceId) {
                      // Create FormData and append the file
                      const formData = new FormData();
                      formData.append('file', file);
                      formData.append('resourceId', resourceId);
                      
                      // Add to the list of upload promises
                      fileUploads.push(uploadResourceFile(newPlanId, topicId, formData, resourceId));
                    }
                  }
                }
              } else {
                // Handle file uploads for resources that already exist
                for (let resourceIndex = 0; resourceIndex < topic.resources.length && resourceIndex < serverTopic.resources.length; resourceIndex++) {
                  const resource = topic.resources[resourceIndex];
                  
                  if (resource.resourceType === 'file') {
                    const fileKey = `${topicIndex}-${resourceIndex}`;
                    const file = fileResources[fileKey];
                    const resourceId = serverTopic.resources[resourceIndex].id;
                    
                    if (file && resourceId) {
                      // Create FormData and append the file
                      const formData = new FormData();
                      formData.append('file', file);
                      formData.append('resourceId', resourceId);
                      
                      // Add to the list of upload promises
                      fileUploads.push(uploadResourceFile(newPlanId, topicId, formData, resourceId));
                    }
                  }
                }
              }
            }
          }
        }
      }
      
      // Execute all file uploads if there are any
      if (fileUploads.length > 0) {
        console.log(`Uploading ${fileUploads.length} files...`);
        await Promise.all(fileUploads);
      }
      
      // Navigate to the learning plan
      navigate(`/learning-plan/${newPlanId}`);
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} learning plan:`, error);
      setError(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} learning plan`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit Learning Plan' : 'Create Learning Plan'}</h1>
      
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
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ values, isSubmitting: formSubmitting }) => (
          <Form className="space-y-6 bg-white p-6 rounded-lg shadow">
            {/* Basic Information */}
            <div className="space-y-4 pb-4 border-b">
              <h2 className="text-lg font-medium">Basic Information</h2>
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <Field
                  type="text"
                  name="title"
                  id="title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Give your learning plan a title"
                />
                <ErrorMessage name="title" component="div" className="mt-1 text-red-600 text-sm" />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Field
                  as="textarea"
                  name="description"
                  id="description"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe your learning plan..."
                />
                <ErrorMessage name="description" component="div" className="mt-1 text-red-600 text-sm" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label htmlFor="estimatedDays" className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Days to Complete
                  </label>
                  <Field
                    type="number"
                    name="estimatedDays"
                    id="estimatedDays"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <ErrorMessage name="estimatedDays" component="div" className="mt-1 text-red-600 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date (Optional)
                  </label>
                  <Field
                    type="date"
                    name="startDate"
                    id="startDate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <ErrorMessage name="startDate" component="div" className="mt-1 text-red-600 text-sm" />
                </div>
                
                <div>
                  <label htmlFor="targetCompletionDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Target Completion Date (Optional)
                  </label>
                  <Field
                    type="date"
                    name="targetCompletionDate"
                    id="targetCompletionDate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <ErrorMessage name="targetCompletionDate" component="div" className="mt-1 text-red-600 text-sm" />
                </div>
              </div>

              <div className="flex items-center">
                <Field
                  type="checkbox"
                  name="isPublic"
                  id="isPublic"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                  Make this learning plan public
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-medium">Topics</h2>
              <FieldArray name="topics">
                {({ push, remove }) => (
                  <div className="space-y-4">
                    {values.topics.map((topic, index) => (
                      <div key={index} className="border rounded-md p-4 bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">Topic {index + 1}</h3>
                          {values.topics.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label htmlFor={`topics.${index}.title`} className="block text-sm font-medium text-gray-700 mb-1">Topic Title</label>
                            <Field
                              type="text"
                              name={`topics.${index}.title`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <ErrorMessage name={`topics.${index}.title`} component="div" className="mt-1 text-red-600 text-sm" />
                          </div>
                          <div>
                            <Field
                              as="textarea"
                              name={`topics.${index}.description`}
                              rows="2"
                              placeholder="Topic description (optional)"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          
                          {/* Resources Section */}
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Resources</h4>
                            <FieldArray name={`topics.${index}.resources`}>
                              {({ push: pushResource, remove: removeResource }) => (
                                <div className="space-y-3">
                                  {topic.resources && topic.resources.length > 0 ? (
                                    topic.resources.map((resource, resourceIndex) => (
                                      <div key={resourceIndex} className="p-3 bg-white border border-gray-200 rounded-md">
                                        <div className="flex justify-between items-center mb-2">
                                          <h5 className="text-xs font-medium text-gray-700">Resource {resourceIndex + 1}</h5>
                                          <button
                                            type="button"
                                            onClick={() => removeResource(resourceIndex)}
                                            className="text-red-500 hover:text-red-700 text-xs"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <div>
                                            <Field
                                              type="text"
                                              name={`topics.${index}.resources.${resourceIndex}.title`}
                                              placeholder="Resource title"
                                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            <ErrorMessage name={`topics.${index}.resources.${resourceIndex}.title`} component="div" className="mt-1 text-red-600 text-xs" />
                                          </div>
                                          
                                          {/* Resource Type Selector */}
                                          <div className="flex space-x-2 mb-2">
                                            <label className="inline-flex items-center">
                                              <Field
                                                type="radio"
                                                name={`topics.${index}.resources.${resourceIndex}.resourceType`}
                                                value="url"
                                                className="form-radio h-4 w-4 text-indigo-600"
                                              />
                                              <span className="ml-2 text-xs text-gray-700">URL</span>
                                            </label>
                                            <label className="inline-flex items-center">
                                              <Field
                                                type="radio"
                                                name={`topics.${index}.resources.${resourceIndex}.resourceType`}
                                                value="file"
                                                className="form-radio h-4 w-4 text-indigo-600"
                                              />
                                              <span className="ml-2 text-xs text-gray-700">PDF File</span>
                                            </label>
                                          </div>
                                          
                                          {/* URL Input - Show if resourceType is url */}
                                          {resource.resourceType === 'url' && (
                                            <div>
                                              <Field
                                                type="text"
                                                name={`topics.${index}.resources.${resourceIndex}.url`}
                                                placeholder="URL (e.g., https://example.com)"
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                              />
                                              <ErrorMessage name={`topics.${index}.resources.${resourceIndex}.url`} component="div" className="mt-1 text-red-600 text-xs" />
                                            </div>
                                          )}
                                          
                                          {/* File Input - Show if resourceType is file */}
                                          {resource.resourceType === 'file' && (
                                            <div>
                                              <input
                                                type="file"
                                                id={`file-resource-${index}-${resourceIndex}`}
                                                accept="application/pdf"
                                                onChange={(event) => {
                                                  const file = event.currentTarget.files[0];
                                                  if (file) {
                                                    // Store the file in our state tracker
                                                    setFileResources(prev => ({
                                                      ...prev,
                                                      [`${index}-${resourceIndex}`]: file
                                                    }));
                                                  }
                                                }}
                                                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                              />
                                              <p className="mt-1 text-xs text-gray-500">Only PDF files are supported</p>
                                            </div>
                                          )}
                                          
                                          <div>
                                            <Field
                                              as="select"
                                              name={`topics.${index}.resources.${resourceIndex}.type`}
                                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                              <option value="">Select type</option>
                                              <option value="ARTICLE">Article</option>
                                              <option value="VIDEO">Video</option>
                                              <option value="COURSE">Course</option>
                                              <option value="BOOK">Book</option>
                                              <option value="PDF">PDF</option>
                                              <option value="OTHER">Other</option>
                                            </Field>
                                            <ErrorMessage name={`topics.${index}.resources.${resourceIndex}.type`} component="div" className="mt-1 text-red-600 text-xs" />
                                          </div>
                                          
                                          <div>
                                            <Field
                                              as="textarea"
                                              name={`topics.${index}.resources.${resourceIndex}.description`}
                                              placeholder="Description (optional)"
                                              rows="2"
                                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-center py-3 bg-gray-50 rounded-md">
                                      <p className="text-sm text-gray-500">No resources added yet</p>
                                    </div>
                                  )}
                                  
                                  <button
                                    type="button"
                                    onClick={() => pushResource({ title: '', url: '', type: 'ARTICLE', description: '', resourceType: 'url' })}
                                    className="w-full py-2 px-3 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                  >
                                    <svg className="-ml-0.5 mr-1 h-3 w-3 inline" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Add Resource
                                  </button>
                                </div>
                              )}
                            </FieldArray>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => push({ title: '', description: '' })}
                      className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Topic
                    </button>
                  </div>
                )}
              </FieldArray>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || formSubmitting}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              >
                {isSubmitting || formSubmitting 
                  ? (isEditMode ? 'Saving...' : 'Creating...') 
                  : (isEditMode ? 'Save Changes' : 'Create Learning Plan')}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreateLearningPlanPage;
