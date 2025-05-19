import React, { useState, useEffect } from 'react';
import { getUserActivity, getUserLearningProgress, getUserSocialActivity } from '../../api/activityApi';
import { format, formatDistanceToNow } from 'date-fns';
import { mockLearningProgress, mockSocialActivity, mockAllActivities } from '../../utils/mockActivityData';

const ActivityFeed = ({ userId, isOwnProfile }) => {
  const [learningProgress, setLearningProgress] = useState({ content: [], loading: true });
  const [socialActivity, setSocialActivity] = useState({ content: [], loading: true });
  const [allActivities, setAllActivities] = useState({ content: [], loading: true });
  const [activeSection, setActiveSection] = useState('all');
  const [error, setError] = useState('');
  const [useMockData, setUseMockData] = useState(false);  useEffect(() => {
    const fetchData = async () => {
      // Set all sections to loading state
      setAllActivities(prev => ({ ...prev, loading: true }));
      setLearningProgress(prev => ({ ...prev, loading: true }));
      setSocialActivity(prev => ({ ...prev, loading: true }));

      let apiErrorOccurred = false;

      try {
        // If we're viewing the "all" section, fetch all activities
        if (activeSection === 'all') {
          try {
            const allData = await getUserActivity(userId);
            setAllActivities({
              content: allData.content,
              loading: false
            });
          } catch (err) {
            console.error('Error fetching all activities:', err);
            apiErrorOccurred = true;
            setAllActivities({
              content: useMockData ? mockAllActivities.content : [],
              loading: false
            });
          }
        }

        // If we're viewing the "learning" section or it's our first load
        if (activeSection === 'learning' || activeSection === 'all') {
          try {
            const learningData = await getUserLearningProgress(userId);
            setLearningProgress({
              content: learningData.content,
              loading: false
            });
          } catch (err) {
            console.error('Error fetching learning progress:', err);
            apiErrorOccurred = true;
            setLearningProgress({
              content: useMockData ? mockLearningProgress.content : [],
              loading: false
            });
          }
        }

        // If we're viewing the "social" section or it's our first load
        if (activeSection === 'social' || activeSection === 'all') {
          try {
            const socialData = await getUserSocialActivity(userId);
            setSocialActivity({
              content: socialData.content,
              loading: false
            });
          } catch (err) {
            console.error('Error fetching social activity:', err);
            apiErrorOccurred = true;
            setSocialActivity({
              content: useMockData ? mockSocialActivity.content : [],
              loading: false
            });
          }
        }

        // If any API call failed and we're not already using mock data, suggest switching to mock data
        if (apiErrorOccurred && !useMockData) {
          setError('Unable to load activity data from the server. Would you like to see sample data instead?');
        } else {
          setError('');
        }

      } catch (err) {
        console.error('Error in activity fetch operation:', err);
        setError('Failed to load activity data');
        
        // Set loading to false for all data types
        setAllActivities(prev => ({ ...prev, loading: false }));
        setLearningProgress(prev => ({ ...prev, loading: false }));
        setSocialActivity(prev => ({ ...prev, loading: false }));
      }
    };

    fetchData();
  }, [userId, activeSection, useMockData]);

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'some time ago';
    }
  };  // Filter activities based on the active section
  const filteredActivities = () => {
    if (activeSection === 'learning') {
      return learningProgress.content;
    } else if (activeSection === 'social') {
      return socialActivity.content;
    } else {
      // Use directly fetched all activities if available
      if (allActivities.content.length > 0) {
        return allActivities.content;
      } else {
        // Fallback to combining learning and social activities
        const combined = [
          ...learningProgress.content,
          ...socialActivity.content
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        return combined;
      }
    }
  };

  const renderActivityItem = (activity) => {
    // Learning plan progress activity
    if (activity.type === 'LEARNING_PROGRESS') {
      return (
        <div key={activity.id} className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-gray-100 mb-3 shadow-sm hover:shadow transition-shadow">
          <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">
                {isOwnProfile ? 'You' : activity.user.name} made progress in learning plan
              </h4>
              <span className="text-xs text-gray-500">{formatDate(activity.timestamp)}</span>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {activity.learningPlan.title} - {activity.progressPercentage}% complete
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full" 
                style={{ width: `${activity.progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      );
    } 
    // Topic completion activity
    else if (activity.type === 'TOPIC_COMPLETED') {
      return (
        <div key={activity.id} className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-gray-100 mb-3 shadow-sm hover:shadow transition-shadow">
          <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">
                {isOwnProfile ? 'You' : activity.user.name} completed a topic
              </h4>
              <span className="text-xs text-gray-500">{formatDate(activity.timestamp)}</span>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Completed <span className="font-medium">{activity.topicTitle}</span> in <span className="font-medium">{activity.learningPlan.title}</span>
            </p>
          </div>
        </div>
      );
    }
    // Resource completion activity
    else if (activity.type === 'RESOURCE_COMPLETED') {
      return (
        <div key={activity.id} className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-gray-100 mb-3 shadow-sm hover:shadow transition-shadow">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">
                {isOwnProfile ? 'You' : activity.user.name} completed a resource
              </h4>
              <span className="text-xs text-gray-500">{formatDate(activity.timestamp)}</span>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Completed <span className="font-medium">{activity.resourceTitle}</span> in <span className="font-medium">{activity.topicTitle}</span>
            </p>
          </div>
        </div>
      );
    }
    // Post like activity
    else if (activity.type === 'POST_LIKE') {
      return (
        <div key={activity.id} className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-gray-100 mb-3 shadow-sm hover:shadow transition-shadow">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">
                {isOwnProfile ? 'You' : activity.user.name} liked a post
              </h4>
              <span className="text-xs text-gray-500">{formatDate(activity.timestamp)}</span>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {isOwnProfile ? 'You' : activity.user.name} liked <span className="font-medium">{activity.post.author.name}'s</span> post: <span className="font-medium">{activity.post.title}</span>
            </p>
          </div>
        </div>
      );
    }
    // Comment activity
    else if (activity.type === 'POST_COMMENT') {
      return (
        <div key={activity.id} className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-gray-100 mb-3 shadow-sm hover:shadow transition-shadow">
          <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">
                {isOwnProfile ? 'You' : activity.user.name} commented on a post
              </h4>
              <span className="text-xs text-gray-500">{formatDate(activity.timestamp)}</span>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              On <span className="font-medium">{activity.post.author.name}'s</span> post: <span className="font-medium">{activity.post.title}</span>
            </p>
            <div className="mt-2 p-2 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-xs text-gray-600 line-clamp-2">{activity.comment.content}</p>
            </div>
          </div>
        </div>
      );
    }
    
    // Default case
    return null;
  };

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  if (
    (activeSection === 'all' && allActivities.loading) || 
    (activeSection === 'learning' && learningProgress.loading) || 
    (activeSection === 'social' && socialActivity.loading)
  ) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-gray-500">Loading activity...</p>
      </div>
    );
  }

  const activities = filteredActivities();
  return (
    <div>
      {/* Error message */}
      {error && (
        <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
              {!useMockData && (
                <div className="mt-2">
                  <button
                    onClick={() => setUseMockData(true)}
                    className="text-sm font-medium text-yellow-700 hover:text-yellow-600 focus:outline-none"
                  >
                    Show sample activity data
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Activity filter tabs */}
      <div className="mb-6 flex border-b border-gray-200">
        <button 
          onClick={() => setActiveSection('all')}
          className={`px-4 py-2 text-sm font-medium -mb-px ${
            activeSection === 'all' 
              ? 'text-indigo-600 border-b-2 border-indigo-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All Activity
        </button>
        <button 
          onClick={() => setActiveSection('learning')}
          className={`px-4 py-2 text-sm font-medium -mb-px ${
            activeSection === 'learning' 
              ? 'text-indigo-600 border-b-2 border-indigo-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Learning Progress
        </button>
        <button 
          onClick={() => setActiveSection('social')}
          className={`px-4 py-2 text-sm font-medium -mb-px ${
            activeSection === 'social' 
              ? 'text-indigo-600 border-b-2 border-indigo-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Social Activity
        </button>
      </div>

      {/* Activity list */}
      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map(activity => renderActivityItem(activity))}
          {useMockData && (
            <div className="text-center mt-4 py-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600">
                Displaying sample activity data for development purposes
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No activity yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            {isOwnProfile 
              ? "You don't have any recent activity."
              : "This user doesn't have any recent activity."}
          </p>
          {!useMockData && (
            <button 
              onClick={() => setUseMockData(true)}
              className="mt-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
            >
              Show sample data instead
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
