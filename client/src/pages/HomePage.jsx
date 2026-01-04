import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackAPI, playlistAPI, userAPI } from '../utils/api';
import { usePlayer } from '../contexts/PlayerContext';
import { formatTime } from '../utils/helpers';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import TrackItem from '../components/TrackItem';

const HomePage = () => {
  const navigate = useNavigate();
  const { setCurrentTrack, setPlaylist, play } = usePlayer();

  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [playlistsRes, recsRes, recentRes] = await Promise.all([
        playlistAPI.getAll().catch(() => ({ data: { data: [] } })),
        trackAPI.getRecommendations().catch(() => ({ data: { data: [] } })),
        userAPI.getRecentlyPlayed().catch(() => ({ data: { data: [] } })),
      ]);

      setFeaturedPlaylists((playlistsRes.data?.data || []).slice(0, 4));
      setRecommendations(recsRes.data?.data || []);
      setRecentlyPlayed((recentRes.data?.data || []).slice(0, 5));
    } catch (err) {
      console.error('Error fetching home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = (track, list) => {
    const playlist = list && list.length ? list : [track];
    setPlaylist(playlist);
    setCurrentTrack(track);
    play();
  };

  const handleStartListening = () => {
    if (recommendations.length > 0) {
      handlePlayTrack(recommendations[0], recommendations);
    } else if (recentlyPlayed.length > 0) {
      handlePlayTrack(recentlyPlayed[0].track, recentlyPlayed.map(i => i.track));
    } else {
      navigate('/tracks');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-400" />
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
              <button onClick={() => window.history.back()} className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-all"><i className="fas fa-chevron-left text-gray-400"></i></button>
              <button onClick={() => window.history.forward()} className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-all"><i className="fas fa-chevron-right text-gray-400"></i></button>
            </div>
            <TopNav />
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="px-8 py-8 pb-32">

            {/* HERO */}
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
                  <button onClick={handleStartListening} className="px-8 py-4 bg-white text-gray-900 rounded-full font-bold hover:scale-105 transition-all shadow-xl flex items-center gap-2">
                    <i className="fas fa-play" /> Start Listening
                  </button>
                </div>
              </div>
            </section>

            {/* RECOMMENDED TRACKS (LIST VIEW) */}
            <section className="mb-12">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <i className="fas fa-magic text-purple-400"></i> Recommended for You
              </h3>

              {recommendations.length > 0 ? (
                <div className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden p-2">
                  {/* Table Header (Optional, looks nice) */}
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
                        showMenu={true} // Меню с тремя точками будет работать
                      />
                      ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400 bg-gray-800/30 rounded-xl">
                  <p>Listen to more music to get recommendations!</p>
                </div>
              )}
            </section>

            {/* FEATURED PLAYLISTS */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Your Playlists</h3>
                <button onClick={() => navigate('/playlists')} className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-all">See all</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredPlaylists.map((pl) => (
                  <div key={pl._id} className="card-hover bg-gray-800/40 rounded-xl p-5 border border-gray-700/50 cursor-pointer" onClick={() => navigate(`/playlists/${pl._id}`)}>
                    <div className={`w-full aspect-square rounded-lg mb-4 flex items-center justify-center bg-gradient-to-br from-${pl.color}-500 to-${pl.color}-700`}>
                      <i className={`fas ${pl.icon} text-white text-4xl`} />
                    </div>
                    <h4 className="font-bold text-white mb-1 truncate">{pl.name}</h4>
                    <p className="text-xs text-gray-400 truncate">{pl.tracks.length} tracks</p>
                  </div>
                ))}
              </div>
            </section>

            {/* RECENTLY PLAYED */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Jump Back In</h3>
                <button onClick={() => navigate('/recently-played')} className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-all">History</button>
              </div>
              <div className="space-y-1">
                {recentlyPlayed.map((item, idx) => {
                    const track = item.track;
                  if (!track) return null;
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