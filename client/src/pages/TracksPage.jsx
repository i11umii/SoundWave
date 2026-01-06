import React, { useEffect, useState } from 'react';
import { trackAPI, userAPI } from '../utils/api';
import { usePlayer } from '../contexts/PlayerContext';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import TrackItem from '../components/TrackItem';

function TracksPage() {
  const player = usePlayer();

  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadTracks() {
    // загружаем список треков с сервера
    console.log('TracksPage: loadTracks start');
    setLoading(true);

    try {
      const response = await trackAPI.getAll();

      let list = [];
      if (response && response.data && response.data.data) {
        list = response.data.data;
      }

      setTracks(list);
      console.log('TracksPage: loadTracks success', list.length);
    } catch (error) {
      console.log(error);
      setTracks([]);
    } finally {
      setLoading(false);
      console.log('TracksPage: loadTracks end');
    }
  }

  useEffect(() => {
    console.log('TracksPage: mount');
    loadTracks();
  }, []);

  async function handlePlayTrack(track, index) {
    // запускаем трек и подставляем плейлист целиком
    console.log('TracksPage: handlePlayTrack', index, track ? track._id : null);

    if (!track) {
      return;
    }

    player.setPlaylist(tracks);
    player.setCurrentTrack(track);
    player.play(track);
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-400" />
      </div>
    );
  }

  let contentBlock = null;
  if (!tracks || tracks.length === 0) {
    contentBlock = (
      <div className="text-center py-12 text-gray-400">
        No tracks found
      </div>
    );
  } else {
    contentBlock = (
      <div className="space-y-1">
        {tracks.map((track, index) => (
          <TrackItem
            key={track._id}
            track={track}
            index={index}
            onPlay={handlePlayTrack}
            showAlbum={true}
            showArtist={true}
            showMenu={true}
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
          <div className="px-8 py-10 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-900 border-b border-gray-800">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">Tracks</h1>
            <p className="text-gray-400 text-sm">All available songs</p>
          </div>

          <div className="px-4 py-6">{contentBlock}</div>
        </main>
      </div>
    </div>
  );
}

export default TracksPage;
