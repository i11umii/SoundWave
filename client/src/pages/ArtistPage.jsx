import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { artistAPI } from '../utils/api';
import { usePlayer } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import TrackItem from '../components/TrackItem';

const ArtistPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setCurrentTrack, setPlaylist, play } = usePlayer();

  const [artist, setArtist] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchArtist(); }, [id]);

  const fetchArtist = async () => {
    try {
      const response = await artistAPI.getById(id);
      const data = response.data.data;
      setArtist(data);
      if (user?.followedArtists) {
        setIsFollowing(user.followedArtists.some((a) => a._id === id || a === id));
      }
    } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
  };

  const handleFollow = async () => {
    try {
      isFollowing ? await artistAPI.unfollow(id) : await artistAPI.follow(id);
      setIsFollowing(!isFollowing);
    } catch (error) { console.error('Error:', error); }
  };

  const handlePlayTrack = (track, tracks) => {
    setPlaylist(tracks);
    setCurrentTrack(track);
    play();
  };

  const handlePlayAll = () => {
    if (artist?.topTracks?.length > 0) {
      setPlaylist(artist.topTracks);
      setCurrentTrack(artist.topTracks[0]);
      play();
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-900"><i className="fas fa-spinner fa-spin text-4xl text-blue-400" /></div>;
  if (!artist) return <div className="flex h-screen items-center justify-center bg-gray-900 text-white">Artist not found</div>;

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto pb-32">
          {/* Header */}
          <div className="relative h-80 bg-gradient-to-b from-gray-950 to-gray-900 border-b border-gray-800">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${artist.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(40px)' }} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-gray-900/80 to-gray-900" />
            <div className="relative h-full px-8 py-10 flex items-end">
              <div className="flex items-end gap-6">
                <div className="w-40 h-40 rounded-full bg-gray-800 overflow-hidden border-4 border-gray-900 shadow-2xl neon-glow">
                  <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold mb-2 text-white">{artist.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-300">
                    <span>{(artist.monthlyListeners || 0).toLocaleString()} monthly listeners</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8 space-y-10">
            {/* Controls */}
            <div className="flex items-center gap-4">
              <button onClick={handlePlayAll} className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white hover:scale-105 transition-all shadow-lg">
                <i className="fas fa-play text-xl ml-1" />
              </button>
              <button onClick={handleFollow} className={`px-6 py-2 rounded-full border text-sm font-medium transition-all ${isFollowing ? 'border-gray-500 text-gray-200' : 'border-blue-500 text-blue-400'}`}>
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>

            {/* Popular Tracks */}
            {artist.topTracks && artist.topTracks.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4">Popular</h2>
                <div className="bg-gray-900/80 border border-gray-800 rounded-2xl overflow-hidden">
                  <div className="space-y-1">
                    {artist.topTracks.map((track, index) => (
                      <TrackItem
                        key={track._id}
                        track={track}
                        index={index}
                        onPlay={() => handlePlayTrack(track, artist.topTracks)}
                        showAlbum={true}
                        showArtist={false} 
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ArtistPage;