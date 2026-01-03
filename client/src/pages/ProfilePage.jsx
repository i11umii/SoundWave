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

  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    bio: '',
  });

  const [error, setError] = useState('');

  // Early Adopter artists (mock data - можно заменить на реальные данные с API)
  const [earlyArtists, setEarlyArtists] = useState([
    {
      id: 1,
      name: 'Neon Pulse',
      genre: 'Electronic / Synthwave',
      listenerNumber: 47,
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop'
    },
    {
      id: 2,
      name: 'Cyber Dreams',
      genre: 'Ambient / Chillwave',
      listenerNumber: 152,
      imageUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop'
    },
    {
      id: 3,
      name: 'Retro Future',
      genre: 'Synthpop / Vaporwave',
      listenerNumber: 89,
      imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=400&fit=crop'
    },
  ]);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await userAPI.getProfile().catch(() => null);
      const p = res?.data?.data || authUser || null;

      if (!p) {
        setError('Unable to load profile data');
      }

      setProfile(p);
      setEditData({
        username: p?.username || '',
        bio: p?.bio || '',
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Unable to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await userAPI.updateProfile(editData);
      setProfile(res.data.data);
      updateUser(res.data.data);
      setEditMode(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const getInitials = () => {
    const name = profile?.username || authUser?.username || 'SW';
    return name.substring(0, 2).toUpperCase();
  };

  const getMemberSinceYear = () => {
    const dt = profile?.createdAt || authUser?.createdAt;
    if (!dt) return '';
    return new Date(dt).getFullYear();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-400" />
      </div>
    );
  }

  if (!profile && authUser) {
    setProfile(authUser);
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />

        <main className="flex-1 overflow-y-auto pb-32">
          <div className="max-w-5xl mx-auto px-8 py-12">
            {/* Profile Header */}
            <div className="flex items-start gap-8 mb-12">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 neon-glow flex items-center justify-center flex-shrink-0">
                <span className="text-4xl font-bold text-white">{getInitials()}</span>
              </div>

              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-3 text-white">
                  {profile?.username || authUser?.username || 'synthwave_dreamer'}
                </h1>

                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 neon-glow mb-4">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <span className="text-white font-semibold text-sm tracking-wide">EARLY ADOPTER</span>
                </div>

                <p className="text-gray-400 text-sm leading-relaxed max-w-2xl mb-4">
                  {profile?.bio || 'Member since ' + getMemberSinceYear() + ' • Exploring the depths of electronic music and discovering emerging artists before they hit mainstream.'}
                </p>

                <button
                  onClick={() => setEditMode(true)}
                  className="px-6 py-2 rounded-full border border-violet-500 text-violet-400 hover:bg-violet-500 hover:text-white transition-all text-sm font-medium"
                >
                  <i className="fas fa-edit mr-2" />
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4 mb-12">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-violet-600 transition-all">
                <div className="text-3xl font-bold text-violet-400 mb-2">
                  {profile?.newArtistsDiscovered || 247}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  New Artists Discovered
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-fuchsia-600 transition-all">
                <div className="text-3xl font-bold text-fuchsia-400 mb-2">
                  {profile?.hoursListened || '1,842'}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Hours Listened
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-pink-600 transition-all">
                <div className="text-3xl font-bold text-pink-400 mb-2">
                  {profile?.earlyListens || 89}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Early Listens
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-cyan-600 transition-all">
                <div className="text-3xl font-bold text-cyan-400 mb-2">
                  {profile?.playlists?.length || 34}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Playlists Created
                </div>
              </div>
            </div>

            {/* Early Listener Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Early Listener</h2>
                <p className="text-sm text-gray-500">Artists you discovered before 10K listeners</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {earlyArtists.map((artist) => (
                  <div
                    key={artist.id}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-violet-500 transition-all group cursor-pointer"
                    onClick={() => navigate(`/artist/${artist.id}`)}
                  >
                    <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 mb-4 flex items-center justify-center overflow-hidden">
                      <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-semibold text-white mb-1 group-hover:text-violet-400 transition-colors">
                      {artist.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">{artist.genre}</p>
                    <div className="flex items-center gap-2 text-xs text-violet-400">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      <span>Listener #{artist.listenerNumber}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/recently-played"
                className="card-hover bg-gray-900 border border-gray-800 rounded-xl p-6 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <i className="fas fa-clock text-white text-xl" />
                  </div>
                  <i className="fas fa-arrow-right text-gray-500 group-hover:text-gray-200 transition-all" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Recently Played</h3>
                <p className="text-sm text-gray-400">Browse your listening history</p>
              </Link>

              <Link
                to="/liked-songs"
                className="card-hover bg-gray-900 border border-gray-800 rounded-xl p-6 group"
              >
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

      {/* Edit Profile Modal */}
      {editMode && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Edit Profile</h2>
              <button
                onClick={() => setEditMode(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <i className="fas fa-times text-lg" />
              </button>
            </div>

            <form onSubmit={handleEditProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={editData.username}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={editData.bio}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      bio: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm"
                  rows="3"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg transition-colors text-sm font-semibold"
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