import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshCurrentUser } = useAuth();
  const [status, setStatus] = useState('Processing authentication...');
  useEffect(() => {
    // Parse the URL to get the token
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');

    console.log('OAuth2RedirectHandler: Processing authentication callback', { 
      hasToken: !!token, 
      error,
      fullUrl: window.location.href 
    });
    
    if (token) {
      console.log('OAuth2RedirectHandler: Token received, storing in localStorage');
      // Store the token in localStorage
      localStorage.setItem('authToken', token);
      
      setStatus('Authentication successful! Loading your profile...');
      
      // Small delay to ensure token is properly stored
      setTimeout(() => {
        // Fetch user details with the token
        refreshCurrentUser()
          .then((success) => {
            console.log('OAuth2RedirectHandler: User data fetched successfully:', success);
            // Add a slight delay to show the success message before redirecting
            setTimeout(() => {
              const redirectPath = sessionStorage.getItem('oauth_redirect_from') || '/';
              sessionStorage.removeItem('oauth_redirect_from'); // Clean up
              navigate(redirectPath);
            }, 500);
          })
          .catch((err) => {
            console.error('OAuth2RedirectHandler: Error fetching user data', err);
            setStatus('Error loading profile data. Please try again.');
            // If user data fetch fails, remove token and redirect to login
            localStorage.removeItem('authToken');
            setTimeout(() => {
              navigate('/login', { 
                state: { 
                  error: 'Failed to load user profile after authentication. Please try again.' 
                }
              });
            }, 1500);
          });
      }, 200);
    } else {
      console.error('OAuth2RedirectHandler: No token received', error);
      setStatus('Authentication failed!');
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            error: error || 'OAuth authentication failed. Please try again.'
          }
        });
      }, 1000);
    }
  }, [location, navigate, refreshCurrentUser]);

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
      <p className="text-gray-600 text-lg">{status}</p>
    </div>
  );
};

export default OAuth2RedirectHandler;
