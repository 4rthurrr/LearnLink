import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPosts } from '../api/postApi';
import { getLearningPlans } from '../api/learningPlanApi';
import PostCard from '../components/post/PostCard';
import LearningPlanList from '../components/learningPlan/LearningPlanList';

const HomePage = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');
  const refreshParam = queryParams.get('refresh');
  
  const [posts, setPosts] = useState({ content: [], number: 0, totalPages: 0, last: true });
  const [learningPlans, setLearningPlans] = useState({ content: [], number: 0, totalPages: 0, last: true });
  const [activeTab, setActiveTab] = useState(tabParam === 'plans' ? 'plans' : 'posts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(refreshParam || 0);

  // Check URL parameters when they change
  useEffect(() => {
    if (tabParam === 'plans') {
      setActiveTab('plans');
    }
    if (refreshParam) {
      setRefreshKey(refreshParam);
    }
  }, [tabParam, refreshParam]);

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchPosts(0);
    } else {
      fetchLearningPlans(0);
    }
  }, [activeTab, refreshKey]);

  const fetchPosts = async (page) => {
    setLoading(true);
    try {
      console.log(`Fetching posts page ${page}`);
      const data = await getPosts(page);
      console.log('Posts data received:', data);
      setPosts(prevPosts => ({
        ...data,
        content: page === 0 ? data.content : [...prevPosts.content, ...data.content]
      }));
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLearningPlans = async (page) => {
    setLoading(true);
    try {
      console.log(`Fetching learning plans page ${page}, refreshKey: ${refreshKey}`);
      
      // Add cache-busting parameter
      const data = await getLearningPlans(page, 10, refreshKey);
      console.log('Learning plans data received:', data);
      
      if (!data || !data.content) {
        console.error('Invalid data format received:', data);
        throw new Error('Invalid data format received from server');
      }
      
      setLearningPlans(prevPlans => ({
        ...data,
        content: page === 0 ? data.content : [...prevPlans.content, ...data.content]
      }));
    } catch (error) {
      console.error('Error fetching learning plans:', error);
      setError('Failed to load learning plans. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = () => {
    if (!posts.last) {
      fetchPosts(posts.number + 1);
    }
  };

  const loadMoreLearningPlans = () => {
    if (!learningPlans.last) {
      fetchLearningPlans(learningPlans.number + 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {currentUser?.name}!</h1>
        <p className="mt-2 text-gray-600">Share your knowledge, follow others, and track your learning progress.</p>
        <div className="mt-4 flex space-x-4">
          <Link 
            to="/create-post" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Create Post
          </Link>
          <Link 
            to="/create-learning-plan" 
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            Create Learning Plan
          </Link>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('posts')}
            className={`${
              activeTab === 'posts'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Latest Posts
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`${
              activeTab === 'plans'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Learning Plans
          </button>
        </nav>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {/* Posts Tab Content */}
          {activeTab === 'posts' && (
            <div>
              {posts.content && posts.content.length > 0 ? (
                <div className="space-y-6">
                  {posts.content.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                  
                  {!posts.last && (
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={loadMorePosts}
                        className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Load More
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No posts yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new post or following other users.</p>
                  <div className="mt-6">
                    <Link to="/create-post" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                      Create a post
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Learning Plans Tab Content */}
          {activeTab === 'plans' && (
            <LearningPlanList 
              learningPlans={learningPlans.content} 
              hasMore={!learningPlans.last} 
              loadMore={loadMoreLearningPlans} 
            />
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;
