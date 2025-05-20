import React, { useState } from 'react';

const OAuthButton = ({ provider }) => {
  const [isLoading, setIsLoading] = useState(false);
    const handleOAuth = () => {
    try {
      setIsLoading(true);
      console.log(`Initiating ${provider} OAuth flow`);
      
      // Store the current URL so we can redirect back after OAuth
      sessionStorage.setItem('oauth_redirect_from', window.location.pathname);
      
      // Get base URL from environment or use default
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
      
      // Create the OAuth authorization URL properly
      const oauthUrl = new URL(`${baseUrl}/api/auth/oauth2/authorize/${provider.toLowerCase()}`);
      console.log(`OAuth URL: ${oauthUrl.toString()}`);
      
      // Redirect to the OAuth authorization endpoint
      window.location.href = oauthUrl.toString();
    } catch (error) {
      console.error(`Error starting ${provider} OAuth flow:`, error);
      setIsLoading(false);
    }
  };

  // Determine button styles based on provider
  const getButtonStyles = () => {
    if (provider === 'Google') {
      return 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
    } else if (provider === 'Facebook') {
      return 'bg-blue-600 hover:bg-blue-700 text-white';
    } else {
      return 'bg-gray-800 hover:bg-gray-900 text-white';
    }
  };

  return (
    <button
      type="button"
      onClick={handleOAuth}
      disabled={isLoading}
      className={`w-full flex justify-center items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium 
                 ${getButtonStyles()} ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
      aria-label={`Sign in with ${provider}`}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : provider === 'Google' && (
        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
          </g>
        </svg>
      )}
      {isLoading ? 'Connecting...' : `Continue with ${provider}`}
    </button>
  );
};

export default OAuthButton;
