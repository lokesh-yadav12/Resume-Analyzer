const express = require('express');
const passport = require('passport');
const { 
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
} = require('../controllers/authController');
const { 
  authenticate, 
  refreshTokenAuth 
} = require('../middleware/auth');
const { validateSignup, validateLogin, validateForgotPassword, validateResetPassword, validateChangePassword } = require('../middleware/validator');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later'
  }
});

// Local authentication routes
router.post('/signup', authLimiter, validateSignup, signup);
router.post('/login', authLimiter, validateLogin, login);
router.post('/refresh-token', refreshTokenAuth, refreshToken);
router.post('/logout', logout);

// Email verification
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', authenticate, resendVerification);

// Password reset
router.post('/forgot-password', passwordResetLimiter, validateForgotPassword, forgotPassword);
router.post('/reset-password/:token', passwordResetLimiter, validateResetPassword, resetPassword);
router.post('/change-password', authenticate, validateChangePassword, changePassword);

// Profile
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/profile/preferences', authenticate, updatePreferences);

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      const { generateTokens } = require('../middleware/auth');
      const { accessToken, refreshToken } = generateTokens(req.user._id);
      
      // Redirect to frontend with tokens
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?` +
        `access_token=${accessToken}&refresh_token=${refreshToken}&` +
        `user=${encodeURIComponent(JSON.stringify({
          id: req.user._id,
          email: req.user.email,
          profile: req.user.profile,
          emailVerified: req.user.emailVerified
        }))}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

// LinkedIn OAuth routes
router.get('/linkedin',
  passport.authenticate('linkedin', {
    scope: ['r_emailaddress', 'r_liteprofile']
  })
);

router.get('/linkedin/callback',
  passport.authenticate('linkedin', { session: false }),
  async (req, res) => {
    try {
      const { generateTokens } = require('../middleware/auth');
      const { accessToken, refreshToken } = generateTokens(req.user._id);
      
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?` +
        `access_token=${accessToken}&refresh_token=${refreshToken}&` +
        `user=${encodeURIComponent(JSON.stringify({
          id: req.user._id,
          email: req.user.email,
          profile: req.user.profile,
          emailVerified: req.user.emailVerified
        }))}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('LinkedIn OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

// GitHub OAuth routes
router.get('/github',
  passport.authenticate('github', {
    scope: ['user:email']
  })
);

router.get('/github/callback',
  passport.authenticate('github', { session: false }),
  async (req, res) => {
    try {
      const { generateTokens } = require('../middleware/auth');
      const { accessToken, refreshToken } = generateTokens(req.user._id);
      
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?` +
        `access_token=${accessToken}&refresh_token=${refreshToken}&` +
        `user=${encodeURIComponent(JSON.stringify({
          id: req.user._id,
          email: req.user.email,
          profile: req.user.profile,
          emailVerified: req.user.emailVerified
        }))}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('GitHub OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

module.exports = router;