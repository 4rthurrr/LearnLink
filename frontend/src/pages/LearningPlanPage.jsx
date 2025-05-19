import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getLearningPlanById, updateTopicStatus, updateResourceStatus } from '../api/learningPlanApi';
import { formatDistanceToNow } from 'date-fns';

const LearningPlanPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  
  const [learningPlan, setLearningPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState({});

  const fetchLearningPlan = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLearningPlanById(planId);
      console.log('Fetched learning plan:', JSON.stringify(data, null, 2));
      setLearningPlan(data);
      
      // Add debugging for topics and resources
      if (!data.topics || data.topics.length === 0) {
        console.warn('Retrieved learning plan has no topics');
      } else {
        console.log(`Retrieved learning plan has ${data.topics.length} topics`);
        
        // Debug resources for each topic
        data.topics.forEach((topic, index) => {
          if (!topic.resources) {
            console.warn(`Topic ${index + 1} (${topic.title}) has no resources array`);
          } else if (topic.resources.length === 0) {
            console.log(`Topic ${index + 1} (${topic.title}) has empty resources array`);
          } else {
            console.log(`Topic ${index + 1} (${topic.title}) has ${topic.resources.length} resources`, topic.resources);
          }
        });
      }
      
      // Initialize expanded state for topics
      const expanded = {};
      if (data.topics) {
        data.topics.forEach(topic => {
          expanded[topic.id] = false;
        });
      }
      setExpandedTopics(expanded);
    } catch (err) {
      console.error('Error fetching learning plan:', err);
      setError('Failed to load learning plan. It may have been deleted or you may not have permission to view it.');
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    fetchLearningPlan();
  }, [fetchLearningPlan]);

  const handleTopicStatusChange = async (topicId, newStatus) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      await updateTopicStatus(planId, topicId, newStatus);
      // Refresh the learning plan to get updated data
      await fetchLearningPlan();
    } catch (err) {
      console.error('Error updating topic status:', err);
      setError('Failed to update topic status. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResourceStatusChange = async (topicId, resourceId, isCompleted) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      await updateResourceStatus(planId, topicId, resourceId, isCompleted);
      // Refresh the learning plan to get updated data
      await fetchLearningPlan();
    } catch (err) {
      console.error('Error updating resource status:', err);
      setError('Failed to update resource status. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleTopicExpand = (topicId) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !learningPlan) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 101.414 1.414L10 11.414l1.293 1.293a1 1 001.414-1.414L11.414 10l1.293-1.293a1 1 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || "Learning plan not found"}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="text-indigo-600 hover:text-indigo-800"
        >
          ← Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{learningPlan.title}</h1>
            <div className="flex items-center text-sm text-gray-500">
              <Link to={`/profile/${learningPlan.creator.id}`} className="flex items-center hover:text-indigo-600">
                <img 
                  src={learningPlan.creator.profilePicture || "https://via.placeholder.com/150"} 
                  alt={learningPlan.creator.name} 
                  className="h-6 w-6 rounded-full mr-2"
                />
                <span>{learningPlan.creator.name}</span>
              </Link>
              <span className="mx-2">•</span>
              <span>Created {formatDate(learningPlan.createdAt)}</span>
              {learningPlan.category && (
                <>
                  <span className="mx-2">•</span>
                  <span className="capitalize">{learningPlan.category.toLowerCase()}</span>
                </>
              )}
            </div>
          </div>
          
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 011.414 0L10 8.586l4.293-4.293a1 1 011.414 1.414L11.414 10l4.293 4.293a1 1 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <p className="text-gray-700 whitespace-pre-line">{learningPlan.description}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-bold text-indigo-600">{learningPlan.completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full" 
              style={{ width: `${learningPlan.completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Details */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Estimated Duration</dt>
              <dd className="mt-1 text-sm text-gray-900">{learningPlan.estimatedDays} days</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Start Date</dt>
              <dd className="mt-1 text-sm text-gray-900">{learningPlan.startDate ? new Date(learningPlan.startDate).toLocaleDateString() : 'Not set'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Target Completion</dt>
              <dd className="mt-1 text-sm text-gray-900">{learningPlan.targetCompletionDate ? new Date(learningPlan.targetCompletionDate).toLocaleDateString() : 'Not set'}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Topics */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Learning Topics ({learningPlan.topics ? learningPlan.topics.length : 0})</h2>
      
      <div className="space-y-4">
        {!learningPlan.topics || learningPlan.topics.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">No topics have been added to this learning plan yet.</p>
          </div>
        ) : (
          learningPlan.topics.map((topic, index) => (
            <div key={topic.id || index} className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
                      Topic {index + 1}
                    </span>
                    <h3 className="text-lg font-medium text-gray-900">{topic.title}</h3>
                  </div>
                  
                  <div className="mt-1 text-sm text-gray-500 flex items-center">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                      ${topic.completionStatus === 'COMPLETED' 
                        ? 'bg-green-100 text-green-800' 
                        : topic.completionStatus === 'IN_PROGRESS' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-gray-100 text-gray-800'}`}
                    >
                      {topic.completionStatus === 'COMPLETED' 
                        ? 'Completed' 
                        : topic.completionStatus === 'IN_PROGRESS' 
                          ? 'In Progress' 
                          : 'Not Started'}
                    </span>
                    
                    {topic.resources && topic.resources.length > 0 && (
                      <span className="ml-3">{topic.resources.length} {topic.resources.length === 1 ? 'resource' : 'resources'}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Status change dropdown */}
                  <select
                    value={topic.completionStatus}
                    onChange={(e) => handleTopicStatusChange(topic.id, e.target.value)}
                    disabled={isProcessing}
                    className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                  
                  {/* Expand/collapse button */}
                  <button 
                    onClick={() => toggleTopicExpand(topic.id)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    {expandedTopics[topic.id] ? (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 011.414 0L10 10.586l3.293-3.293a1 1 011.414 1.414l-4 4a1 1 01-1.414 0l-4-4a1 1 010-1.414z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 01-1.414 0L10 9.414l-3.293 3.293a1 1 01-1.414-1.414l4-4a1 1 011.414 0l4 4a1 1 010 1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Topic description and resources */}
              {expandedTopics[topic.id] && (
                <div>
                  {topic.description && (
                    <div className="px-4 py-3 bg-gray-50">
                      <p className="text-sm text-gray-700 whitespace-pre-line">{topic.description}</p>
                    </div>
                  )}
                  
                  {topic.resources && topic.resources.length > 0 && (
                    <div className="border-t border-gray-200">
                      <div className="px-4 py-3 sm:px-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Resources</h4>
                        <ul className="space-y-3">
                          {topic.resources.map(resource => (
                            <li key={resource.id} className="flex items-start">
                              <input
                                type="checkbox"
                                checked={resource.isCompleted}
                                onChange={(e) => handleResourceStatusChange(topic.id, resource.id, e.target.checked)}
                                disabled={isProcessing}
                                className="h-4 w-4 mt-1 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              />
                              <div className="ml-3">
                                <div className="flex items-center">
                                  <a 
                                    href={resource.url} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className={`text-sm font-medium ${resource.isCompleted ? 'text-gray-500 line-through' : 'text-indigo-600 hover:text-indigo-800'}`}
                                  >
                                    {resource.title}
                                  </a>
                                  <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded ${
                                    resource.type === 'ARTICLE' ? 'bg-blue-100 text-blue-800' :
                                    resource.type === 'VIDEO' ? 'bg-red-100 text-red-800' :
                                    resource.type === 'COURSE' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {resource.type.toLowerCase()}
                                  </span>
                                </div>
                                {resource.description && (
                                  <p className="text-sm text-gray-500 mt-0.5">{resource.description}</p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LearningPlanPage;
