import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user: authUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for editing
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ username: '', bio: '' });
  const [saving, setSaving] = useState(false); // New state for saving spinner

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getProfile();
      const data = res.data.data;
      setProfile(data);
      setEditData({ username: data.username, bio: data.bio || '' });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Unable to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userAPI.updateProfile(editData);

      // Обновляем локальный стейт
      setProfile(prev => ({ ...prev, ...res.data.data }));
      // Обновляем глобальный стейт (чтобы в шапке имя поменялось)
      updateUser(res.data.data);

      setEditMode(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => (profile?.username || 'SW').substring(0, 2).toUpperCase();
  const getMemberSinceYear = () => profile?.createdAt ? new Date(profile.createdAt).getFullYear() : 2024;

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-900"><i className="fas fa-spinner fa-spin text-4xl text-blue-400" /></div>;

  const stats = profile?.stats || { hoursListened: 0, newArtistsDiscovered: 0, earlyListens: 0, playlistsCount: 0 };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto pb-32">
          <div className="max-w-5xl mx-auto px-8 py-12">

            {/* Header */}
            <div className="flex items-start gap-8 mb-12">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 neon-glow flex items-center justify-center flex-shrink-0">
                <span className="text-4xl font-bold text-white">{getInitials()}</span>
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-3 text-white">{profile?.username}</h1>

                {stats.earlyListens > 0 && (
                  <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 neon-glow mb-4">
                    <i className="fas fa-gem text-white"></i>
                    <span className="text-white font-semibold text-sm tracking-wide">TRENDSETTER</span>
                  </div>
                )}

                <p className="text-gray-400 text-sm leading-relaxed max-w-2xl mb-4">
                  {profile?.bio || `Music lover. Member since ${getMemberSinceYear()}.`}
                </p>
                <button onClick={() => setEditMode(true)} className="px-6 py-2 rounded-full border border-violet-500 text-violet-400 hover:bg-violet-500 hover:text-white transition-all text-sm font-medium">
                  <i className="fas fa-edit mr-2" /> Edit Profile
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-violet-600 transition-all">
                <div className="text-3xl font-bold text-violet-400 mb-2">{stats.newArtistsDiscovered}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Artists Discovered</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-fuchsia-600 transition-all">
                <div className="text-3xl font-bold text-fuchsia-400 mb-2">{stats.hoursListened}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Hours Listened</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-pink-600 transition-all">
                <div className="text-3xl font-bold text-pink-400 mb-2">{stats.earlyListens}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Trendsetter Badges</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-cyan-600 transition-all">
                <div className="text-3xl font-bold text-cyan-400 mb-2">{stats.playlistsCount}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Playlists Created</div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/recently-played" className="card-hover bg-gray-900 border border-gray-800 rounded-xl p-6 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <i className="fas fa-clock text-white text-xl" />
                  </div>
                  <i className="fas fa-arrow-right text-gray-500 group-hover:text-gray-200 transition-all" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Recently Played</h3>
                <p className="text-sm text-gray-400">Browse your listening history</p>
              </Link>
              <Link to="/liked-songs" className="card-hover bg-gray-900 border border-gray-800 rounded-xl p-6 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center">
                    <i className="fas fa-heart text-white text-xl" />
                  </div>
                  <i className="fas fa-arrow-right text-gray-500 group-hover:text-gray-200 transition-all" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Liked Songs</h3>
                <p className="text-sm text-gray-400">All your favorites in one place</p>
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      {editMode && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            <form onSubmit={handleEditProfile} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Username</label>
                <input
                  type="text"
                  value={editData.username} 
                  onChange={(e) => setEditData(p => ({ ...p, username: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-violet-500 focus:outline-none"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Bio</label>
                <textarea
                  value={editData.bio} 
                  onChange={(e) => setEditData(p => ({ ...p, bio: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-violet-500 focus:outline-none"
                  rows="3" 
                  placeholder="Tell something about yourself..."
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setEditMode(false)} className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors">Cancel</button>
                <button
                  type="submit" 
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
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