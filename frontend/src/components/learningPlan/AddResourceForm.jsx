import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { addResource } from '../../api/learningPlanApi';

const AddResourceForm = ({ planId, topicId, onSuccess, onFileSelect }) => {
  const [error, setError] = useState('');
  const [resourceType, setResourceType] = useState('ARTICLE');
  const [selectedFile, setSelectedFile] = useState(null);
  
  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    url: Yup.string().when('resourceType', {
      is: 'file',
      then: () => Yup.string(),
      otherwise: () => Yup.string().required('URL is required').url('Must be a valid URL')
    }),
    type: Yup.string().required('Resource type is required'),
    description: Yup.string(),
    resourceType: Yup.string().required('Resource type is required')
  });
  
  const handleSubmit = async (values, { resetForm }) => {
    try {
      // If it's a file, we need to handle it differently
      if (values.resourceType === 'file') {
        if (!selectedFile) {
          setError('Please select a file to upload');
          return;
        }
        
        // Create a resource entry with a temporary URL
        const resourceData = {
          title: values.title,
          url: 'pending_upload', // Will be updated after file upload
          type: values.type,
          description: values.description
        };
        
        // First create the resource
        const createdResource = await addResource(planId, topicId, resourceData);
        
        // Then pass the file and resourceId to the parent component for upload
        if (onFileSelect && createdResource && createdResource.id) {
          onFileSelect(topicId, selectedFile, createdResource.id);
        } else {
          setError('Failed to get resource ID for file upload');
        }
        
        resetForm();
        if (onSuccess) onSuccess();
      } else {
        // Regular URL resource
        await addResource(planId, topicId, {
          title: values.title,
          url: values.url,
          type: values.type,
          description: values.description
        });
        resetForm();
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error('Error adding resource:', err);
      setError('Failed to add resource');
    }
  };
  
  const handleResourceTypeChange = (e, setFieldValue) => {
    const value = e.target.value;
    setResourceType(value);
    setFieldValue('resourceType', value);
    
    // Clear URL field if switching to file type
    if (value === 'file') {
      setFieldValue('url', '');
    }
  };
  
  const handleFileChange = (e, setFieldValue) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        e.target.value = '';
        return;
      }
      
      // Clear any previous errors
      setError('');
      
      // Store the file for later upload
      setSelectedFile(file);
      
      // Update the form values
      setFieldValue('resourceType', 'file');
      setResourceType('file');
    }
  };
  
  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="text-sm font-medium text-gray-900 mb-2">Add Resource</h4>
      
      {error && (
        <div className="mb-4 text-sm text-red-600">
          {error}
        </div>
      )}
      
      <Formik
        initialValues={{
          title: '',
          url: '',
          type: 'ARTICLE',
          description: '',
          resourceType: 'url'
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form className="space-y-4">
            <div>
              <Field
                type="text"
                name="title"
                placeholder="Resource title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <ErrorMessage name="title" component="div" className="mt-1 text-red-600 text-xs" />
            </div>
            
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="resourceType"
                  value="url"
                  checked={resourceType === 'url'}
                  onChange={(e) => handleResourceTypeChange(e, setFieldValue)}
                  className="mr-2"
                />
                URL
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="resourceType"
                  value="file"
                  checked={resourceType === 'file'}
                  onChange={(e) => handleResourceTypeChange(e, setFieldValue)}
                  className="mr-2"
                />
                Upload PDF
              </label>
            </div>
            
            {resourceType === 'url' ? (
              <div>
                <Field
                  type="text"
                  name="url"
                  placeholder="URL (e.g., https://example.com)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <ErrorMessage name="url" component="div" className="mt-1 text-red-600 text-xs" />
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(e, setFieldValue)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="mt-1 text-xs text-gray-500">Only PDF files are allowed</p>
              </div>
            )}
            
            <div>
              <Field
                as="select"
                name="type"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="ARTICLE">Article</option>
                <option value="VIDEO">Video</option>
                <option value="COURSE">Course</option>
                <option value="BOOK">Book</option>
                <option value="PDF">PDF Document</option>
                <option value="OTHER">Other</option>
              </Field>
              <ErrorMessage name="type" component="div" className="mt-1 text-red-600 text-xs" />
            </div>
            
            <div>
              <Field
                as="textarea"
                name="description"
                placeholder="Description (optional)"
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isSubmitting ? 'Adding...' : 'Add Resource'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddResourceForm;
