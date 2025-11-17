import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    bio: ''
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const [profileRes, statsRes] = await Promise.all([
        userAPI.getProfile(),
        userAPI.getStats()
      ]);

      setProfile(profileRes.data.data);
      setStats(statsRes.data.data);
      
      setEditData({
        username: profileRes.data.data.username,
        bio: profileRes.data.data.bio || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await userAPI.updateProfile(editData);
      updateUser(response.data.data);
      setProfile(response.data.data);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const getInitials = () => {
    if (profile?.username) {
      return profile.username.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getMemberSince = () => {
    if (profile?.createdAt) {
      return new Date(profile.createdAt).getFullYear();
    }
    return new Date().getFullYear();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />

        <main className="flex-1 overflow-y-auto pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-900 to-slate-800 rounded-2xl p-6 sm:p-8 mb-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-4xl font-bold shadow-xl">
                  {getInitials()}
                </div>

                <div className="text-center sm:text-left flex-1">
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                    {profile?.username}
                  </h1>
                  <p className="text-blue-200 mb-4">
                    {profile?.bio || 'Music enthusiast'} • Member since {getMemberSince()}
                  </p>

                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {stats?.listeningStats?.totalMinutes || 0}
                      </div>
                      <div className="text-slate-300">Minutes Played</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats?.totalPlaylists || 0}</div>
                      <div className="text-slate-300">Playlists</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats?.totalLikedTracks || 0}</div>
                      <div className="text-slate-300">Liked Songs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {stats?.totalFollowedArtists || 0}
                      </div>
                      <div className="text-slate-300">Artists</div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    <i className="fas fa-edit mr-2"></i>
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Quick Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    to="/recently-played"
                    className="bg-slate-800 rounded-xl p-6 hover:bg-slate-700 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <i className="fas fa-clock text-white text-xl"></i>
                      </div>
                      <i className="fas fa-arrow-right text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all"></i>
                    </div>
                    <h3 className="text-xl font-semibold mb-1">Recently Played</h3>
                    <p className="text-slate-400 text-sm">
                      {stats?.recentlyPlayedCount || 0} tracks in your history
                    </p>
                  </Link>

                  <Link
                    to="/liked-songs"
                    className="bg-slate-800 rounded-xl p-6 hover:bg-slate-700 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <i className="fas fa-heart text-white text-xl"></i>
                      </div>
                      <i className="fas fa-arrow-right text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all"></i>
                    </div>
                    <h3 className="text-xl font-semibold mb-1">Liked Songs</h3>
                    <p className="text-slate-400 text-sm">
                      {stats?.totalLikedTracks || 0} songs you love
                    </p>
                  </Link>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Listening Stats */}
                <div className="bg-slate-800 rounded-xl p-6">
                  <h2 className="text-xl font-semibold mb-6">Listening Stats</h2>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-300">Total Time</span>
                        <span className="font-semibold">
                          {stats?.listeningStats?.totalHours || 0}h {(stats?.listeningStats?.totalMinutes || 0) % 60}m
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-700">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-300">Tracks Played</span>
                        <span className="font-semibold">{stats?.recentlyPlayedCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Music Taste */}
                {stats?.genrePreferences && stats.genrePreferences.length > 0 && (
                  <div className="bg-slate-800 rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-6">Your Music Taste</h2>
                    <div className="space-y-4">
                      {stats.genrePreferences.map((genre, index) => (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${
                                index === 0 ? 'bg-blue-500' :
                                index === 1 ? 'bg-green-500' :
                                index === 2 ? 'bg-purple-500' :
                                index === 3 ? 'bg-cyan-500' :
                                'bg-orange-500'
                              }`}></div>
                              <span className="text-slate-300">{genre.genre}</span>
                            </div>
                            <span className="text-sm font-semibold">{genre.percentage}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                index === 0 ? 'bg-blue-500' :
                                index === 1 ? 'bg-green-500' :
                                index === 2 ? 'bg-purple-500' :
                                index === 3 ? 'bg-cyan-500' :
                                'bg-orange-500'
                              }`}
                              style={{ width: `${genre.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Account Info */}
                <div className="bg-slate-800 rounded-xl p-6">
                  <h2 className="text-xl font-semibold mb-4">Account</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Status</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        profile?.isPremium 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-slate-700 text-slate-300'
                      }`}>
                        {profile?.isPremium ? 'Premium' : 'Free'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Email</span>
                      <span className="text-slate-300">{profile?.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Profile Modal */}
      {editMode && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Edit Profile</h2>
              <button
                onClick={() => setEditMode(false)}
                className="text-slate-400 hover:text-white"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleEditProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={editData.username}
                  onChange={(e) =>
                    setEditData({ ...editData, username: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  rows="3"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;