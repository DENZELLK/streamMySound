import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';

const ProfileModal = ({
  showProfileModal,
  setShowProfileModal,
  user,
  setShowAuth,
  feedback,
  setFeedback,
  isEditing,
  setIsEditing,
  editData,
  setEditData,
  updatingProfile,
  errors,
  setErrors,
  feedbackSent,
  setFeedbackSent,
  handleFeedbackSubmit,
  handleSaveProfile,
  handleCancelEdit,
  startEditing,
  handleSignOut
}) => {
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showProfileModal) {
        setShowProfileModal(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showProfileModal, setShowProfileModal]);

  if (!showProfileModal) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-purple-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Account</h2>
          <button
            onClick={() => setShowProfileModal(false)}
            className="text-white/60 hover:text-white transition-colors duration-300 text-2xl font-bold"
            aria-label="Close profile modal"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!user ? (
            // Not signed in state
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User size={32} className="text-white/60" />
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">Not Signed In</h3>
              <p className="text-white/60 mb-6">Sign in to access your profile and personalized features</p>
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  setShowAuth(true);
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 w-full"
              >
                Sign In
              </button>
            </div>
          ) : (
            // Signed in state
            <>
              {/* Profile Summary */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <User size={32} className="text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-1">
                  {user.displayName || 'User'}
                </h3>
                <p className="text-white/60 text-sm">{user.email}</p>
                <p className="text-white/40 text-xs mt-2">
                  Member since {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Recently'}
                </p>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10 mb-6">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 py-3 text-sm font-medium transition-all duration-300 ${
                    activeTab === 'profile' 
                      ? 'text-purple-400 border-b-2 border-purple-400' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`flex-1 py-3 text-sm font-medium transition-all duration-300 ${
                    activeTab === 'feedback' 
                      ? 'text-purple-400 border-b-2 border-purple-400' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Feedback
                </button>
              </div>

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  {!isEditing ? (
                    <>
                      <div className="space-y-3">
                        <div>
                          <label className="text-white/60 text-sm">Display Name</label>
                          <p className="text-white font-medium">{user.displayName || 'Not set'}</p>
                        </div>
                        <div>
                          <label className="text-white/60 text-sm">Email</label>
                          <p className="text-white font-medium">{user.email}</p>
                        </div>
                        <div>
                          <label className="text-white/60 text-sm">Account Created</label>
                          <p className="text-white font-medium">
                            {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={startEditing}
                        className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-2xl transition-all duration-300"
                      >
                        Edit Profile
                      </button>
                    </>
                  ) : (
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div>
                        <label className="text-white/60 text-sm mb-2 block">Display Name</label>
                        <input
                          type="text"
                          value={editData.displayName}
                          onChange={(e) => {
                            setEditData(prev => ({ ...prev, displayName: e.target.value }));
                            if (errors.displayName) setErrors(prev => ({ ...prev, displayName: '' }));
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/40 focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 outline-none"
                          placeholder="Enter display name"
                        />
                      </div>
                      <div>
                        <label className="text-white/60 text-sm mb-2 block">Email</label>
                        <input
                          type="email"
                          value={editData.email}
                          onChange={(e) => {
                            setEditData(prev => ({ ...prev, email: e.target.value }));
                            if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                          }}
                          className={`w-full bg-white/5 border ${
                            errors.email ? 'border-red-500/50' : 'border-white/10'
                          } rounded-2xl px-4 py-3 text-white placeholder-white/40 focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 outline-none`}
                          placeholder="Enter email"
                        />
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                      </div>
                      <div>
                        <label className="text-white/60 text-sm mb-2 block">New Password</label>
                        <input
                          type="password"
                          value={editData.password}
                          onChange={(e) => {
                            setEditData(prev => ({ ...prev, password: e.target.value }));
                            if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                          }}
                          className={`w-full bg-white/5 border ${
                            errors.password ? 'border-red-500/50' : 'border-white/10'
                          } rounded-2xl px-4 py-3 text-white placeholder-white/40 focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 outline-none`}
                          placeholder="Enter new password"
                        />
                        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-2xl transition-all duration-300"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={updatingProfile}
                          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-semibold py-3 rounded-2xl transition-all duration-300"
                        >
                          {updatingProfile ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Feedback Tab */}
              {activeTab === 'feedback' && (
                <div className="space-y-4">
                  {feedbackSent ? (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 text-center">
                      <p className="text-green-400 text-sm">Thank you for your feedback!</p>
                    </div>
                  ) : (
                    <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                      <div>
                        <label className="text-white/60 text-sm mb-2 block">Your Feedback</label>
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          rows="4"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/40 focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 outline-none resize-none"
                          placeholder="Tell us what you think about the app..."
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!feedback.trim()}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-2xl transition-all duration-300"
                      >
                        Send Feedback
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Sign Out Button */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={handleSignOut}
                  className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 py-3 rounded-2xl transition-all duration-300"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;