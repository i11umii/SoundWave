import React, { useEffect, useState } from 'react';
import { userAPI } from '../utils/api';
import { usePlayer } from '../contexts/PlayerContext';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import TrackItem from '../components/TrackItem';

const LikedSongsPage = () => {
  const player = usePlayer();

  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('LikedSongsPage: mount');

    fetchLikedSongs();

    const handleLikeChange = (e) => {
      console.log('LikedSongsPage: like-change event');

      const detail = e.detail;
      if (!detail) {
        return;
      }

      const track = detail.track;
      const isLiked = detail.isLiked;

      if (!track || !track._id) {
        return;
      }

      if (!isLiked) {
        setLikedSongs((prev) => {
          const next = [];
          for (let i = 0; i < prev.length; i += 1) {
            const t = prev[i];
            if (t && t._id !== track._id) {
              next.push(t);
            }
          }
          return next;
        });
      } else {
        setLikedSongs((prev) => {
          for (let i = 0; i < prev.length; i += 1) {
            const t = prev[i];
            if (t && t._id === track._id) {
              return prev;
            }
          }

          const next = [track];
          for (let i = 0; i < prev.length; i += 1) {
            next.push(prev[i]);
          }
          return next;
        });
      }
    };

    window.addEventListener('like-change', handleLikeChange);

    return () => {
      window.removeEventListener('like-change', handleLikeChange);
    };
  }, []);

  const fetchLikedSongs = async () => {
    console.log('LikedSongsPage: fetchLikedSongs start');

    try {
      const res = await userAPI.getLikedTracks();

      let items = [];
      if (res && res.data && res.data.data && Array.isArray(res.data.data)) {
        items = res.data.data;
      }

      console.log('LikedSongsPage: liked tracks loaded', items.length);
      setLikedSongs(items);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      console.log('LikedSongsPage: fetchLikedSongs end');
    }
  };

  const handlePlayTrack = (track) => {
    console.log('LikedSongsPage: handlePlayTrack', track ? track._id : null);

    player.setPlaylist(likedSongs);
    player.setCurrentTrack(track);
    player.play();
  };

  const handlePlayAll = () => {
    console.log('LikedSongsPage: handlePlayAll');

    if (likedSongs.length === 0) {
      return;
    }

    player.setPlaylist(likedSongs);
    player.setCurrentTrack(likedSongs[0]);
    player.play();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-400" />
      </div>
    );
  }

  let playAllBlock = null;
  if (likedSongs.length > 0) {
    playAllBlock = (
      <div className="px-8 py-6 bg-gray-900/80 sticky top-0 z-10 backdrop-blur-md border-b border-gray-800">
        <button
          onClick={handlePlayAll}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white hover:scale-105 transition-all shadow-lg"
        >
          <i className="fas fa-play text-xl ml-1" />
        </button>
      </div>
    );
  }

  let listBlock = null;
  if (likedSongs.length === 0) {
    listBlock = (
      <div className="text-center py-20">
        <i className="far fa-heart text-6xl text-gray-700 mb-4"></i>
        <p className="text-gray-400 text-lg">You haven't liked any songs yet.</p>
      </div>
    );
  } else {
    listBlock = (
      <div className="space-y-1">
        {likedSongs.map((track, index) => (
          <TrackItem
            key={track._id}
            track={track}
            index={index}
            onPlay={() => handlePlayTrack(track)}
          />
        ))}
      </div>
    );
  }

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

          {playAllBlock}

          <div className="px-8 py-6">
            {listBlock}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LikedSongsPage;
