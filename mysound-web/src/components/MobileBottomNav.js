import React from 'react';
import { Home, Library as LibraryIcon, Search, User } from 'lucide-react';

const MobileBottomNav = ({ page, setPage, user, setShowProfileModal, searchInputRef, showProfileModal }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 flex justify-around py-3 z-50 md:hidden">
      <button 
        onClick={() => setPage('home')} 
        className={`flex flex-col items-center gap-1 transition-all duration-300 ${
          page === 'home' ? 'text-purple-400' : 'text-white/60'
        }`}
      >
        <Home size={22} />
        <span className="text-xs">Home</span>
      </button>
      <button 
        onClick={() => setPage('library')} 
        className={`flex flex-col items-center gap-1 transition-all duration-300 ${
          page === 'library' ? 'text-purple-400' : 'text-white/60'
        }`}
      >
        <LibraryIcon size={22} />
        <span className="text-xs">Library</span>
      </button>
      <button 
        onClick={() => searchInputRef.current?.focus()} 
        className="flex flex-col items-center gap-1 text-white/60 transition-all duration-300"
      >
        <Search size={22} />
        <span className="text-xs">Search</span>
      </button>
      <button 
        onClick={() => setShowProfileModal(true)}
        className={`flex flex-col items-center gap-1 transition-all duration-300 ${
          showProfileModal ? 'text-purple-400' : 'text-white/60 hover:text-white'
        }`}
      >
        <User size={22} />
        <span className="text-xs">Profile</span>
      </button>
    </div>
  );
};

export default MobileBottomNav;