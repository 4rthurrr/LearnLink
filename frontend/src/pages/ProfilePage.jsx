import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserProfile, 
  getUserPosts, 
  getUserLearningPlans, 
  followUser, 
  unfollowUser,
  checkFollowStatus 
} from '../api/userApi';
import { deleteLearningPlan } from '../api/learningPlanApi';
import PostCard from '../components/post/PostCard';
import LearningPlanCard from '../components/learningPlan/LearningPlanCard';
import FollowsModal from '../components/user/FollowsModal';
import '../assets/css/global.css';

const ProfilePage = () => {
  const { userId } = useParams();
  const { currentUser, updateFollowStatus } = useAuth();
  const navigate = useNavigate();
  
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState({ content: [], loading: true });
  const [learningPlans, setLearningPlans] = useState({ content: [], loading: true });
  const [error, setError] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [postsPage, setPostsPage] = useState(0);
  const [plansPage, setPlansPage] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [hasMorePlans, setHasMorePlans] = useState(true);
  const [followsModal, setFollowsModal] = useState({
    isOpen: false,
    type: 'followers' // 'followers' or 'following'
  });

  // Add a specific state for tracking follow button status and loading state
  const [followButtonState, setFollowButtonState] = useState({
    isFollowing: false,
    isLoading: false
  });

  // Debug information to track component lifecycle
  useEffect(() => {
    console.log('ProfilePage mounted with userId:', userId);
    console.log('Current user:', currentUser);
    
    // Return a cleanup function
    return () => {
      console.log('ProfilePage unmounted');
    };
  }, [userId, currentUser]);

  // Handle navigation to the current user's profile when appropriate
  useEffect(() => {
    // If URL is /profile or /profile/edit or /profile/undefined and we have currentUser data
    if ((!userId || userId === 'undefined' || userId === 'edit') && currentUser && currentUser.id) {
      console.log('Redirecting to current user profile:', currentUser.id);
      navigate(`/profile/${currentUser.id}`, { replace: true });
      return;
    }
    
    // If we're on our own profile page without a userId, verify current user is available
    if (window.location.pathname === '/profile' && currentUser && currentUser.id) {
      navigate(`/profile/${currentUser.id}`, { replace: true });
      return;
    }
    
    // If we're at /profile without a userId and not logged in, redirect to login
    if (!userId && !currentUser) {
      navigate('/login', { replace: true });
      return;
    }
  }, [userId, currentUser, navigate]);
  
  // Determine if this is the current user's profile
  const isOwnProfile = currentUser && currentUser.id && parseInt(userId) === currentUser.id;
  
  // Fetch follow status separately to ensure it's always accurate
  const fetchFollowStatus = useCallback(async () => {
    if (!currentUser || !userId || isOwnProfile) {
      return;
    }

    try {
      console.log(`Explicitly checking follow status for user ${userId}`);
      const followData = await checkFollowStatus(userId);
      console.log('Follow status response:', followData);
      
      // Update follow button state without triggering re-renders that cause loops
      setFollowButtonState(prev => {
        // Only update if the value is different to prevent unnecessary renders
        if (prev.isFollowing !== followData.isFollowing) {
          return {
            ...prev,
            isFollowing: followData.isFollowing
          };
        }
        return prev;
      });
      
      // Only update userProfile if it exists and has a different isCurrentUserFollowing value
      if (userProfile && userProfile.isCurrentUserFollowing !== followData.isFollowing) {
        setUserProfile(prev => ({
          ...prev,
          isCurrentUserFollowing: followData.isFollowing
        }));
      }
    } catch (err) {
      console.error('Error fetching follow status:', err);
    }
  }, [userId, currentUser, isOwnProfile]); // Remove userProfile from dependencies

  // Check follow status when component mounts and when userId changes
  useEffect(() => {
    if (currentUser && userId && !isOwnProfile) {
      fetchFollowStatus();
    }
  }, [userId, currentUser, fetchFollowStatus, isOwnProfile]);

  // Fetch profile data for the specified user ID
  useEffect(() => {
    const fetchUserProfile = async () => {
      // Only proceed if we have a valid userId
      if (!userId || userId === 'undefined' || userId === 'edit') {
        return;
      }
      
      setLoadingProfile(true);
      console.log(`Fetching profile for user ID: ${userId}`);
      
      try {
        const data = await getUserProfile(userId);
        console.log('Received profile data:', data);
        
        // Update the follow button state based on profile data
        setFollowButtonState(prev => ({
          ...prev,
          isFollowing: data.isCurrentUserFollowing
        }));
        
        // Set the profile data AFTER setting the follow button state
        setUserProfile(data);
        
        // Don't call fetchFollowStatus here - it will cause an infinite loop
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(`Failed to load profile: ${err.message || 'Unknown error'}`);
        
        // If we're trying to view our own profile but it fails, try a fallback
        if (currentUser && currentUser.id && parseInt(userId) === currentUser.id) {
          setUserProfile(currentUser); // Use currentUser data as a fallback
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [userId, currentUser]); // Remove fetchFollowStatus from this dependency array

  // Fetch user posts
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (activeTab === 'posts' && userId && userId !== 'undefined' && userId !== 'edit') {
        try {
          setPosts(prev => ({ ...prev, loading: true }));
          const data = await getUserPosts(userId, postsPage);
          setPosts({
            content: postsPage === 0 ? data.content : [...posts.content, ...data.content],
            loading: false
          });
          setHasMorePosts(!data.last);
        } catch (err) {
          console.error('Error fetching user posts:', err);
          setPosts(prev => ({ ...prev, loading: false }));
          setError('Failed to load posts');
        }
      }
    };

    fetchUserPosts();
  }, [userId, postsPage, activeTab]);

  // Fetch user learning plans
  useEffect(() => {
    const fetchUserLearningPlans = async () => {
      if (activeTab === 'plans' && userId && userId !== 'undefined' && userId !== 'edit') {
        try {
          setLearningPlans(prev => ({ ...prev, loading: true }));
          const data = await getUserLearningPlans(userId, plansPage);
          setLearningPlans({
            content: plansPage === 0 ? data.content : [...learningPlans.content, ...data.content],
            loading: false
          });
          setHasMorePlans(!data.last);
        } catch (err) {
          console.error('Error fetching learning plans:', err);
          setLearningPlans(prev => ({ ...prev, loading: false }));
          setError('Failed to load learning plans');
        }
      }
    };

    fetchUserLearningPlans();
  }, [userId, plansPage, activeTab]);

  // Reset pagination when tab changes
  useEffect(() => {
    setPostsPage(0);
    setPlansPage(0);
  }, [activeTab]);

  const loadMorePosts = () => {
    setPostsPage(prevPage => prevPage + 1);
  };

  const loadMorePlans = () => {
    setPlansPage(prevPage => prevPage + 1);
  };

  const handleFollowToggle = async () => {
    try {
      // Parse userId to ensure it's a number
      const numericUserId = parseInt(userId, 10);
      console.log('Toggle follow for user ID:', numericUserId);
      
      if (isNaN(numericUserId)) {
        setError('Invalid user ID');
        return;
      }

      // Disable button immediately to prevent double clicks
      setFollowButtonState(prev => ({
        ...prev,
        isLoading: true
      }));
      
      const isCurrentlyFollowing = followButtonState.isFollowing;
      
      // Optimistically update UI
      setFollowButtonState(prev => ({
        ...prev,
        isFollowing: !isCurrentlyFollowing
      }));
      
      setUserProfile(prev => ({
        ...prev,
        isCurrentUserFollowing: !isCurrentlyFollowing,
        followersCount: isCurrentlyFollowing 
          ? Math.max(0, prev.followersCount - 1) 
          : prev.followersCount + 1
      }));
      
      // Make the API call
      if (isCurrentlyFollowing) {
        // If already following, unfollow
        console.log('Attempting to unfollow user');
        await unfollowUser(numericUserId);
        console.log('Unfollow successful');
        
        // Update AuthContext
        updateFollowStatus(numericUserId, false);
      } else {
        // If not following, follow
        console.log('Attempting to follow user');
        await followUser(numericUserId);
        console.log('Follow successful');
        
        // Update AuthContext
        updateFollowStatus(numericUserId, true);
      }
      
      // Verify the status after action
      await fetchFollowStatus();
      
    } catch (err) {
      console.error('Error toggling follow status:', err);
      setError(`Failed to ${followButtonState.isFollowing ? 'unfollow' : 'follow'} user: ${err.message}`);
      
      // Revert UI if there's an error
      await fetchFollowStatus();
    } finally {
      setFollowButtonState(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  };

  const handleDeleteLearningPlan = async (planId) => {
    try {
      // Set loading state
      setLearningPlans(prev => ({
        ...prev,
        loading: true
      }));
      
      // Call the API to delete the learning plan
      await deleteLearningPlan(planId);
      
      // Remove the deleted plan from the state
      setLearningPlans(prev => ({
        ...prev,
        content: prev.content.filter(plan => plan.id !== planId),
        loading: false
      }));
      
      // Show success message
      alert('Learning plan deleted successfully');
      
    } catch (err) {
      console.error('Error deleting learning plan:', err);
      setError('Failed to delete learning plan');
      setLearningPlans(prev => ({
        ...prev,
        loading: false
      }));
    }
  };

  const handlePostDelete = async (postId) => {
    try {
      // Update posts list by filtering out the deleted post
      setPosts(prev => ({
        ...prev,
        content: prev.content.filter(post => post.id !== postId)
      }));
      
      // Update the user's post count in the profile
      if (userProfile) {
        setUserProfile(prev => ({
          ...prev,
          postsCount: Math.max(0, prev.postsCount - 1)
        }));
      }
      
      // Show success message
      alert('Post deleted successfully');
    } catch (err) {
      console.error('Error handling post deletion:', err);
      setError('Failed to delete post');
    }
  };

  const openFollowsModal = (type) => {
    setFollowsModal({
      isOpen: true,
      type
    });
  };
  
  const closeFollowsModal = () => {
    setFollowsModal({
      ...followsModal,
      isOpen: false
    });
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadingProfile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-gray-600">Loading profile...</p>
        <p className="text-sm text-gray-500 mt-2">User ID: {userId}</p>
      </div>
    );
  }

  // Protection for cases where userProfile is null despite loading being complete
  if (!userProfile && !loadingProfile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex flex-col">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                User profile not found. Please check the user ID.
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Looking for user ID: {userId}
              </p>
              <div className="mt-4">
                <button
                  onClick={() => navigate('/')}
                  className="mr-4 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Go to Home
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
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
                className="h-32 w-32 rounded-full border-4 border-white object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.classList.add('default-avatar');
                  e.target.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http://www.w3.org/2000/svg%22 viewBox%3D%220 0 1 1%22%3E%3Crect width%3D%221%22 height%3D%221%22 fill%3D%22transparent%22%3E%3C/rect%3E%3C/svg%3E';
                }}
              />
            ) : (
              <div className="h-32 w-32 rounded-full border-4 border-white default-avatar"></div>
            )}
          </div>

          {/* Profile Actions */}
          <div className="flex justify-end mt-2">
            {isOwnProfile ? (
              <Link 
                to={`/profile/edit`} 
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
              >
                Edit Profile
              </Link>
            ) : (
              <button 
                onClick={handleFollowToggle}
                disabled={parseInt(userId) === currentUser?.id || followButtonState.isLoading}
                className={`px-4 py-2 rounded-md transition flex items-center ${
                  followButtonState.isFollowing 
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                } ${(parseInt(userId) === currentUser?.id || followButtonState.isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {followButtonState.isLoading && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {followButtonState.isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>

          {/* Profile Info */}
          <div className="mt-10 flex flex-col sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{userProfile.name}</h1>
              <p className="mt-1 text-sm text-gray-500">{userProfile.bio || 'No bio available'}</p>
              
              {/* Stats */}
              <div className="mt-4 flex flex-wrap gap-6">
                <button 
                  onClick={() => openFollowsModal('followers')}
                  className="flex items-center hover:bg-gray-50 p-2 rounded transition-colors group"
                >
                  <span className="text-lg font-semibold text-gray-900">{userProfile.followersCount}</span>
                  <span className="ml-2 text-sm text-gray-500 group-hover:text-indigo-600 transition-colors flex items-center">
                    Followers
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                <button 
                  onClick={() => openFollowsModal('following')}
                  className="flex items-center hover:bg-gray-50 p-2 rounded transition-colors group"
                >
                  <span className="text-lg font-semibold text-gray-900">{userProfile.followingCount}</span>
                  <span className="ml-2 text-sm text-gray-500 group-hover:text-indigo-600 transition-colors flex items-center">
                    Following
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                <div className="flex items-center">
                  <span className="text-lg font-semibold text-gray-900">{userProfile.postsCount}</span>
                  <span className="ml-2 text-sm text-gray-500">Posts</span>
                </div>
              </div>
            </div>

            {/* Follow/Unfollow button - moved here for better alignment */}
          </div>
        </div>
      </div>

      {/* Tabs - Posts, Plans, Activity */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 px-4 py-2 text-center rounded-lg font-medium transition ${
              activeTab === 'posts' 
                ? 'bg-indigo-600 text-white shadow' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`flex-1 px-4 py-2 text-center rounded-lg font-medium transition ${
              activeTab === 'plans' 
                ? 'bg-indigo-600 text-white shadow' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Learning Plans
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 px-4 py-2 text-center rounded-lg font-medium transition ${
              activeTab === 'activity' 
                ? 'bg-indigo-600 text-white shadow' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Activity
          </button>
        </div>
      </div>

      {/* Content - Posts or Learning Plans or Activity */}
      <div className="bg-white shadow rounded-lg p-6">
        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div>
            {posts.loading && posts.content.length === 0 ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : posts.content.length > 0 ? (
              <div>
                <div className="grid gap-6 md:grid-cols-2">
                  {posts.content.map(post => (
                    <PostCard key={post.id} post={post} onPostDelete={handlePostDelete} />
                  ))}
                </div>
                {hasMorePosts && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={loadMorePosts}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      disabled={posts.loading}
                    >
                      {posts.loading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">No posts yet</h3>
                <p className="mt-2 text-sm text-gray-500">
                  {isOwnProfile 
                    ? "You haven't created any posts yet."
                    : `${userProfile.name} hasn't created any posts yet.`}
                </p>
                {isOwnProfile && (
                  <div className="mt-6">
                    <Link
                      to="/create-post"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Create a Post
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Learning Plans Tab */}
        {activeTab === 'plans' && (
          <div>
            {learningPlans.loading && learningPlans.content.length === 0 ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : learningPlans.content.length > 0 ? (
              <div>
                <div className="grid gap-6 md:grid-cols-2">
                  {learningPlans.content.map(plan => (
                    <LearningPlanCard 
                      key={plan.id} 
                      learningPlan={plan} 
                      onDelete={handleDeleteLearningPlan}
                    />
                  ))}
                </div>
                {hasMorePlans && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={loadMorePlans}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      disabled={learningPlans.loading}
                    >
                      {learningPlans.loading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">No learning plans yet</h3>
                <p className="mt-2 text-sm text-gray-500">
                  {isOwnProfile 
                    ? "You haven't created any learning plans yet."
                    : `${userProfile.name} hasn't created any learning plans yet.`}
                </p>
                {isOwnProfile && (
                  <div className="mt-6">
                    <Link
                      to="/create-learning-plan"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Create a Learning Plan
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Activity Tab (placeholder for now) */}
        {activeTab === 'activity' && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">Activity feed coming soon</h3>
            <p className="mt-2 text-sm text-gray-500">
              This feature will show recent activity such as likes, comments, and completed learning plans.
            </p>
          </div>
        )}
      </div>

      {/* Follows Modal */}
      <FollowsModal 
        isOpen={followsModal.isOpen}
        onClose={closeFollowsModal}
        userId={userId}
        type={followsModal.type}
      />
    </div>
  );
};

export default ProfilePage;
