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
      setCurrentUser(userData);
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

  const value = {
    currentUser,
    loading,
    error,
    loginUser,
    registerUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
