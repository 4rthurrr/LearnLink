import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { createLearningPlan } from '../api/learningPlanApi';

const CreateLearningPlanPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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
        isPublic: true,
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
      
      // Navigate to the created learning plan
      navigate(`/learning-plan/${learningPlan.id}`);
    } catch (error) {
      console.error('Error creating learning plan:', error);
      setError(error.response?.data?.message || 'Failed to create learning plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create Learning Plan</h1>
      
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

            <button
              type="submit"
              disabled={isSubmitting || formSubmitting}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isSubmitting || formSubmitting ? 'Creating...' : 'Create Learning Plan'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreateLearningPlanPage;
