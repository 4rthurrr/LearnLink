import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useLocation, useNavigate } from 'react-router-dom';
import OAuthButton from '../components/auth/OAuthButton';

const LoginPage = ({ signup = false }) => {
  const [isSignup, setIsSignup] = useState(signup);
  const [oauthError, setOauthError] = useState('');
  const { loginUser, registerUser, error } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Clear any OAuth errors when component unmounts or when isSignup changes
    return () => {
      setOauthError('');
    };
  }, [isSignup]);
  
  useEffect(() => {
    // Check if redirected from OAuth with error
    if (location.state?.error) {
      console.log('OAuth error from state:', location.state.error);
      setOauthError(location.state.error);
      // Clear the location state to prevent the error from persisting on refresh
      navigate(location.pathname, { replace: true });
    }
    
    // Check URL params for OAuth errors
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      setOauthError('Your session has expired. Please log in again.');
      // Clear the URL parameter to prevent the error from persisting on refresh
      navigate(location.pathname, { replace: true });
    }
    
    const errorParam = params.get('error');
    if (errorParam) {
      console.log('OAuth error from URL:', errorParam);
      setOauthError(decodeURIComponent(errorParam));
      // Clear the URL parameter to prevent the error from persisting on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const loginSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const signupSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
  });

  const handleSubmit = async (values) => {
    if (isSignup) {
      await registerUser(values);
    } else {
      await loginUser(values.email, values.password);
    }
  };

  const initialValues = isSignup 
    ? { name: '', email: '', password: '' } 
    : { email: '', password: '' };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {isSignup ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {isSignup ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>        {(error || oauthError) && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{error || oauthError}</p>
                {oauthError && oauthError.includes('authentication failed') && (
                  <p className="text-xs mt-1">
                    This may happen if you denied access or there was a problem with the authentication server.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <Formik
          initialValues={initialValues}
          validationSchema={isSignup ? signupSchema : loginSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {({ isSubmitting }) => (
            <Form className="mt-8 space-y-6">
              {isSignup && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <Field
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <ErrorMessage name="name" component="div" className="text-red-500 text-xs mt-1" />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Field
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isSubmitting
                    ? 'Processing...'
                    : isSignup
                    ? 'Sign Up'
                    : 'Sign In'}
                </button>
              </div>
            </Form>
          )}
        </Formik>

        {/* OAuth Buttons */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>          <div className="mt-6">            <div className="space-y-2">
              <OAuthButton provider="Google" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
