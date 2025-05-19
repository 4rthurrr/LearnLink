// EnhancedProfileHeader component for displaying user profile information
import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const EnhancedProfileHeader = ({ userProfile, isOwnProfile, handleFollowToggle, followButtonState, openFollowsModal }) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
      {/* Profile Header Banner */}
      <div className="relative h-48 bg-gradient-to-r from-indigo-500 to-purple-600">
        {/* Cover image could be added here */}
      </div>

      <div className="relative px-6 pb-6">
        {/* Profile Picture */}
        <div className="absolute -top-16 left-6">
          {userProfile.profilePicture ? (
            <img 
              src={userProfile.profilePicture} 
              alt={userProfile.name} 
              className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-md"
              onError={(e) => {
                e.target.onerror = null;
                e.target.classList.add('default-avatar');
                e.target.src = 'https://via.placeholder.com/150';
              }}
            />
          ) : (
            <div className="h-32 w-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-gray-500 text-4xl font-light shadow-md">
              {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : '?'}
            </div>
          )}
        </div>

        {/* Profile Actions */}
        <div className="flex justify-end mt-2">
          {isOwnProfile ? (
            <Link 
              to="/profile/edit" 
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Profile
            </Link>
          ) : (
            <button 
              onClick={handleFollowToggle}
              disabled={followButtonState.isLoading}
              className={`px-4 py-2 rounded-md transition flex items-center ${
                followButtonState.isFollowing 
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              } ${followButtonState.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {followButtonState.isLoading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : followButtonState.isFollowing ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                  </svg>
                  Unfollow
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Follow
                </>
              )}
            </button>
          )}
        </div>

        {/* Profile Info */}
        <div className="mt-10 flex flex-col">
          <div className="w-full">
            {/* Name and profession/title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-3xl font-bold text-gray-900">{userProfile.name}</h1>
              {userProfile.profession && (
                <span className="mt-1 sm:mt-0 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {userProfile.profession}
                </span>
              )}
            </div>
            
            {/* Bio with enhanced styling */}
            {userProfile.bio ? (
              <div className="mt-3 bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                <p className="text-gray-700 leading-relaxed">{userProfile.bio}</p>
              </div>
            ) : (
              <div className="mt-2 text-sm text-gray-500 italic">No bio available</div>
            )}
            
            {/* Info grid with icons */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Location */}
              {userProfile.location && (
                <div className="flex items-center text-gray-700">
                  <div className="p-2 rounded-full bg-gray-100 mr-3">
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </div>
                  <span>{userProfile.location}</span>
                </div>
              )}
              
              {/* Email - only shown if it's the user's own profile */}
              {isOwnProfile && userProfile.email && (
                <div className="flex items-center text-gray-700">
                  <div className="p-2 rounded-full bg-gray-100 mr-3">
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span>{userProfile.email}</span>
                </div>
              )}
              
              {/* Member since date */}
              {userProfile.createdAt && (
                <div className="flex items-center text-gray-700">
                  <div className="p-2 rounded-full bg-gray-100 mr-3">
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span>Member since {format(new Date(userProfile.createdAt || new Date()), 'MMMM yyyy')}</span>
                </div>
              )}
              
              {/* Education if available */}
              {userProfile.education && (
                <div className="flex items-center text-gray-700">
                  <div className="p-2 rounded-full bg-gray-100 mr-3">
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                    </svg>
                  </div>
                  <span>{userProfile.education}</span>
                </div>
              )}
            </div>
            
            {/* Stats */}
            <div className="mt-6 flex flex-wrap gap-4">
              <button 
                onClick={() => openFollowsModal('followers')}
                className="flex-1 flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-50 transition group border border-gray-100"
              >
                <span className="text-2xl font-semibold text-gray-900">{userProfile.followersCount}</span>
                <span className="text-sm text-gray-500 group-hover:text-indigo-600 transition-colors">Followers</span>
              </button>
              
              <button 
                onClick={() => openFollowsModal('following')}
                className="flex-1 flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-50 transition group border border-gray-100"
              >
                <span className="text-2xl font-semibold text-gray-900">{userProfile.followingCount}</span>
                <span className="text-sm text-gray-500 group-hover:text-indigo-600 transition-colors">Following</span>
              </button>
              
              <div className="flex-1 flex flex-col items-center justify-center p-3 rounded-lg border border-gray-100">
                <span className="text-2xl font-semibold text-gray-900">{userProfile.postsCount}</span>
                <span className="text-sm text-gray-500">Posts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProfileHeader;
