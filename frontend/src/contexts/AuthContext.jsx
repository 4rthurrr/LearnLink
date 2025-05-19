import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup, getCurrentUser } from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Define logout function first
  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setCurrentUser(null);
    navigate('/login');
  }, [navigate]);

  // Now we can use logout in fetchCurrentUser
  const fetchCurrentUser = useCallback(async () => {
    try {
      const userData = await getCurrentUser();
      
      // Check if userData is valid and contains user details
      if (userData && userData.id) {
        console.log('Successfully fetched current user:', userData);
        setCurrentUser(userData);
      } else if (userData && userData.success === true) {
        // Token is valid but we didn't get user details - this is an error
        console.error('Auth response validates token but is missing user details:', userData);
        // Force user to re-login to get proper user data
        logout();
      } else {
        // Invalid response
        console.error('Invalid user data received:', userData);
        logout();
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [fetchCurrentUser]);

  const loginUser = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const { accessToken } = await login({ email, password });
      localStorage.setItem('authToken', accessToken);
      await fetchCurrentUser();
      navigate('/');
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (userData) => {
    setLoading(true);
    setError('');
    try {
      const { accessToken } = await signup(userData);
      localStorage.setItem('authToken', accessToken);
      await fetchCurrentUser();
      navigate('/');
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to register');
      return false;
    } finally {
      setLoading(false);
    }
  };
  // Function to refresh user data from server
  const refreshCurrentUser = async () => {
    try {
      console.log('Refreshing current user data');
      setLoading(true);
      await fetchCurrentUser();
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      setLoading(false);
      throw error;
    }
  };

  // Function to update followed/following status in the currentUser object
  const updateFollowStatus = (targetUserId, isFollowing) => {
    if (!currentUser) return;
    
    // Update following count of the current user
    setCurrentUser(prevUser => ({
      ...prevUser,
      followingCount: isFollowing 
        ? prevUser.followingCount + 1 
        : Math.max(0, prevUser.followingCount - 1)
    }));
    
    console.log(`Updated currentUser following count after ${isFollowing ? 'following' : 'unfollowing'} user ${targetUserId}`);
  };

  const value = {
    currentUser,
    setCurrentUser,
    loading,
    error,
    loginUser,
    registerUser,
    logout,
    refreshCurrentUser,
    updateFollowStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
