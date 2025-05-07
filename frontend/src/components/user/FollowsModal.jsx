import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserFollowers, getUserFollowing } from '../../api/userApi';

const FollowsModal = ({ isOpen, onClose, userId, type }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, userId, type, page]);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const fetchFunction = type === 'followers' ? getUserFollowers : getUserFollowing;
      const data = await fetchFunction(userId, page);
      
      setUsers(prev => page === 0 ? data.content : [...prev, ...data.content]);
      setHasMore(!data.last);
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
      setError(`Failed to load ${type}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {type === 'followers' ? 'Followers' : 'Following'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="overflow-auto flex-grow">
          {error ? (
            <div className="p-4 text-red-500">{error}</div>
          ) : users.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {users.map(user => (
                <li key={user.id} className="p-4 hover:bg-gray-50">
                  <Link 
                    to={`/profile/${user.id}`} 
                    className="flex items-center"
                    onClick={onClose}
                  >
                    <div className="flex-shrink-0">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.name}
                          className="h-10 w-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.classList.add('default-avatar');
                            e.target.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http://www.w3.org/2000/svg%22 viewBox%3D%220 0 1 1%22%3E%3C/svg%3E';
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full default-avatar"></div>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No {type} found
            </div>
          )}
        </div>
        
        {hasMore && !loading && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={loadMore}
              className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowsModal;