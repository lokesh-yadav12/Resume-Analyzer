import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { verifyEmail, resendVerification, isAuthenticated } = useAuth();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (token) {
        const result = await verifyEmail(token);
        
        if (result.success) {
          setStatus('success');
          setMessage(result.message || 'Email verified successfully!');
          
          // Redirect to dashboard after 3 seconds if authenticated
          if (isAuthenticated) {
            setTimeout(() => {
              navigate('/dashboard');
            }, 3000);
          }
        } else {
          setStatus('error');
          setMessage(result.error || 'Email verification failed');
        }
      } else {
        setStatus('error');
        setMessage('Invalid verification link');
      }
    };

    verify();
  }, [token, verifyEmail, isAuthenticated, navigate]);

  const handleResendVerification = async () => {
    setResending(true);
    const result = await resendVerification();
    
    if (result.success) {
      setMessage('Verification email sent! Please check your inbox.');
    } else {
      setMessage(result.error || 'Failed to resend verification email');
    }
    
    setResending(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        {/* Verifying State */}
        {status === 'verifying' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-6"
            >
              <Loader2 className="w-8 h-8 text-blue-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verifying Your Email</h2>
            <p className="text-gray-600">
              Please wait while we verify your email address...
            </p>
          </>
        )}

        {/* Success State */}
        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircle className="w-8 h-8 text-green-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Verified!</h2>
            <p className="text-gray-600 mb-8">{message}</p>
            
            {isAuthenticated ? (
              <>
                <p className="text-sm text-gray-500 mb-6">
                  Redirecting to dashboard...
                </p>
                <Link to="/dashboard">
                  <Button variant="primary" size="lg" className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/login">
                <Button variant="primary" size="lg" className="w-full">
                  Continue to Login
                </Button>
              </Link>
            )}
          </>
        )}

        {/* Error State */}
        {status === 'error' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-6"
            >
              <XCircle className="w-8 h-8 text-red-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verification Failed</h2>
            <p className="text-gray-600 mb-8">{message}</p>
            
            <div className="space-y-4">
              {isAuthenticated && (
                <Button
                  variant="primary"
                  size="lg"
                  loading={resending}
                  onClick={handleResendVerification}
                  className="w-full"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Resend Verification Email
                </Button>
              )}
              
              <Link to={isAuthenticated ? "/dashboard" : "/login"}>
                <Button variant="outline" size="lg" className="w-full">
                  {isAuthenticated ? 'Go to Dashboard' : 'Back to Login'}
                </Button>
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
