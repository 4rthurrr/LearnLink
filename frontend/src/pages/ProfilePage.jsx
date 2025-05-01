import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { userId } = useParams();
  const { currentUser } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
        <p className="mt-2 text-sm text-gray-600">Viewing profile ID: {userId}</p>
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <p>Profile content will be displayed here</p>
        <p className="mt-4 text-gray-600">User details and activity will be shown once fully implemented.</p>
      </div>
    </div>
  );
};

export default ProfilePage;
