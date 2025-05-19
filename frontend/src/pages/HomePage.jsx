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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-card p-8 mb-8 background-pattern">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-6 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome, {currentUser?.name}!</h1>
            <p className="mt-2 text-gray-600 max-w-lg">Share your knowledge, follow others, and track your learning progress with LearnLink's collaborative learning platform.</p>
          </div>
          <img src="/assets/images/illustration.svg" alt="Learning" className="hidden md:block w-32 h-32" />
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <Link 
            to="/create-post" 
            className="modern-button-primary text-center inline-flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Post
          </Link>
          <Link 
            to="/create-learning-plan" 
            className="modern-button-secondary text-center inline-flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Create Learning Plan
          </Link>
        </div>
      </div>      {/* Content Tabs */}
      <div className="bg-white rounded-xl shadow-sm mb-8 p-1">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('posts')}
            className={`${
              activeTab === 'posts'
                ? 'bg-primary-50 text-primary-700 border-primary-600'
                : 'border-transparent text-gray-600 hover:text-primary-600 hover:bg-gray-50'
            } flex-1 whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm rounded-lg transition-colors`}
          >
            <div className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Latest Posts
            </div>
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`${
              activeTab === 'plans'
                ? 'bg-primary-50 text-primary-700 border-primary-600'
                : 'border-transparent text-gray-600 hover:text-primary-600 hover:bg-gray-50'
            } flex-1 whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm rounded-lg transition-colors`}
          >
            <div className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
              Learning Plans
            </div>
          </button>
        </nav>
      </div>      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-red-800">Error Loading Content</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button 
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-800"
                onClick={() => setRefreshKey(prev => prev + 1)}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-sm p-6">
          <div className="pulse-loader mb-4"></div>
          <p className="text-gray-500 animate-pulse">Loading content...</p>
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
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={loadMorePosts}
                        className="modern-button-outline px-6 py-2.5 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Load More Posts
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-xl shadow-card">
                  <div className="empty-state-icon mx-auto mb-6">
                    <svg className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No posts yet</h3>
                  <p className="mt-2 text-gray-500 max-w-md mx-auto">Share your knowledge with the community by creating your first post or follow other learners to see their content.</p>
                  <div className="mt-8">
                    <Link to="/create-post" className="modern-button-primary inline-flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Create your first post
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
