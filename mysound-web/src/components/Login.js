import React, { useState, useEffect } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged } from '../firebase';
import { auth, googleProvider } from '../firebase';
import { User, LogOut, Music, Sparkles, Shield, CheckCircle } from 'lucide-react';

function Login() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const idToken = await currentUser.getIdToken();
        setToken(idToken);
      } else {
        setToken(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();
      setToken(idToken);
      console.log('🎵 Signed in successfully:', user.uid); 
    } catch (error) {
      console.error('❌ Sign-in error:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setToken(null);
      setShowUserMenu(false);
      console.log('👋 Signed out successfully');
    } catch (error) {
      console.error('❌ Sign-out error:', error);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading your music experience...</p>
        </div>
      </div>
    );
  }

  
  if (user) {
    return (
      <div className="relative">
        {/* User Avatar Button */}
        <button 
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/10 transition-all duration-300 group"
        >
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-semibold text-sm">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || user.email}
                  className="w-10 h-10 rounded-2xl object-cover"
                />
              ) : (
                <User size={20} />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-black"></div>
          </div>
          
          <div className="hidden md:block text-left">
            <p className="text-white font-medium text-sm truncate max-w-32">
              {user.displayName || user.email?.split('@')[0]}
            </p>
            <p className="text-white/40 text-xs">Connected</p>
          </div>
        </button>

        {/* User Dropdown Menu */}
        {showUserMenu && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-black/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl z-50 animate-fade-in">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-semibold">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || user.email}
                        className="w-16 h-16 rounded-2xl object-cover"
                      />
                    ) : (
                      <User size={24} />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-black flex items-center justify-center">
                    <CheckCircle size={8} className="text-black" fill="currentColor" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-lg truncate">
                    {user.displayName || 'User'}
                  </h3>
                  <p className="text-white/60 text-sm truncate mt-1">
                    {user.email}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Shield size={12} className="text-green-400" />
                    <span className="text-green-400 text-xs font-medium">Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Connection Status */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">API Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">Ready</span>
                </div>
              </div>
              {token && (
                <div className="mt-2">
                  <span className="text-white/40 text-xs">Token: •••{token.slice(-8)}</span>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="p-4 border-b border-white/10">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-white font-bold text-lg">0</div>
                  <div className="text-white/40 text-xs">Saved Songs</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-bold text-lg">0</div>
                  <div className="text-white/40 text-xs">Playlists</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4">
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-2xl transition-all duration-300 group"
              >
                <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Backdrop for closing menu */}
        {showUserMenu && (
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowUserMenu(false)}
          ></div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button 
        onClick={handleSignIn}
        disabled={isSigningIn}
        className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 px-6 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {isSigningIn ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span className="font-medium">Signing in...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium">Sign in with Google</span>
          </>
        )}
      </button>
    </div>
  );
}

export default Login;