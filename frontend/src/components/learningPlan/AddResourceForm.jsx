import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { addResource } from '../../api/learningPlanApi';

const AddResourceForm = ({ planId, topicId, onSuccess }) => {
  const [error, setError] = useState('');
  
  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    url: Yup.string().required('URL is required').url('Must be a valid URL'),
    type: Yup.string().required('Resource type is required'),
    description: Yup.string()
  });
  
  const handleSubmit = async (values, { resetForm }) => {
    try {
      await addResource(planId, topicId, values);
      resetForm();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error adding resource:', err);
      setError('Failed to add resource');
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
          description: ''
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
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
            
            <div>
              <Field
                type="text"
                name="url"
                placeholder="URL (e.g., https://example.com)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <ErrorMessage name="url" component="div" className="mt-1 text-red-600 text-xs" />
            </div>
            
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
