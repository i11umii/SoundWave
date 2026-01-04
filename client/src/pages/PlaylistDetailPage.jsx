import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { playlistAPI, userAPI } from '../utils/api';
import { usePlayer } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext'; // Import Auth
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import TrackItem from '../components/TrackItem';

const PlaylistDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Get current user
  const { setCurrentTrack, setPlaylist: setPlayerPlaylist, play } = usePlayer();

  const [playlist, setPlaylist] = useState(null);
  const [likedTrackIds, setLikedTrackIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false); // Menu state for playlist options

  useEffect(() => {
    fetchPlaylist();
    fetchLikedTracks();
  }, [id]);

  const fetchPlaylist = async () => {
    try {
      const response = await playlistAPI.getById(id);
      setPlaylist(response.data.data || null);
    } catch (error) {
      console.error('Error fetching playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedTracks = async () => {
    try {
      const response = await userAPI.getLikedTracks();
      setLikedTrackIds(response.data.data.map((t) => t._id));
    } catch (error) {
      console.error('Error fetching liked tracks:', error);
    }
  };

  const handlePlayAll = () => {
    if (!playlist?.tracks || playlist.tracks.length === 0) return;
    const tracks = playlist.tracks.map((t) => t.track).filter(Boolean);
    if (tracks.length === 0) return;
    setPlayerPlaylist(tracks);
    setCurrentTrack(tracks[0]);
    play();
  };

  const handlePlayTrack = (track) => {
    if (!playlist?.tracks) return;
    const tracks = playlist.tracks.map((t) => t.track).filter(Boolean);
    setPlayerPlaylist(tracks);
    setCurrentTrack(track);
    play();
  };

  // --- NEW ACTIONS ---
  const handleDeletePlaylist = async () => {
    if (!window.confirm("Are you sure you want to delete this playlist?")) return;
    try {
      await playlistAPI.delete(id);
      navigate('/playlists');
    } catch (err) {
      alert("Error deleting playlist");
    }
  };

  const handleRemoveTrack = async (trackId) => {
    try {
      await playlistAPI.removeTrack(id, trackId);
      // Update local state to remove track instantly
      setPlaylist(prev => ({
        ...prev,
        tracks: prev.tracks.filter(t => t.track._id !== trackId)
      }));
    } catch (err) {
      console.error("Error removing track:", err);
    }
  };

  const getTotalDuration = () => {
    if (!playlist?.tracks) return 0;
    return playlist.tracks.reduce((sum, item) => sum + (item.track?.duration || 0), 0);
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-900"><i className="fas fa-spinner fa-spin text-4xl text-blue-400" /></div>;
  if (!playlist) return <div className="flex h-screen items-center justify-center bg-gray-900 text-gray-400">Playlist not found</div>;

  const totalDuration = getTotalDuration();
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);
  const isOwner = user && playlist.user && (user.id === playlist.user._id || user.id === playlist.user);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />

        <main className="flex-1 overflow-y-auto pb-32">
          {/* Header */}
          <div className="px-8 py-10 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-900 border-b border-gray-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
              <div className={`w-40 h-40 rounded-xl bg-gradient-to-br from-${playlist.color}-500 to-${playlist.color}-700 flex items-center justify-center shadow-2xl neon-glow`}>
                <i className={`fas ${playlist.icon} text-white text-5xl`} />
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Playlist</p>
                <h1 className="text-5xl font-bold mb-3 text-white">{playlist.name}</h1>
                <p className="text-gray-300 text-sm mb-4">{playlist.description || 'No description'}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-400">
                  <span className="text-white font-medium">{playlist.user?.username || 'You'}</span>
                  <span>•</span>
                  <span>{playlist.tracks?.length || 0} songs</span>
                  {totalDuration > 0 && <><span>•</span><span>{hours > 0 && `${hours} hr `}{minutes} min</span></>}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="px-8 py-6 bg-gray-900/80 border-b border-gray-800 flex flex-wrap items-center gap-4 relative">
            <button onClick={handlePlayAll} disabled={!playlist.tracks || playlist.tracks.length === 0} className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-sm font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2">
              <i className="fas fa-play" /> <span>Play</span>
            </button>

            {isOwner && (
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="text-gray-400 hover:text-white transition-colors p-2">
                  <i className="fas fa-ellipsis-h text-xl" />
                </button>
                {showMenu && (
                  <div className="absolute left-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
                    <button onClick={handleDeletePlaylist} className="w-full text-left px-4 py-3 text-red-400 hover:bg-gray-800 rounded-lg flex items-center gap-2">
                      <i className="fas fa-trash" /> Delete Playlist
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tracks */}
          <div className="px-8 py-6">
            {!playlist.tracks || playlist.tracks.length === 0 ? (
              <div className="text-center py-16 bg-gray-900/70 border border-gray-800 rounded-2xl">
                <i className="fas fa-music text-6xl text-gray-700 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No tracks in this playlist</h3>
                <p className="text-gray-400">Add some tracks to start listening.</p>
              </div>
            ) : (
                <div className="space-y-1">
                  {playlist.tracks.map((item, index) => {
                    const track = item.track;
                    if (!track) return null;
                  return (
                    <TrackItem
                      key={`${track._id}-${index}`}
                      track={track}
                      index={index}
                      onPlay={() => handlePlayTrack(track)}
                      showAlbum={true}
                      showArtist={true}
                      isLiked={likedTrackIds.includes(track._id)}
                      onRemoveFromPlaylist={isOwner ? () => handleRemoveTrack(track._id) : null}
                    />
                  );
                })}
                </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PlaylistDetailPage;