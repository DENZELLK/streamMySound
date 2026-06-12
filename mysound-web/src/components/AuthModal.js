import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from '../firebase';
import { auth, db, googleProvider } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { User, Mail, Lock, UserPlus, LogIn, X, Music, Sparkles } from 'lucide-react';

function AuthModal({ isOpen, onClose }) {
  const [view, setView] = useState('signIn'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setError('');
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) return setError('Please fill all fields');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    
    setIsLoading(true);
    setError('');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), { 
        username, 
        email,
        createdAt: new Date().toISOString(),
        library: []
      });
      handleClose();
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError('Please fill all fields');
    
    setIsLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      handleClose();
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await signInWithPopup(auth, googleProvider);
      handleClose();
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/popup-closed-by-user': 'Sign in was cancelled.',
      'auth/popup-blocked': 'Popup was blocked. Please allow popups for this site.',
    };
    return errorMessages[errorCode] || 'An error occurred. Please try again.';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="relative bg-gradient-to-br from-gray-900/90 to-purple-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl w-full max-w-md overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-pink-500/10 rounded-full translate-x-1/2 translate-y-1/2 blur-xl"></div>
        
        {/* Header */}
        <div className="relative p-6 border-b border-white/10">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-300"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
              <Music size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              MySound
            </h2>
          </div>
          
          <p className="text-white/60 text-center text-sm">
            {view === 'signUp' ? 'Create your account and start listening' : 'Welcome back to your music'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl backdrop-blur-sm animate-slide-in-bottom">
              <p className="text-red-300 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Google Sign In */}
          <button 
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-4 px-6 rounded-2xl transition-all duration-300 mb-6 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-medium">
                  Continue with Google
                </span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-transparent text-white/40 text-sm">or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={view === 'signUp' ? handleSignUp : handleSignIn} className="space-y-4">
            {view === 'signUp' && (
              <div className="group">
                <label className="block text-white/80 text-sm font-medium mb-2 ml-1">
                  Username
                </label>
                <div className="relative">
                  <User size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 group-focus-within:text-purple-400 transition-colors duration-300" />
                  <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-white/40 py-4 pl-12 pr-4 rounded-2xl focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 outline-none"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div className="group">
              <label className="block text-white/80 text-sm font-medium mb-2 ml-1">
                Email
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 group-focus-within:text-purple-400 transition-colors duration-300" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-white/40 py-4 pl-12 pr-4 rounded-2xl focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 outline-none"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-white/80 text-sm font-medium mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 group-focus-within:text-purple-400 transition-colors duration-300" />
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-white/40 py-4 pl-12 pr-4 rounded-2xl focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 outline-none"
                  required
                  disabled={isLoading}
                />
              </div>
              {view === 'signUp' && (
                <p className="text-white/40 text-xs mt-2 ml-1">
                  Password must be at least 6 characters
                </p>
              )}
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {view === 'signUp' ? (
                    <>
                      <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
                      Create Account
                    </>
                  ) : (
                    <>
                      <LogIn size={20} className="group-hover:scale-110 transition-transform" />
                      Sign In
                    </>
                  )}
                </>
              )}
            </button>
          </form>

          {/* Toggle View */}
          <div className="text-center mt-6 pt-6 border-t border-white/10">
            <p className="text-white/60 text-sm">
              {view === 'signUp' ? 'Already have an account? ' : "Don't have an account? "}
              <button 
                onClick={() => {
                  setView(view === 'signUp' ? 'signIn' : 'signUp');
                  setError('');
                }}
                disabled={isLoading}
                className="text-purple-300 hover:text-purple-200 font-medium transition-colors duration-300 disabled:opacity-50"
              >
                {view === 'signUp' ? 'Sign In' : 'Create Account'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-black/20 border-t border-white/5">
          <p className="text-white/30 text-xs text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;