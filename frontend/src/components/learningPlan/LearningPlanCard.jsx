import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const LearningPlanCard = ({ learningPlan }) => {
  // Check if learningPlan exists before rendering
  if (!learningPlan) {
    console.error("LearningPlanCard received undefined or null learningPlan prop");
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6 p-5">
        <p className="text-gray-500">Learning plan data unavailable</p>
      </div>
    );
  }

  // Safely access properties with optional chaining
  const topics = learningPlan?.topics || [];
  const completedTopics = topics.filter(topic => topic?.completionStatus === 'COMPLETED')?.length || 0;
  const totalTopics = topics.length || 0;
  const progress = learningPlan.completionPercentage || 0;

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'some time ago';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
      {/* Card header */}
      <div className="p-5 pb-3 border-b border-gray-100">
        <div className="flex items-center">
          <Link to={`/profile/${learningPlan.creator?.id || 0}`} className="flex-shrink-0">
            <img 
              className="h-10 w-10 rounded-full" 
              src={learningPlan.creator?.profilePicture || "https://via.placeholder.com/150"} 
              alt={learningPlan.creator?.name || "User"} 
            />
          </Link>
          <div className="ml-3">
            <Link to={`/profile/${learningPlan.creator?.id || 0}`} className="text-sm font-medium text-gray-900 hover:underline">
              {learningPlan.creator?.name || "Anonymous User"}
            </Link>
            <p className="text-xs text-gray-500">
              Created {formatDate(learningPlan.createdAt)}
              {learningPlan.category && ` · ${learningPlan.category.toLowerCase()}`}
            </p>
          </div>
        </div>
      </div>

      {/* Card content */}
      <div className="p-5">
        <Link to={`/learning-plan/${learningPlan.id}`} className="block">
          <h3 className="text-lg font-medium text-gray-900 hover:text-indigo-600">
            {learningPlan.title}
          </h3>
          
          <p className="mt-2 text-gray-600 line-clamp-2">{learningPlan.description}</p>
        </Link>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">
              Progress ({completedTopics}/{totalTopics} topics)
            </div>
            <div className="text-sm font-bold text-indigo-600">
              {progress.toFixed(0)}%
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Plan details */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Estimated Duration</p>
            <p className="text-sm font-medium text-gray-900">
              {learningPlan.estimatedDays || 0} days
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
              ${progress === 100 
                ? 'bg-green-100 text-green-800' 
                : progress > 0 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-gray-100 text-gray-800'}`}
            >
              {progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started'}
            </span>
          </div>
        </div>

        {/* Display topics count */}
        <div className="mt-4 text-sm text-gray-600">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
            <span>
              {totalTopics} {totalTopics === 1 ? 'topic' : 'topics'}
            </span>
          </div>
        </div>

        {/* Display topics list */}
        {topics && topics.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            <strong>Topics:</strong> {topics.map(topic => topic.title).join(', ')}
          </div>
        )}

        {/* View details link */}
        <div className="mt-5 text-right">
          <Link 
            to={`/learning-plan/${learningPlan.id}`} 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            View Learning Plan
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LearningPlanCard;
