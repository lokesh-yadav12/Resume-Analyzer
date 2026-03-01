import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Completing sign in...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get parameters from URL
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const userStr = searchParams.get('user');
        const error = searchParams.get('error');

        // Check for errors
        if (error) {
          console.error('OAuth error:', error);
          setStatus('error');
          setMessage('Authentication failed. Please try again.');
          
          setTimeout(() => {
            navigate('/login?error=oauth_failed');
          }, 2000);
          return;
        }

        // Validate required parameters
        if (!accessToken || !refreshToken || !userStr) {
          setStatus('error');
          setMessage('Invalid authentication response.');
          
          setTimeout(() => {
            navigate('/login?error=invalid_callback');
          }, 2000);
          return;
        }

        // Parse user data
        const user = JSON.parse(decodeURIComponent(userStr));
        
        // Store tokens in localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        // Update auth context
        if (setUser) {
          setUser(user);
        }
        
        // Show success message
        setStatus('success');
        setMessage('Successfully signed in!');
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);
        
      } catch (error) {
        console.error('Callback processing error:', error);
        setStatus('error');
        setMessage('Failed to process authentication.');
        
        setTimeout(() => {
          navigate('/login?error=callback_failed');
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center"
      >
        {status === 'processing' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-6"
            >
              <Loader2 className="w-8 h-8 text-blue-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Completing Sign In
            </h2>
            <p className="text-gray-600">
              {message}
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircle className="w-8 h-8 text-green-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back!
            </h2>
            <p className="text-gray-600">
              {message}
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Redirecting to dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-6"
            >
              <XCircle className="w-8 h-8 text-red-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Authentication Failed
            </h2>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to login page...
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default AuthCallback;
