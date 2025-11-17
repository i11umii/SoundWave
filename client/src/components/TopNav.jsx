import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SearchModal from './SearchModal';

const TopNav = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = () => {
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <>
      <nav className="bg-slate-900 border-b border-slate-800 px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Navigation Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-all"
            >
              <i className="fas fa-chevron-left text-slate-400"></i>
            </button>
            <button
              onClick={() => navigate(1)}
              className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-all"
            >
              <i className="fas fa-chevron-right text-slate-400"></i>
            </button>
          </div>

          {/* Search Button */}
          <div className="flex-1 max-w-md mx-8">
            <button
              onClick={() => setShowSearch(true)}
              className="w-full bg-slate-800 text-slate-400 px-4 py-2 rounded-full text-sm text-left hover:bg-slate-700 transition-colors flex items-center gap-3"
            >
              <i className="fas fa-search"></i>
              <span>Search songs, artists, playlists...</span>
            </button>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button className="hidden sm:block px-4 md:px-6 py-2 rounded-full border border-blue-500/30 text-sm hover:bg-blue-900/30 transition-all">
              Upgrade
            </button>

            {/* Avatar with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
              >
                <span className="text-sm font-semibold">{getInitials()}</span>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-slate-700">
                    <p className="text-sm font-semibold text-white">{user?.username}</p>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                  </div>

                  {/* Menu Items */}
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-3"
                  >
                    <i className="fas fa-user w-4"></i>
                    <span>Profile</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-3"
                  >
                    <i className="fas fa-cog w-4"></i>
                    <span>Settings</span>
                  </button>

                  <hr className="my-2 border-slate-700" />

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-slate-700 transition-colors flex items-center gap-3"
                  >
                    <i className="fas fa-sign-out-alt w-4"></i>
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
};

export default TopNav;