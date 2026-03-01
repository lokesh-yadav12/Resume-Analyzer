# OAuth Social Login Setup Guide

## Current Status

### ✅ What's Already Implemented
- **Backend OAuth Routes**: Fully configured for Google, LinkedIn, and GitHub
- **Passport Strategies**: All three OAuth strategies are implemented
- **User Model**: Supports social login IDs (googleId, linkedinId, githubId)
- **Frontend UI**: Social login buttons are present on Login and Signup pages
- **Callback Handlers**: Backend callback routes are ready

### ⚠️ What's Missing
- **OAuth Credentials**: Client IDs and Secrets are not configured
- **Frontend Callback Page**: Need to create OAuth callback handler
- **Environment Variables**: OAuth credentials need to be added

## Current State: NOT WORKING ❌

**Why?** The OAuth credentials (Client ID and Client Secret) are empty in the `.env` file:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

**What happens when you click the buttons?**
- The buttons redirect to `/api/auth/google`, `/api/auth/linkedin`, or `/api/auth/github`
- The backend checks if credentials are configured
- Since they're empty, the OAuth strategies are not initialized
- The login will fail silently or show an error

## How to Enable OAuth (Step-by-Step)

### 1. Google OAuth Setup

#### Step 1: Create Google OAuth App
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Set Application type to "Web application"
7. Add authorized redirect URIs:
   - Development: `http://localhost:5000/api/auth/google/callback`
   - Production: `https://your-domain.com/api/auth/google/callback`

#### Step 2: Add Credentials to .env
```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 2. LinkedIn OAuth Setup

#### Step 1: Create LinkedIn App
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app
3. Fill in app details
4. Go to "Auth" tab
5. Add redirect URLs:
   - Development: `http://localhost:5000/api/auth/linkedin/callback`
   - Production: `https://your-domain.com/api/auth/linkedin/callback`
6. Request access to "Sign In with LinkedIn" product

#### Step 2: Add Credentials to .env
```env
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
```

### 3. GitHub OAuth Setup

#### Step 1: Create GitHub OAuth App
1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in application details:
   - Application name: Career Boost AI
   - Homepage URL: `http://localhost:5173` (dev) or your domain
   - Authorization callback URL: `http://localhost:5000/api/auth/github/callback`
4. Click "Register application"

#### Step 2: Add Credentials to .env
```env
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 4. Create Frontend OAuth Callback Handler

Create `frontend/src/pages/AuthCallback.jsx`:

```jsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthData } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const userStr = searchParams.get('user');
        const error = searchParams.get('error');

        if (error) {
          console.error('OAuth error:', error);
          navigate('/login?error=oauth_failed');
          return;
        }

        if (accessToken && refreshToken && userStr) {
          const user = JSON.parse(decodeURIComponent(userStr));
          
          // Store tokens
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          
          // Update auth context
          setAuthData({ user, tokens: { accessToken, refreshToken } });
          
          // Redirect to dashboard
          navigate('/dashboard');
        } else {
          navigate('/login?error=invalid_callback');
        }
      } catch (error) {
        console.error('Callback error:', error);
        navigate('/login?error=callback_failed');
      }
    };

    handleCallback();
  }, [searchParams, navigate, setAuthData]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">
          Completing sign in...
        </h2>
        <p className="text-gray-600 mt-2">
          Please wait while we set up your account
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
```

### 5. Add Route to App.jsx

```jsx
import AuthCallback from './pages/AuthCallback';

// In your routes:
<Route path="/auth/callback" element={<AuthCallback />} />
```

### 6. Restart Backend

After adding credentials:
```bash
cd backend
npm run dev
```

## Testing OAuth

### Test Google Login
1. Click "Google" button on login page
2. Should redirect to Google login
3. After authentication, redirects back to your app
4. User is logged in automatically

### Test LinkedIn Login
1. Click "LinkedIn" button
2. Redirects to LinkedIn authorization
3. After approval, returns to app
4. User is logged in

### Test GitHub Login
1. Click "GitHub" button
2. Redirects to GitHub authorization
3. After approval, returns to app
4. User is logged in

## How OAuth Works in Your App

### Flow Diagram
```
User clicks "Login with Google"
    ↓
