import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Input, Card } from '../components/common';
import { fadeInUp } from '../utils/animations';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // TODO: Implement API call with token
      await new Promise(resolve => setTimeout(resolve, 1500));
      setResetSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4">
        <motion.div {...fadeInUp} className="max-w-md w-full">
          <Card className="text-center">
            <div className="py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
              >
                <CheckCircle className="w-8 h-8 text-green-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Password reset successful!</h2>
              <p className="text-gray-600 mb-6">
                Your password has been successfully reset. You can now log in with your new password.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to login page...
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4">
      <motion.div {...fadeInUp} className="max-w-md w-full space-y-8">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mx-auto h-16 w-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mb-4"
          >
            <Lock className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900">Set new password</h2>
          <p className="mt-2 text-gray-600">
            Your new password must be different from previously used passwords
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Input
                label="New Password"
                type="password"
                icon={<Lock className="w-5 h-5" />}
                showPasswordToggle
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                    message: 'Password must contain uppercase, lowercase, number, and special character'
                  }
                })}
              />
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

            <Input
              label="Confirm Password"
              type="password"
              icon={<Lock className="w-5 h-5" />}
              showPasswordToggle
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match'
              })}
            />

            <Button type="submit" variant="primary" size="lg" loading={isLoading} className="w-full">
              Reset password
            </Button>

            <Link to="/login" className="block text-center text-sm text-gray-600 hover:text-gray-900">
              Back to login
            </Link>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
