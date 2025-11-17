import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { trackAPI, artistAPI, playlistAPI } from '../utils/api';
import { usePlayer } from '../contexts/PlayerContext';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import TrackItem from '../components/TrackItem';

const HomePage = () => {
  const navigate = useNavigate();
  const { setCurrentTrack, setPlaylist, play } = usePlayer();
  const [recommendations, setRecommendations] = useState([]);
  const [popularTracks, setPopularTracks] = useState([]);
  const [popularArtists, setPopularArtists] = useState([]);
  const [recentPlaylists, setRecentPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [recommendationsRes, tracksRes, artistsRes, playlistsRes] = await Promise.all([
        trackAPI.getRecommendations().catch(() => ({ data: { data: [] } })),
        trackAPI.getAll(),
        artistAPI.getAll(),
        playlistAPI.getAll()
      ]);

      setRecommendations(recommendationsRes.data?.data || []);
      
      const tracks = tracksRes.data.data.sort((a, b) => b.playCount - a.playCount).slice(0, 6);
      const artists = artistsRes.data.data.sort((a, b) => b.monthlyListeners - a.monthlyListeners).slice(0, 6);
      const playlists = playlistsRes.data.data.slice(0, 4);

      setPopularTracks(tracks);
      setPopularArtists(artists);
      setRecentPlaylists(playlists);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = (track, trackList) => {
    setPlaylist(trackList);
    setCurrentTrack(track);
    play();
  };

  const handleArtistClick = (e, artistId) => {
    e.stopPropagation();
    if (artistId) {
      navigate(`/artist/${artistId}`);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />

        <main className="flex-1 overflow-y-auto pb-32">
          <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8">
            {/* Greeting */}
            <h1 className="text-3xl sm:text-4xl font-bold mb-8">{getGreeting()}</h1>

            {/* Quick Play Grid */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Made For You</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentPlaylists.map((playlist) => (
                  <Link
                    key={playlist._id}
                    to={`/playlists/${playlist._id}`}
                    className="flex items-center gap-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg overflow-hidden group transition-all"
                  >
                    <div className={`w-20 h-20 bg-gradient-to-br from-${playlist.color}-500 to-${playlist.color}-700 flex items-center justify-center flex-shrink-0`}>
                      <i className={`fas ${playlist.icon} text-white text-2xl`}></i>
                    </div>
                    <h3 className="font-semibold truncate flex-1 pr-4">{playlist.name}</h3>
                    <button className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all mr-4">
                      <i className="fas fa-play text-white ml-1"></i>
                    </button>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recommended For You */}
            {recommendations.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Recommended For You</h2>
                    <p className="text-slate-400 text-sm mt-1">
                      Based on your listening history
                    </p>
                  </div>
                </div>
                <div className="bg-slate-800/30 rounded-xl overflow-hidden">
                  {recommendations
                    .filter((track, index, self) => 
                      index === self.findIndex(t => t._id === track._id)
                    )
                    .slice(0, 10)
                    .map((track, index) => (
                      <TrackItem
                        key={track._id}
                        track={track}
                        index={index}
                        onPlay={() => handlePlayTrack(track, recommendations)}
                        showAlbum={true}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Popular Tracks */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Popular Right Now</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {popularTracks.map((track) => (
                  <div
                    key={track._id}
                    className="bg-slate-800/50 hover:bg-slate-800 rounded-lg p-4 cursor-pointer group transition-all"
                  >
                    <div 
                      className="relative mb-4"
                      onClick={() => handlePlayTrack(track, popularTracks)}
                    >
                      <img
                        src={track.imageUrl}
                        alt={track.title}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <button className="absolute bottom-2 right-2 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-xl">
                        <i className="fas fa-play text-white text-sm ml-1"></i>
                      </button>
                    </div>
                    <h3 
                      className="font-semibold mb-1 truncate cursor-pointer"
                      onClick={() => handlePlayTrack(track, popularTracks)}
                    >
                      {track.title}
                    </h3>
                    {track.artist && (
                      <button
                        onClick={(e) => handleArtistClick(e, track.artist._id)}
                        className="text-sm text-slate-400 truncate hover:text-white hover:underline transition-colors text-left w-full"
                      >
                        {track.artist.name}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Artists */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Popular Artists</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {popularArtists.map((artist) => (
                  <div
                    key={artist._id}
                    onClick={(e) => handleArtistClick(e, artist._id)}
                    className="bg-slate-800/50 hover:bg-slate-800 rounded-lg p-4 cursor-pointer group transition-all text-center"
                  >
                    <div className="relative mb-4">
                      <img
                        src={artist.imageUrl}
                        alt={artist.name}
                        className="w-full aspect-square object-cover rounded-full"
                      />
                    </div>
                    <h3 className="font-semibold mb-1 truncate">{artist.name}</h3>
                    <p className="text-sm text-slate-400">Artist</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;