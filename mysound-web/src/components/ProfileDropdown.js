import React, { useRef } from 'react';
import { User } from 'lucide-react';

const ProfileDropdown = ({ user, setShowProfileModal, isMobile }) => {
  const profileRef = useRef(null);

  return (
    <div className="relative" ref={profileRef}>
      <button
        onClick={() => setShowProfileModal(true)}
        className={`flex items-center gap-2 p-2 rounded-2xl hover:bg-white/10 transition-all duration-300 text-white/80 hover:text-white ${
          isMobile ? 'flex-col gap-1' : ''
        }`}
      >
        <User size={20} />
        {user && (
          <span className={`text-sm truncate ${isMobile ? 'max-w-[60px] text-xs' : 'max-w-20'}`}>
            {user.displayName 
              ? (user.displayName.length > 7 ? user.displayName.substring(0, 7) + '...' : user.displayName)
              : (user.email?.split('@')[0].length > 7 ? user.email.split('@')[0].substring(0, 7) + '...' : user.email?.split('@')[0])
            }
          </span>
        )}
      </button>
    </div>
  );
};

export default ProfileDropdown;