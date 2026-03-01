import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Edit, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Button from '../components/common/Button';

const Profile = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    jobAlerts: true,
    marketingCommunications: false
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/auth/profile');
      
      if (response.data.success) {
        const userData = response.data.data.user;
        setUser(userData);
        setPreferences({
          emailNotifications: userData.preferences?.notifications?.email ?? true,
          jobAlerts: userData.preferences?.notifications?.jobAlerts ?? true,
          marketingCommunications: userData.preferences?.notifications?.marketingCommunications ?? false
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setIsSaving(true);
      await axios.put('/api/auth/profile/preferences', {
        notifications: preferences
      });
      // Show success message
      alert('Preferences saved successfully!');
    } catch (err) {
      console.error('Error saving preferences:', err);
      alert('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center"
        >
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Failed to Load Profile
          </h2>
          <p className="text-gray-600 mb-4">{error || 'Please try again later'}</p>
          <Button variant="primary" onClick={fetchProfile}>
            Retry
          </Button>
        </motion.div>
      </div>
    );
  }

  const fullName = user.profile?.firstName && user.profile?.lastName 
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : user.email.split('@')[0];
  
  const joinDate = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences.</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>

          <div className="flex items-center space-x-6 mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              {user.profile?.avatar ? (
                <img src={user.profile.avatar} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-blue-600" />
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{fullName}</h3>
              <p className="text-gray-600">Career Boost AI Member</p>
              <p className="text-sm text-gray-500">Member since {joinDate}</p>
              {user.emailVerified && (
                <span className="inline-flex items-center px-2 py-1 mt-1 bg-green-100 text-green-800 text-xs rounded-full">
                  ✓ Verified
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{user.profile?.phone || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900">{user.profile?.location || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium text-gray-900">{joinDate}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b border-gray-200">
              <div>
                <h3 className="font-medium text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-600">Receive updates about your resume analysis and job matches</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={preferences.emailNotifications}
                  onChange={(e) => setPreferences({...preferences, emailNotifications: e.target.checked})}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-gray-200">
              <div>
                <h3 className="font-medium text-gray-900">Job Alerts</h3>
                <p className="text-sm text-gray-600">Get notified when new jobs match your profile</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={preferences.jobAlerts}
                  onChange={(e) => setPreferences({...preferences, jobAlerts: e.target.checked})}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <h3 className="font-medium text-gray-900">Marketing Communications</h3>
                <p className="text-sm text-gray-600">Receive tips and updates about career development</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={preferences.marketingCommunications}
                  onChange={(e) => setPreferences({...preferences, marketingCommunications: e.target.checked})}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="primary"
                onClick={handleSavePreferences}
                loading={isSaving}
              >
                Save Changes
              </Button>
              <Button 
                variant="outline"
                onClick={fetchProfile}
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;