import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Input, Card } from '../components/common';
import { fadeInUp } from '../utils/animations';

const ForgotPassword = () => {
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // TODO: Implement API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setEmailSent(true);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to <strong>{getValues('email')}</strong>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <div className="space-y-3">
                <Button variant="primary" onClick={() => setEmailSent(false)} className="w-full">
                  Try another email
                </Button>
                <Link to="/login">
                  <Button variant="ghost" className="w-full">
                    Back to login
                  </Button>
                </Link>
              </div>
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
            <Mail className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900">Forgot password?</h2>
          <p className="mt-2 text-gray-600">
            No worries, we'll send you reset instructions
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email address"
              type="email"
              icon={<Mail className="w-5 h-5" />}
              placeholder="Enter your email"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address'
                }
              })}
            />

            <Button type="submit" variant="primary" size="lg" loading={isLoading} className="w-full">
              Send reset link
            </Button>

            <Link to="/login" className="flex items-center justify-center text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login
            </Link>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
