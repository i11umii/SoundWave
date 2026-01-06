import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PlayerProvider } from './contexts/PlayerContext';

import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import TracksPage from './pages/TracksPage';
import PlaylistPage from './pages/PlaylistPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage';
import ProfilePage from './pages/ProfilePage';
import ArtistPage from './pages/ArtistPage';
import AlbumPage from './pages/AlbumPage';
import LikedSongsPage from './pages/LikedSongsPage';
import RecentlyPlayedPage from './pages/RecentlyPlayedPage';
import MusicDNAPage from './pages/MusicDNAPage';

import MusicPlayer from './components/MusicPlayer';

function ProtectedRoute(props) {
  const auth = useAuth();
  const isAuthenticated = auth.isAuthenticated;

  const children = props.children;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
}

function AppRoutes() {
  const auth = useAuth();
  const isAuthenticated = auth.isAuthenticated;

  let loginElement = <LoginPage />;
  if (isAuthenticated) {
    loginElement = <Navigate to="/" />;
  }

  let fallbackPath = '/login';
  if (isAuthenticated) {
    fallbackPath = '/';
  }

  let musicPlayerBlock = null;
  if (isAuthenticated) {
    musicPlayerBlock = <MusicPlayer />;
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={loginElement} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tracks"
          element={
            <ProtectedRoute>
              <TracksPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/music-dna"
          element={
            <ProtectedRoute>
              <MusicDNAPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/playlists"
          element={
            <ProtectedRoute>
              <PlaylistPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/playlists/:id"
          element={
            <ProtectedRoute>
              <PlaylistDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/artist/:id"
          element={
            <ProtectedRoute>
              <ArtistPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/album/:id"
          element={
            <ProtectedRoute>
              <AlbumPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/liked-songs"
          element={
            <ProtectedRoute>
              <LikedSongsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recently-played"
          element={
            <ProtectedRoute>
              <RecentlyPlayedPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={fallbackPath} replace />} />
      </Routes>

      {musicPlayerBlock}
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <PlayerProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100">
            <AppRoutes />
          </div>
        </PlayerProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
