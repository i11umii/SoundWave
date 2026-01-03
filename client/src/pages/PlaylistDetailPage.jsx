import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { playlistAPI, userAPI } from '../utils/api';
import { usePlayer } from '../contexts/PlayerContext';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import TrackItem from '../components/TrackItem';

const PlaylistDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setCurrentTrack, setPlaylist: setPlayerPlaylist, play } = usePlayer();

  const [playlist, setPlaylist] = useState(null);
  const [likedTrackIds, setLikedTrackIds] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getTotalDuration = () => {
    if (!playlist?.tracks) return 0;
    return playlist.tracks.reduce((sum, item) => sum + (item.track?.duration || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-400" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-gray-400">
        <div className="text-center">
          <i className="fas fa-exclamation-circle text-6xl mb-4" />
          <p className="mb-4">Playlist not found</p>
          <button
            onClick={() => navigate('/playlists')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
          >
            Back to Playlists
          </button>
        </div>
      </div>
    );
  }

  const totalDuration = getTotalDuration();
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />

        <main className="flex-1 overflow-y-auto pb-32">
          {/* Header */}
          <div className="px-8 py-10 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-900 border-b border-gray-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
              <div
                className={`w-40 h-40 rounded-xl bg-gradient-to-br from-${playlist.color}-500 to-${playlist.color}-700 flex items-center justify-center shadow-2xl neon-glow`}
              >
                <i className={`fas ${playlist.icon} text-white text-5xl`} />
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                  Playlist
                </p>
                <h1 className="text-5xl font-bold mb-3 text-white">
                  {playlist.name}
                </h1>
                <p className="text-gray-300 text-sm mb-4">
                  {playlist.description || 'No description'}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-400">
                  <span className="text-white font-medium">
                    {playlist.user?.username || 'You'}
                  </span>
                  <span>•</span>
                  <span>{playlist.tracks?.length || 0} songs</span>
                  {totalDuration > 0 && (
                    <>
                      <span>•</span>
                      <span>
                        {hours > 0 && `${hours} hr `}
                        {minutes} min
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="px-8 py-6 bg-gray-900/80 border-b border-gray-800 flex flex-wrap items-center gap-4">
            <button
              onClick={handlePlayAll}
              disabled={!playlist.tracks || playlist.tracks.length === 0}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-sm font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              <i className="fas fa-play" />
              <span>Play</span>
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <i className="fas fa-heart text-xl" />
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <i className="fas fa-ellipsis-h text-xl" />
            </button>
          </div>

          {/* Tracks */}
          <div className="px-8 py-6">
            {!playlist.tracks || playlist.tracks.length === 0 ? (
              <div className="text-center py-16 bg-gray-900/70 border border-gray-800 rounded-2xl">
                <i className="fas fa-music text-6xl text-gray-700 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No tracks in this playlist</h3>
                <p className="text-gray-400">
                  Add some tracks to start listening.
                </p>
              </div>
            ) : (
              <>
                  {/* Header row */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs text-gray-400 uppercase tracking-wider border-b border-gray-800 mb-2">
                  <div className="col-span-1">#</div>
                  <div className="col-span-5">Title</div>
                  <div className="col-span-3">Album</div>
                  <div className="col-span-2">Genre</div>
                  <div className="col-span-1 text-right">
                      <i className="far fa-clock" />
                  </div>
                </div>

                  {/* Track list */}
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
                      />
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PlaylistDetailPage;