import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playlistAPI, trackAPI, userAPI } from '../utils/api';
import { usePlayer } from '../contexts/PlayerContext';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import TrackItem from '../components/TrackItem';

const HomePage = () => {
  const navigate = useNavigate();
  const player = usePlayer();

  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('HomePage: mount');
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    console.log('HomePage: fetchHomeData start');
    setLoading(true);

    let playlists = [];
    let recs = [];
    let recent = [];

    try {
      const playlistsRes = await playlistAPI.getAll();
      if (playlistsRes && playlistsRes.data && playlistsRes.data.data) {
        playlists = playlistsRes.data.data;
      }
      console.log('HomePage: playlists loaded', playlists.length);
    } catch (error) {
      console.log(error);
    }

    try {
      const recsRes = await trackAPI.getRecommendations();
      if (recsRes && recsRes.data && recsRes.data.data) {
        recs = recsRes.data.data;
      }
      console.log('HomePage: recommendations loaded', recs.length);
    } catch (error) {
      console.log(error);
    }

    try {
      const recentRes = await userAPI.getRecentlyPlayed();
      if (recentRes && recentRes.data && recentRes.data.data) {
        recent = recentRes.data.data;
      }
      console.log('HomePage: recently played loaded', recent.length);
    } catch (error) {
      console.log(error);
    }

    const featured = playlists.slice(0, 4);
    const recentShort = recent.slice(0, 5);

    setFeaturedPlaylists(featured);
    setRecommendations(recs);
    setRecentlyPlayed(recentShort);

    setLoading(false);
    console.log('HomePage: fetchHomeData end');
  };

  const handlePlayTrack = (track, list) => {
    console.log('HomePage: handlePlayTrack', track ? track._id : null);

    let nextPlaylist = [];
    if (list && list.length > 0) {
      nextPlaylist = list;
    } else {
      nextPlaylist = [track];
    }

    player.setPlaylist(nextPlaylist);
    player.setCurrentTrack(track);
    player.play();
  };

  const handleStartListening = () => {
    console.log('HomePage: handleStartListening');

    if (recommendations.length > 0) {
      handlePlayTrack(recommendations[0], recommendations);
      return;
    }

    if (recentlyPlayed.length > 0) {
      const firstItem = recentlyPlayed[0];
      if (firstItem && firstItem.track) {
        const tracks = [];
        for (let i = 0; i < recentlyPlayed.length; i += 1) {
          const item = recentlyPlayed[i];
          if (item && item.track) {
            tracks.push(item.track);
          }
        }
        handlePlayTrack(firstItem.track, tracks);
        return;
      }
    }

    navigate('/tracks');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-400" />
      </div>
    );
  }

  let recommendationsBlock = null;
  if (recommendations.length > 0) {
    recommendationsBlock = (
      <div className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden p-2">
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs text-gray-500 uppercase tracking-wider mb-2">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5">Title</div>
          <div className="col-span-3">Album</div>
          <div className="col-span-2">Genre</div>
          <div className="col-span-1 text-right"><i className="far fa-clock"></i></div>
        </div>

        <div className="space-y-1">
          {recommendations.map((track, index) => (
            <TrackItem
              key={track._id}
              track={track}
              index={index}
              onPlay={() => handlePlayTrack(track, recommendations)}
              showAlbum={true}
              showArtist={true}
              showMenu={true}
            />
          ))}
        </div>
      </div>
    );
  } else {
    recommendationsBlock = (
      <div className="text-center py-10 text-gray-400 bg-gray-800/30 rounded-xl">
        <p>Listen to more music to get recommendations!</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-all"
              >
                <i className="fas fa-chevron-left text-gray-400"></i>
              </button>
              <button
                onClick={() => window.history.forward()}
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-all"
              >
                <i className="fas fa-chevron-right text-gray-400"></i>
              </button>
            </div>
            <TopNav />
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="px-8 py-8 pb-32">
            <section className="mb-12">
              <div className="relative rounded-2xl overflow-hidden gradient-blue p-12 h-80 flex items-center shadow-2xl">
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-[100px]" />
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-[100px]" />
                </div>
                <div className="relative z-10 max-w-2xl">
                  <h2 className="text-6xl font-black mb-4 text-white tracking-tight">Discover New Vibes</h2>
                  <p className="text-xl text-blue-100 mb-8 font-light">
                    We picked {recommendations.length} tracks just for you.
                  </p>
                  <button
                    onClick={handleStartListening}
                    className="px-8 py-4 bg-white text-gray-900 rounded-full font-bold hover:scale-105 transition-all shadow-xl flex items-center gap-2"
                  >
                    <i className="fas fa-play" /> Start Listening
                  </button>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <i className="fas fa-magic text-purple-400"></i>
                <span>Recommended for You</span>

                <span className="relative group">
                  <span
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-gray-500 text-xs text-gray-300 cursor-default select-none"
                    aria-label="How recommendations work"
                  >
                    ?
                  </span>

                  <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-80 -translate-x-1/2 rounded-lg border border-gray-700 bg-black/90 p-3 text-sm font-normal text-gray-200 opacity-0 group-hover:opacity-100 transition">
                    <span className="font-semibold block mb-1">How recommendations work</span>
                    <span className="text-gray-300 block">
                      Recommendations are based on your listening history, liked tracks, and what you play most often.
                      To get different tracks, try:
                    </span>
                    <ul className="mt-2 list-disc pl-5 text-gray-300">
                      <li>listening to a few new artists/genres to the end,</li>
                      <li>liking tracks outside your usual style,</li>
                      <li>skipping tracks you don’t want more of,</li>
                      <li>adding new tracks to playlists and playing them a few times.</li>
                    </ul>
                  </span>
                </span>
              </h3>

              {recommendationsBlock}
            </section>


            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Your Playlists</h3>
                <button
                  onClick={() => navigate('/playlists')}
                  className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-all"
                >
                  See all
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredPlaylists.map((pl) => (
                  <div
                    key={pl._id}
                    className="card-hover bg-gray-800/40 rounded-xl p-5 border border-gray-700/50 cursor-pointer"
                    onClick={() => navigate(`/playlists/${pl._id}`)}
                  >
                    <div className={`w-full aspect-square rounded-lg mb-4 flex items-center justify-center bg-gradient-to-br from-${pl.color}-500 to-${pl.color}-700`}>
                      <i className={`fas ${pl.icon} text-white text-4xl`} />
                    </div>
                    <h4 className="font-bold text-white mb-1 truncate">{pl.name}</h4>
                    <p className="text-xs text-gray-400 truncate">{pl.tracks.length} tracks</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Jump Back In</h3>
                <button
                  onClick={() => navigate('/recently-played')}
                  className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-all"
                >
                  History
                </button>
              </div>
              <div className="space-y-1">
                {recentlyPlayed.map((item, idx) => {
                  const track = item.track;
                  if (!track) {
                    return null;
                  }

                  return (
                    <TrackItem
                      key={`${track._id}-${idx}`}
                      track={track}
                      index={idx}
                      onPlay={() => handlePlayTrack(track)}
                      showMenu={true}
                    />
                  );
                })}
              </div>
            </section>
          </div>
        </main>
      </div>
      <style>{`.gradient-blue { background: linear-gradient(135deg, #1e3a8a 0%, #7e22ce 100%); }`}</style>
    </div>
  );
};

export default HomePage;
