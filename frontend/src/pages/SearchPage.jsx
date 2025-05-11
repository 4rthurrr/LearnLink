import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { searchGlobal } from '../api/searchApi';
import PostCard from '../components/post/PostCard';
import LearningPlanCard from '../components/learningPlan/LearningPlanCard';

const SearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState({ users: [], posts: [], learningPlans: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      console.log('Searching for:', searchQuery);
      const data = await searchGlobal(searchQuery);
      console.log('Search results:', data);
      
      // Handle the response structure from the API
      // Ensure we have the correct data structure even if the API returns pageable results
      const formattedResults = {
        users: data.users?.content || data.users || [],
        posts: data.posts?.content || data.posts || [],
        learningPlans: data.learningPlans?.content || data.learningPlans || []
      };
      
      console.log('Formatted results:', formattedResults);
      setResults(formattedResults);
    } catch (error) {
      console.error('Error searching:', error);
      setError('Failed to perform search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
    performSearch(query);
  };

  const renderUserCard = (user) => (
    <div key={user.id} className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-5 flex items-center">
        <img 
          src={user.profilePicture || "https://via.placeholder.com/150"} 
          alt={user.name} 
          className="h-12 w-12 rounded-full object-cover"
        />
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-500">{user.bio || 'No bio available'}</p>
        </div>
      </div>
      <div className="border-t border-gray-200 px-5 py-3 text-right">
        <a 
          href={`/profile/${user.id}`} 
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          View Profile
        </a>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <form onSubmit={handleSubmit} className="flex w-full">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for users, posts, or learning plans..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Search query"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {initialQuery && (
        <>
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('all')}
                className={`${
                  activeTab === 'all'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                All Results
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`${
                  activeTab === 'users'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Users ({results.users.length})
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`${
                  activeTab === 'posts'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Posts ({results.posts.length})
              </button>
              <button
                onClick={() => setActiveTab('plans')}
                className={`${
                  activeTab === 'plans'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Learning Plans ({results.learningPlans.length})
              </button>
            </nav>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div>
              {/* Show search results based on active tab */}
              {activeTab === 'all' && (
                <>
                  {results.users.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-lg font-medium mb-4">Users</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.users.slice(0, 4).map(user => renderUserCard(user))}
                      </div>
                      {results.users.length > 4 && (
                        <div className="mt-4 text-center">
                          <button 
                            onClick={() => setActiveTab('users')}
                            className="text-sm text-indigo-600 hover:text-indigo-500"
                          >
                            View all {results.users.length} users
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {results.posts.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-lg font-medium mb-4">Posts</h2>
                      {results.posts.slice(0, 3).map(post => (
                        <PostCard key={post.id} post={post} />
                      ))}
                      {results.posts.length > 3 && (
                        <div className="mt-4 text-center">
                          <button 
                            onClick={() => setActiveTab('posts')}
                            className="text-sm text-indigo-600 hover:text-indigo-500"
                          >
                            View all {results.posts.length} posts
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {results.learningPlans.length > 0 && (
                    <div>
                      <h2 className="text-lg font-medium mb-4">Learning Plans</h2>
                      {results.learningPlans.slice(0, 2).map(plan => (
                        <LearningPlanCard key={plan.id} learningPlan={plan} />
                      ))}
                      {results.learningPlans.length > 2 && (
                        <div className="mt-4 text-center">
                          <button 
                            onClick={() => setActiveTab('plans')}
                            className="text-sm text-indigo-600 hover:text-indigo-500"
                          >
                            View all {results.learningPlans.length} learning plans
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'users' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.users.length > 0 ? (
                    results.users.map(user => renderUserCard(user))
                  ) : (
                    <p>No users found matching "{initialQuery}"</p>
                  )}
                </div>
              )}

              {activeTab === 'posts' && (
                <div className="space-y-6">
                  {results.posts.length > 0 ? (
                    results.posts.map(post => (
                      <PostCard key={post.id} post={post} />
                    ))
                  ) : (
                    <p>No posts found matching "{initialQuery}"</p>
                  )}
                </div>
              )}

              {activeTab === 'plans' && (
                <div className="space-y-6">
                  {results.learningPlans.length > 0 ? (
                    results.learningPlans.map(plan => (
                      <LearningPlanCard key={plan.id} learningPlan={plan} />
                    ))
                  ) : (
                    <p>No learning plans found matching "{initialQuery}"</p>
                  )}
                </div>
              )}

              {!results.users.length && !results.posts.length && !results.learningPlans.length && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No results found for "{initialQuery}"</p>
                  <p className="mt-2 text-sm text-gray-400">Try different keywords or check your spelling</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;
