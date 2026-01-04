import React, { useState, useEffect } from 'react';
import { userAPI } from '../utils/api';
import { usePlayer } from '../contexts/PlayerContext';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import TrackItem from '../components/TrackItem';

const LikedSongsPage = () => {
  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setCurrentTrack, setPlaylist, play } = usePlayer();

  useEffect(() => {
    fetchLikedSongs();

    // ЕДИНСТВЕННЫЙ ИСТОЧНИК ПРАВДЫ - СОБЫТИЕ
    const handleLikeChange = (e) => {
      const { track, isLiked } = e.detail;

      if (!isLiked) {
        // Если где-то (даже здесь) убрали лайк -> удаляем из списка
        setLikedSongs(prev => prev.filter(t => t._id !== track._id));
      } else {
        // Если где-то (в плеере) поставили лайк -> добавляем в список
        setLikedSongs(prev => {
          if (prev.find(t => t._id === track._id)) return prev;
          return [track, ...prev];
        });
      }
    };

    window.addEventListener('like-change', handleLikeChange);
    return () => window.removeEventListener('like-change', handleLikeChange);
  }, []);

  const fetchLikedSongs = async () => {
    try {
      const res = await userAPI.getLikedTracks();
      setLikedSongs(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = (track) => {
    setPlaylist(likedSongs);
    setCurrentTrack(track);
    play();
  };

  const handlePlayAll = () => {
    if (likedSongs.length > 0) {
      setPlaylist(likedSongs);
      setCurrentTrack(likedSongs[0]);
      play();
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-900"><i className="fas fa-spinner fa-spin text-4xl text-blue-400" /></div>;

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto pb-32">

          <div className="px-8 py-10 bg-gradient-to-b from-purple-900/50 to-gray-900 border-b border-gray-800">
            <div className="flex items-end gap-6">
              <div className="w-40 h-40 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl neon-glow">
                <i className="fas fa-heart text-white text-6xl"></i>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Playlist</p>
                <h1 className="text-5xl font-bold mb-4 text-white">Liked Songs</h1>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-white font-medium">You</span>
                  <span>•</span>
                  <span>{likedSongs.length} songs</span>
                </div>
              </div>
            </div>
          </div>

          {likedSongs.length > 0 && (
            <div className="px-8 py-6 bg-gray-900/80 sticky top-0 z-10 backdrop-blur-md border-b border-gray-800">
              <button onClick={handlePlayAll} className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white hover:scale-105 transition-all shadow-lg">
                <i className="fas fa-play text-xl ml-1" />
              </button>
            </div>
          )}

          <div className="px-8 py-6">
            {likedSongs.length === 0 ? (
              <div className="text-center py-20">
                <i className="far fa-heart text-6xl text-gray-700 mb-4"></i>
                <p className="text-gray-400 text-lg">You haven't liked any songs yet.</p>
              </div>
            ) : (
                <div className="space-y-1">
                  {likedSongs.map((track, index) => (
                    <TrackItem
                    key={track._id}
                    track={track}
                    index={index}
                    onPlay={() => handlePlayTrack(track)}
                    isLiked={true}
                    // УБРАЛИ onLikeToggle - теперь работает через window.event
                    />
                ))}
                </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LikedSongsPage;