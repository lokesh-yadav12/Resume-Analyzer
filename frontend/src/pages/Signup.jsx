import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, Github, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, isAuthenticated, loading, error, clearError } = useAuth();
  const [signupSuccess, setSignupSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm();

  const password = watch('password');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data) => {
    const result = await signup({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName
    });
    
    if (result.success) {
      setSignupSuccess(true);
      // Redirect to dashboard after showing success message
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);
    }
  };

  const handleSocialLogin = (provider) => {
    window.location.href = `/api/auth/${provider}`;
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

    return {
      strength,
      label: labels[strength - 1] || '',
      color: colors[strength - 1] || 'bg-gray-300'
    };
  };

  const passwordStrength = getPasswordStrength(password);

  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
          >
            <CheckCircle className="w-8 h-8 text-green-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Career Boost AI!</h2>
          <p className="text-gray-600 mb-4">
            Your account has been created successfully. Please check your email to verify your account.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto h-16 w-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mb-4"
          >
            <span className="text-2xl font-bold text-white">🚀</span>
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-gray-600">
            Start your AI-powered career journey today
          </p>
        </div>

        {/* Signup Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-600 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First name"
                type="text"
                icon={<User className="w-5 h-5" />}
                error={errors.firstName?.message}
                {...register('firstName', {
                  required: 'First name is required',
                  minLength: {
                    value: 1,
                    message: 'First name is required'
                  },
                  maxLength: {
                    value: 50,
                    message: 'First name cannot exceed 50 characters'
                  }
                })}
              />

              <Input
                label="Last name"
                type="text"
                icon={<User className="w-5 h-5" />}
                error={errors.lastName?.message}
                {...register('lastName', {
                  required: 'Last name is required',
                  minLength: {
                    value: 1,
                    message: 'Last name is required'
                  },
                  maxLength: {
                    value: 50,
                    message: 'Last name cannot exceed 50 characters'
                  }
                })}
              />
            </div>

            {/* Email Field */}
            <Input
              label="Email address"
              type="email"
              icon={<Mail className="w-5 h-5" />}
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address'
                }
              })}
            />

            {/* Password Field */}
            <div>
              <Input
                label="Password"
                type="password"
                icon={<Lock className="w-5 h-5" />}
                showPasswordToggle
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters long'
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                    message: 'Password must contain uppercase, lowercase, number, and special character'
                  }
                })}
              />

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">{passwordStrength.label}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <Input
              label="Confirm password"
              type="password"
              icon={<Lock className="w-5 h-5" />}
              showPasswordToggle
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match'
              })}
            />

            {/* Terms and Privacy */}
            <div className="flex items-start">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                {...register('acceptTerms', {
                  required: 'You must accept the terms and conditions'
                })}
              />
              <div className="ml-3">
                <label className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                    Privacy Policy
                  </Link>
                </label>
                {errors.acceptTerms && (
                  <p className="mt-1 text-sm text-red-600">{errors.acceptTerms.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting || loading}
              className="w-full"
            >
              Create account
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => handleSocialLogin('google')}
              className="w-full"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleSocialLogin('linkedin')}
              className="w-full"
            >
              <svg className="w-5 h-5" fill="#0077B5" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleSocialLogin('github')}
              className="w-full"
            >
              <Github className="w-5 h-5" />
            </Button>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Signup;