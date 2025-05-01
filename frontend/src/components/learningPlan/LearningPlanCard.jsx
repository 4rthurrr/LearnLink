import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const LearningPlanCard = ({ learningPlan }) => {
  const completedTopics = learningPlan.topics?.filter(topic => topic.completionStatus === 'COMPLETED').length || 0;
  const totalTopics = learningPlan.topics?.length || 0;
  const progress = learningPlan.completionPercentage || (totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0);

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
          <Link to={`/profile/${learningPlan.creator.id}`} className="flex-shrink-0">
            <img 
              className="h-10 w-10 rounded-full" 
              src={learningPlan.creator.profilePicture || "https://via.placeholder.com/150"} 
              alt={learningPlan.creator.name} 
            />
          </Link>
          <div className="ml-3">
            <Link to={`/profile/${learningPlan.creator.id}`} className="text-sm font-medium text-gray-900 hover:underline">
              {learningPlan.creator.name}
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
              {learningPlan.estimatedDays} days
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
