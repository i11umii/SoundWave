import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: 'fa-home', label: 'Home' },
    { path: '/playlists', icon: 'fa-list', label: 'Playlists' },
    { path: '/liked-songs', icon: 'fa-heart', label: 'Liked Songs' },
    { path: '/recently-played', icon: 'fa-clock', label: 'Recent' },
  ];

  const features = [
    { path: '/smart-stats', icon: 'fa-chart-line', label: 'Smart Stats' },
    { path: '/mood-journal', icon: 'fa-book', label: 'Mood Journal' },
  ];

  return (
    <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center neon-glow group-hover:scale-105 transition-transform">
            <i className="fas fa-music text-white text-lg"></i>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            SoundWave
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${location.pathname === item.path
              ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
          >
            <i className={`fas ${item.icon} w-5 text-center`}></i>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-800">
        <Link
          to="/profile"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800/50 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 flex items-center justify-center">
            <i className="fas fa-user text-white text-sm"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Profile</p>
            <p className="text-xs text-gray-400 truncate">View settings</p>
          </div>
          <i className="fas fa-chevron-right text-gray-500 group-hover:text-gray-300 transition-colors"></i>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;