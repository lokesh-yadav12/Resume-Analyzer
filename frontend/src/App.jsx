import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/common/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AuthCallback from './pages/AuthCallback';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import JobRecommendations from './pages/JobRecommendations';
import LearningHub from './pages/LearningHub';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Styles
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <Router>
              <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                
                <main className="flex-1">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    
                    {/* Protected Routes */}
                    <Route path="/resume-analyzer" element={
                      <ProtectedRoute>
                        <ResumeAnalyzer />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/job-recommendations" element={
                      <ProtectedRoute>
                        <JobRecommendations />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/learning" element={
                      <ProtectedRoute>
                        <LearningHub />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    
                    {/* 404 Page */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                
                <Footer />
              </div>
            </Router>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;