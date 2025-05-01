import React from 'react';
import LearningPlanCard from './LearningPlanCard';
import { Link } from 'react-router-dom';

const LearningPlanList = ({ learningPlans, hasMore, loadMore }) => {
  console.log("Learning plans received:", learningPlans); // Add this for debugging

  if (!learningPlans || learningPlans.length === 0) {
    return (
      <div className="text-center py-12 bg-white shadow rounded-lg">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No learning plans yet</h3>
        <p className="mt-1 text-sm text-gray-500">Start by creating a new learning plan.</p>
        <div className="mt-6">
          <Link
            to="/create-learning-plan"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Learning Plan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {learningPlans.map((plan) => (
        <LearningPlanCard key={plan.id} learningPlan={plan} />
      ))}
      
      {hasMore && (
        <div className="flex justify-center mt-6 mb-8">
          <button
            onClick={loadMore}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default LearningPlanList;
