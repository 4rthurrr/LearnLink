import React from 'react';
import { Link } from 'react-router-dom';

const LearningPlanProgressList = ({ learningPlans }) => {
  // Sort plans by completion percentage (descending)
  const sortedPlans = [...learningPlans].sort((a, b) => 
    (b.completionPercentage || 0) - (a.completionPercentage || 0)
  );

  return (
    <div className="overflow-hidden">
      {sortedPlans.length === 0 ? (
        <div className="text-center p-6 text-gray-500">
          You don't have any learning plans yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sortedPlans.map(plan => (
            <div key={plan.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <Link 
                  to={`/learning-plan/${plan.id}`} 
                  className="text-md font-medium text-indigo-600 hover:text-indigo-800"
                >
                  {plan.title}
                </Link>
                <span className="text-sm font-medium">
                  {plan.completionPercentage || 0}% Complete
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full"
                  style={{ width: `${plan.completionPercentage || 0}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <div>
                  <span className="font-medium">{plan.completedTopics || 0}/{plan.topics ? plan.topics.length : 0}</span> topics completed
                </div>
                <div>
                  Category: <span className="font-medium">{plan.category || 'Uncategorized'}</span>
                </div>
                <div>
                  Estimated: <span className="font-medium">{plan.estimatedDays || 'N/A'}</span> days
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LearningPlanProgressList;