import React from 'react';
import { Music, Home, Library as LibraryIcon, User } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';

const Sidebar = ({ page, setPage, user, setShowProfileModal, isMobile }) => {
  return (
    <div className="w-20 bg-black/40 backdrop-blur-xl h-screen flex flex-col p-4 fixed left-0 top-0 z-40 border-r border-white/10">
      <div className="flex items-center justify-center mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
          <Music size={20} className="text-white" />
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <button 
          onClick={() => setPage('home')}
          className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 ${
            page === 'home' 
              ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-300' 
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Home size={24} />
          <span className="text-xs">Home</span>
        </button>
        <button 
          onClick={() => setPage('library')}
          className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 ${
            page === 'library' 
              ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-300' 
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <LibraryIcon size={24} />
          <span className="text-xs">Library</span>
        </button>
        
        {/* Profile immediately after Library */}
        <div className="mt-4">
          <ProfileDropdown 
            user={user}
            setShowProfileModal={setShowProfileModal}
            isMobile={isMobile}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;