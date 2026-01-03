import React, { useState, useEffect } from 'react';
import { userAPI } from '../utils/api';
import { usePlayer } from '../contexts/PlayerContext';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import TrackItem from '../components/TrackItem';

const LikedSongsPage = () => {
  const { setCurrentTrack, setPlaylist, play } = usePlayer();
  const [likedTracks, setLikedTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLikedTracks();
  }, []);

  const fetchLikedTracks = async () => {
    try {
      const response = await userAPI.getLikedTracks();
      setLikedTracks(response.data.data || []);
    } catch (error) {
      console.error('Error fetching liked tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = (track) => {
    setPlaylist(likedTracks);
    setCurrentTrack(track);
    play();
  };

  const handlePlayAll = () => {
    if (!likedTracks.length) return;
    setPlaylist(likedTracks);
    setCurrentTrack(likedTracks[0]);
    play();
  };

  const getTotalDuration = () => {
    return likedTracks.reduce((total, track) => total + (track.duration || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-400" />
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
          <div className="px-8 py-10 bg-gradient-to-b from-purple-900/80 via-gray-900 to-gray-900 border-b border-gray-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
              <div className="w-40 h-40 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl neon-glow">
                <i className="fas fa-heart text-white text-6xl" />
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                  Playlist
                </p>
                <h1 className="text-5xl font-bold mb-3">Liked Songs</h1>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-300">
                  <span className="text-white font-medium">Your collection</span>
                  <span>•</span>
                  <span>{likedTracks.length} songs</span>
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
              disabled={!likedTracks.length}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-sm font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              <i className="fas fa-play" />
              <span>Play</span>
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <i className="fas fa-ellipsis-h text-xl" />
            </button>
          </div>

          {/* Tracks List */}
          <div className="px-8 py-6">
            {likedTracks.length === 0 ? (
              <div className="text-center py-16 bg-gray-900/70 border border-gray-800 rounded-2xl">
                <i className="fas fa-heart text-6xl text-gray-700 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No liked songs yet</h3>
                <p className="text-gray-400">
                  Start liking songs to see them here.
                </p>
              </div>
            ) : (
              <>
                  {/* Table header */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs text-gray-400 uppercase tracking-wider border-b border-gray-800 mb-2">
                  <div className="col-span-1">#</div>
                  <div className="col-span-5">Title</div>
                  <div className="col-span-3">Album</div>
                  <div className="col-span-2">Genre</div>
                  <div className="col-span-1 text-right">
                      <i className="far fa-clock" />
                  </div>
                </div>

                  {/* Track items */}
                <div className="space-y-1">
                  {likedTracks.map((track, index) => (
                    <TrackItem
                      key={track._id}
                      track={track}
                      index={index}
                      onPlay={() => handlePlayTrack(track)}
                      showAlbum={true}
                      showArtist={true}
                      isLiked={true}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LikedSongsPage;