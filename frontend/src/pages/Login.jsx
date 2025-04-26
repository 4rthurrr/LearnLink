import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Link,
  Alert
} from '@mui/material';
import {
  Google as GoogleIcon,
  GitHub as GitHubIcon,
  Facebook as FacebookIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, error, setUser } = useAuth();
  
  // Extract token from URL if present (OAuth redirect)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      handleOAuthSuccess(token);
    }
  }, [location]);
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state]);
  
  const handleOAuthSuccess = async (token) => {
    try {
      localStorage.setItem('token', token);
      const response = await authService.getCurrentUser();
      setUser(response.data);
      
      // Clean up URL
      window.history.replaceState({}, document.title, "/login");
    } catch (err) {
      console.error('Error handling OAuth redirect:', err);
    }
  };
  
  const handleOAuthLogin = (provider) => {
    login(provider);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to LearnLink
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Connect, share skills, and learn together
        </Typography>
      </Box>
      
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Typography variant="h5" align="center" gutterBottom>
          Sign in to your account
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={() => handleOAuthLogin('google')}
            size="large"
            sx={{ mb: 2 }}
          >
            Continue with Google
          </Button>
          
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GitHubIcon />}
            onClick={() => handleOAuthLogin('github')}
            size="large"
            sx={{ mb: 2 }}
          >
            Continue with GitHub
          </Button>
          
          <Button
            fullWidth
            variant="outlined"
            startIcon={<FacebookIcon />}
            onClick={() => handleOAuthLogin('facebook')}
            size="large"
          >
            Continue with Facebook
          </Button>
        </Box>
        
        <Box sx={{ position: 'relative', my: 4 }}>
          <Divider />
          <Typography
            variant="body2"
            component="span"
            sx={{
              position: 'absolute',
              top: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: 'background.paper',
              px: 2
            }}
          >
            OR
          </Typography>
        </Box>
        
        <Button
          fullWidth
          variant="contained"
          size="large"
          component={RouterLink}
          to="/register"
        >
          Create an Account
        </Button>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            By signing in, you agree to our{' '}
            <Link component={RouterLink} to="/terms">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link component={RouterLink} to="/privacy">
              Privacy Policy
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
