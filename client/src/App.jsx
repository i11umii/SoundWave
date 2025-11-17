import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PlayerProvider } from './contexts/PlayerContext';

import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import PlaylistPage from './pages/PlaylistPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage';
import ProfilePage from './pages/ProfilePage';
import ArtistPage from './pages/ArtistPage';
import LikedSongsPage from './pages/LikedSongsPage';
import RecentlyPlayedPage from './pages/RecentlyPlayedPage';

// NEW PAGES
import LiveFeedPage from './pages/LiveFeedPage';
import MusicDNAPage from './pages/MusicDNAPage';
import SmartStatsPage from './pages/SmartStatsPage';

import MusicPlayer from './components/MusicPlayer';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        
        {/* NEW ROUTES */}
        <Route path="/live" element={<ProtectedRoute><LiveFeedPage /></ProtectedRoute>} />
        <Route path="/music-dna" element={<ProtectedRoute><MusicDNAPage /></ProtectedRoute>} />
        <Route path="/smart-stats" element={<ProtectedRoute><SmartStatsPage /></ProtectedRoute>} />
        
        <Route path="/playlists" element={<ProtectedRoute><PlaylistPage /></ProtectedRoute>} />
        <Route path="/playlists/:id" element={<ProtectedRoute><PlaylistDetailPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/artist/:id" element={<ProtectedRoute><ArtistPage /></ProtectedRoute>} />
        <Route path="/liked-songs" element={<ProtectedRoute><LikedSongsPage /></ProtectedRoute>} />
        <Route path="/recently-played" element={<ProtectedRoute><RecentlyPlayedPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
      {isAuthenticated && <MusicPlayer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <PlayerProvider>
          <div className="min-h-screen bg-slate-900 text-white">
            <AppRoutes />
          </div>
        </PlayerProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;