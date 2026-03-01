const User = require('../models/User');
const { generateTokens } = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');
const crypto = require('crypto');

// Register new user
const signup = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Demo mode - return mock success
    if (process.env.DEMO_MODE === 'true') {
      const mockUser = {
        _id: 'demo-user-' + Date.now(),
        email,
        profile: { firstName, lastName },
        emailVerified: true
      };
      const tokens = generateTokens(mockUser._id);
      
      return res.status(201).json({
        success: true,
        message: 'Account created successfully (Demo Mode)',
        data: {
          user: mockUser,
          tokens
        }
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // Create new user
    const user = new User({
      email,
      password,
      profile: {
        firstName,
        lastName
      }
    });
    
    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    
    await user.save();
    
    // Send verification email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Verify Your Email - Career Boost AI',
        template: 'emailVerification',
        data: {
          firstName: user.profile.firstName,
          verificationUrl: `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`
        }
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          profile: user.profile,
          emailVerified: user.emailVerified,
          profileCompleteness: user.profileCompleteness
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Demo mode - return mock success
    if (process.env.DEMO_MODE === 'true') {
      const mockUser = {
        _id: 'demo-user-' + Date.now(),
        email,
        profile: { firstName: 'Demo', lastName: 'User' },
        emailVerified: true
      };
      const tokens = generateTokens(mockUser._id);
      
      return res.json({
        success: true,
        message: 'Login successful (Demo Mode)',
        data: {
          user: mockUser,
          tokens
        }
      });
    }
    
    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts'
      });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      await user.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }
    
    // Update last login
    user.lastLoginAt = new Date();
    await user.save();
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          profile: user.profile,
          emailVerified: user.emailVerified,
          profileCompleteness: user.profileCompleteness,
          subscription: user.subscription
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// Refresh access token
const refreshToken = async (req, res) => {
  try {
    const user = req.user; // Set by refreshTokenAuth middleware
    
    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
    
    res.json({
      success: true,
      data: {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken
        }
      }
    });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    // In a more sophisticated setup, you might want to blacklist the token
    // For now, we'll just send a success response
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findByEmailVerificationToken(token);
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }
    
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Email verified successfully'
    });
    
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed'
    });
  }
};

// Resend verification email
const resendVerification = async (req, res) => {
  try {
    const user = req.user; // Set by authenticate middleware
    
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }
    
    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();
    
    // Send verification email
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email - Career Boost AI',
      template: 'emailVerification',
      data: {
        firstName: user.profile.firstName,
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`
      }
    });
    
    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });
    
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email'
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    }
    
    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();
    
    // Send reset email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset - Career Boost AI',
        template: 'passwordReset',
        data: {
          firstName: user.profile.firstName,
          resetUrl: `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
        }
      });
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      
      return res.status(500).json({
        success: false,
        message: 'Failed to send reset email'
      });
    }
    
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset request failed'
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    const user = await User.findByPasswordResetToken(token);
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }
    
    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    // Reset login attempts
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Password reset failed'
    });
  }
};

// Change password (authenticated user)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    console.error('Change password error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Password change failed'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = req.user;
    
    // Demo mode - return mock profile
    if (process.env.DEMO_MODE === 'true') {
      return res.json({
        success: true,
        data: {
          user: {
            id: 'demo-user-123',
            email: 'demo@careerboost.ai',
            profile: {
              firstName: 'Demo',
              lastName: 'User',
              phone: '+1 (555) 123-4567',
              location: 'San Francisco, CA'
            },
            preferences: {
              notifications: {
                email: true,
                jobAlerts: true,
                marketingCommunications: false
              }
            },
            subscription: {
              plan: 'Free',
              expiresAt: null
            },
            emailVerified: true,
            profileCompleteness: 75,
            onboardingCompleted: true,
            createdAt: new Date(),
            lastLoginAt: new Date()
          }
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          profile: user.profile,
          preferences: user.preferences,
          subscription: user.subscription,
          emailVerified: user.emailVerified,
          profileCompleteness: user.profileCompleteness,
          onboardingCompleted: user.onboardingCompleted,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt
        }
      }
    });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;
    
    // Demo mode
    if (process.env.DEMO_MODE === 'true') {
      return res.json({
        success: true,
        message: 'Profile updated successfully (Demo Mode)',
        data: { user: { ...req.user, ...updates } }
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update allowed fields
    if (updates.profile) {
      user.profile = { ...user.profile, ...updates.profile };
    }
    
    if (updates.preferences) {
      user.preferences = { ...user.preferences, ...updates.preferences };
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          profile: user.profile,
          preferences: user.preferences,
          emailVerified: user.emailVerified,
          profileCompleteness: user.profileCompleteness
        }
      }
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Update user preferences
const updatePreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notifications } = req.body;
    
    // Demo mode
    if (process.env.DEMO_MODE === 'true') {
      return res.json({
        success: true,
        message: 'Preferences updated successfully (Demo Mode)'
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (notifications) {
      user.preferences = user.preferences || {};
      user.preferences.notifications = {
        ...user.preferences.notifications,
        ...notifications
      };
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Preferences updated successfully'
    });
    
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
};

module.exports = {
  signup,
  login,
  refreshToken,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile,
  updatePreferences
};