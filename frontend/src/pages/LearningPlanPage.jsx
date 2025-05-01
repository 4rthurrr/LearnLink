import React from 'react';
import { useParams } from 'react-router-dom';

const LearningPlanPage = () => {
  const { planId } = useParams();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <h1 className="text-2xl font-bold text-gray-900">Learning Plan</h1>
        <p className="mt-2 text-sm text-gray-600">Viewing learning plan ID: {planId}</p>
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <p>Learning plan details will be displayed here</p>
      </div>
    </div>
  );
};

export default LearningPlanPage;
