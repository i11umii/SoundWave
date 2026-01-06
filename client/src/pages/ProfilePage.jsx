import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';

const ProfilePage = () => {
  const auth = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ username: '', bio: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    console.log('ProfilePage: mount');
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    console.log('ProfilePage: fetchProfileData start');

    setLoading(true);
    setError('');

    try {
      const res = await userAPI.getProfile();

      let data = null;
      if (res && res.data && res.data.data) {
        data = res.data.data;
      }

      setProfile(data);

      if (data) {
        setEditData({
          username: data.username,
          bio: data.bio || '',
        });
      }

      console.log('ProfilePage: profile loaded');
    } catch (err) {
      console.log(err);
      setError('Unable to load profile data');
    } finally {
      setLoading(false);
      console.log('ProfilePage: fetchProfileData end');
    }
  };

  const handleOpenEdit = () => {
    console.log('ProfilePage: open edit modal');
    setEditMode(true);
  };

  const handleCloseEdit = () => {
    console.log('ProfilePage: close edit modal');
    setEditMode(false);
  };

  const handleUsernameChange = (e) => {
    const next = {
      username: e.target.value,
      bio: editData.bio,
    };
    setEditData(next);
  };

  const handleBioChange = (e) => {
    const next = {
      username: editData.username,
      bio: e.target.value,
    };
    setEditData(next);
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();

    console.log('ProfilePage: save profile');

    setSaving(true);

    try {
      const res = await userAPI.updateProfile(editData);

      let updated = null;
      if (res && res.data && res.data.data) {
        updated = res.data.data;
      }

      if (updated) {
        setProfile((prev) => {
          if (!prev) {
            return updated;
          }
          return {
            ...prev,
            ...updated,
          };
        });

        auth.updateUser(updated);
      }

      setEditMode(false);
    } catch (err) {
      console.log(err);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    let name = 'SW';
    if (profile && profile.username) {
      name = profile.username;
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getMemberSinceYear = () => {
    if (profile && profile.createdAt) {
      return new Date(profile.createdAt).getFullYear();
    }
    return 2024;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-400" />
      </div>
    );
  }

  let errorBlock = null;
  if (error) {
    errorBlock = (
      <div className="max-w-5xl mx-auto px-8 pt-8">
        <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      </div>
    );
  }

  let stats = {
    hoursListened: 0,
    newArtistsDiscovered: 0,
    earlyListens: 0,
    playlistsCount: 0,
  };

  if (profile && profile.stats) {
    stats = profile.stats;
  }

  let usernameText = '';
  if (profile && profile.username) {
    usernameText = profile.username;
  }

  let bioText = '';
  if (profile && profile.bio) {
    bioText = profile.bio;
  } else {
    bioText = `Music lover. Member since ${getMemberSinceYear()}.`;
  }

  let trendsetterBlock = null;
  if (stats.earlyListens > 0) {
    trendsetterBlock = (
      <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 neon-glow mb-4">
        <i className="fas fa-gem text-white"></i>
        <span className="text-white font-semibold text-sm tracking-wide">TRENDSETTER</span>
      </div>
    );
  }

  let editModalBlock = null;
  if (editMode) {
    let saveText = 'Save Changes';
    if (saving) {
      saveText = 'Saving...';
    }

    editModalBlock = (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
          <form onSubmit={handleEditProfile} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Username</label>
              <input
                type="text"
                value={editData.username}
                onChange={handleUsernameChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-violet-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Bio</label>
              <textarea
                value={editData.bio}
                onChange={handleBioChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-violet-500 focus:outline-none"
                rows="3"
                placeholder="Tell something about yourself..."
              />
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={handleCloseEdit}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
              >
                {saveText}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto pb-32">
          {errorBlock}

          <div className="max-w-5xl mx-auto px-8 py-12">
            <div className="flex items-start gap-8 mb-12">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 neon-glow flex items-center justify-center flex-shrink-0">
                <span className="text-4xl font-bold text-white">{getInitials()}</span>
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-3 text-white">{usernameText}</h1>

                {trendsetterBlock}

                <p className="text-gray-400 text-sm leading-relaxed max-w-2xl mb-4">{bioText}</p>
                <button
                  onClick={handleOpenEdit}
                  className="px-6 py-2 rounded-full border border-violet-500 text-violet-400 hover:bg-violet-500 hover:text-white transition-all text-sm font-medium"
                >
                  <i className="fas fa-edit mr-2" /> Edit Profile
                </button>
              </div>
            </div>

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

      {editModalBlock}
    </div>
  );
};

export default ProfilePage;