Frontend redirects to: /api/auth/google
    ↓
Backend redirects to: Google OAuth page
    ↓
User authorizes on Google
    ↓
Google redirects to: /api/auth/google/callback
    ↓
Backend processes OAuth response
    ↓
Backend creates/updates user in database
    ↓
Backend generates JWT tokens
    ↓
Backend redirects to: /auth/callback?access_token=...&user=...
    ↓
Frontend AuthCallback page processes tokens
    ↓
User is logged in and redirected to dashboard
```

## Security Features

### Already Implemented ✅
- Email verification for OAuth users
- Account linking (if email already exists)
- Profile data extraction from OAuth providers
- Secure token generation
- Last login tracking

### User Data Extracted
- **Google**: Email, First Name, Last Name, Avatar
- **LinkedIn**: Email, First Name, Last Name, Avatar, LinkedIn URL
- **GitHub**: Email, Username, Avatar

## Troubleshooting

### Issue: "OAuth failed" error
**Solution**: Check if credentials are correctly set in `.env` file

### Issue: Redirect URI mismatch
**Solution**: Ensure callback URLs in OAuth app settings match exactly:
- `http://localhost:5000/api/auth/google/callback`
- `http://localhost:5000/api/auth/linkedin/callback`
- `http://localhost:5000/api/auth/github/callback`

### Issue: User not created
**Solution**: Check backend logs for errors. Ensure MongoDB is running.

### Issue: Tokens not stored
**Solution**: Check frontend AuthCallback page is properly handling URL parameters

## Demo Mode Behavior

When `DEMO_MODE=true`:
- OAuth buttons are visible but won't work
- Regular email/password login works with mock data
- To test OAuth, set `DEMO_MODE=false` and configure MongoDB

## Production Checklist

Before deploying to production:

- [ ] Set up OAuth apps for production domains
- [ ] Update callback URLs to production URLs
- [ ] Store credentials securely (use environment variables)
- [ ] Test all three OAuth providers
- [ ] Verify email linking works correctly
- [ ] Test error scenarios
- [ ] Enable HTTPS (required for OAuth)
- [ ] Update CORS settings for production domain

## Quick Enable for Development

If you want to quickly test OAuth without setting up all three:

### Option 1: Enable Only Google (Easiest)
1. Set up Google OAuth (most common, easiest to configure)
2. Leave LinkedIn and GitHub empty
3. Only Google button will work

### Option 2: Use Test Credentials
For development only, you can use test OAuth apps:
1. Create test apps with localhost URLs
2. Use for development
3. Replace with production apps before deploying

## Current Recommendation

**For Now**: OAuth is **optional** and not required for the app to work.

**Your app works perfectly without OAuth using:**
- ✅ Email/Password registration
- ✅ Email verification
- ✅ Password reset
- ✅ All core features

**To Enable OAuth**: Follow the setup guide above when you're ready to add social login.

## Summary

| Provider | Status | Setup Required |
|----------|--------|----------------|
| Google   | ⚠️ Not Configured | Add Client ID & Secret |
| LinkedIn | ⚠️ Not Configured | Add Client ID & Secret |
| GitHub   | ⚠️ Not Configured | Add Client ID & Secret |
| Email/Password | ✅ Working | None |

**Bottom Line**: OAuth social login is **implemented but not configured**. The app works perfectly without it using email/password authentication. Enable OAuth when you're ready by following the setup guide above.

---

**Need Help?** 
- Google OAuth: https://developers.google.com/identity/protocols/oauth2
- LinkedIn OAuth: https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication
- GitHub OAuth: https://docs.github.com/en/developers/apps/building-oauth-apps
