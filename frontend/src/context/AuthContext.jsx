import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        tokens: action.payload.tokens,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        tokens: null,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        tokens: null,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  tokens: null,
  loading: false,
  error: null
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set up axios interceptors
  useEffect(() => {
    // Request interceptor to add auth token
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (state.tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${state.tokens.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          if (state.tokens?.refreshToken) {
            try {
              const response = await axios.post('/api/auth/refresh-token', {
                refreshToken: state.tokens.refreshToken
              });

              const newTokens = response.data.data.tokens;
              dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                  user: state.user,
                  tokens: newTokens
                }
              });

              // Store new tokens
              localStorage.setItem('tokens', JSON.stringify(newTokens));

              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
              return axios(originalRequest);
            } catch (refreshError) {
              // Refresh failed, logout user
              logout();
              return Promise.reject(refreshError);
            }
          } else {
            // No refresh token, logout user
            logout();
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [state.tokens]);

  // Load user from localStorage on app start
  useEffect(() => {
    const loadUser = async () => {
      const storedTokens = localStorage.getItem('tokens');
      const storedUser = localStorage.getItem('user');

      if (storedTokens && storedUser) {
        try {
          const tokens = JSON.parse(storedTokens);
          const user = JSON.parse(storedUser);

          // Verify token is still valid by fetching user profile
          const response = await axios.get('/api/auth/profile', {
            headers: { Authorization: `Bearer ${tokens.accessToken}` }
          });

          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: response.data.data.user,
              tokens
            }
          });
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem('tokens');
          localStorage.removeItem('user');
        }
      }
    };

    loadUser();
  }, []);

  // Store user and tokens in localStorage when they change
  useEffect(() => {
    if (state.isAuthenticated && state.user && state.tokens) {
      localStorage.setItem('user', JSON.stringify(state.user));
      localStorage.setItem('tokens', JSON.stringify(state.tokens));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('tokens');
    }
  }, [state.isAuthenticated, state.user, state.tokens]);

  // Login function
  const login = useCallback(async (email, password) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      const { user, tokens } = response.data.data;

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, tokens }
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Signup function
  const signup = useCallback(async (userData) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await axios.post('/api/auth/signup', userData);

      const { user, tokens } = response.data.data;

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, tokens }
      });

      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Signup failed';
      const errors = error.response?.data?.errors || [];
      
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });
      
      return { success: false, error: errorMessage, errors };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  // Update user profile
  const updateUser = useCallback((userData) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: userData
    });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email';
      return { success: false, error: errorMessage };
    }
  };

  // Reset password
  const resetPassword = async (token, password) => {
    try {
      const response = await axios.post(`/api/auth/reset-password/${token}`, { password });
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      const errors = error.response?.data?.errors || [];
      return { success: false, error: errorMessage, errors };
    }
  };

  // Verify email
  const verifyEmail = async (token) => {
    try {
      const response = await axios.get(`/api/auth/verify-email/${token}`);
      
      // Update user's email verification status
      if (state.user) {
        updateUser({ emailVerified: true });
      }
      
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Email verification failed';
      return { success: false, error: errorMessage };
    }
  };

  // Resend verification email
  const resendVerification = async () => {
    try {
      const response = await axios.post('/api/auth/resend-verification');
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to resend verification email';
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    ...state,
    login,
    signup,
    logout,
    updateUser,
    clearError,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};