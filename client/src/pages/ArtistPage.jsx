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

  useEffect(() => {
    fetchArtist();
  }, [id]);

  const fetchArtist = async () => {
    try {
      const response = await artistAPI.getById(id);
      setArtist(response.data.data);
      
      // Check if user follows this artist
      if (user?.followedArtists) {
        const following = user.followedArtists.some(a => a._id === id || a === id);
        setIsFollowing(following);
      }
    } catch (error) {
      console.error('Error fetching artist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await artistAPI.unfollow(id);
        setIsFollowing(false);
      } else {
        await artistAPI.follow(id);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error following/unfollowing artist:', error);
    }
  };

  const handlePlayTrack = (track, tracks) => {
    setPlaylist(tracks);
    setCurrentTrack(track);
    play();
  };

  const handlePlayAll = () => {
    if (artist?.topTracks && artist.topTracks.length > 0) {
      setPlaylist(artist.topTracks);
      setCurrentTrack(artist.topTracks[0]);
      play();
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="flex h-screen bg-slate-950 text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNav />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <i className="fas fa-exclamation-circle text-6xl text-slate-600 mb-4"></i>
              <p className="text-slate-400 mb-4">Artist not found</p>
              <button
                onClick={() => navigate('/')}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full transition-colors"
              >
                Go Home
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />

        <main className="flex-1 overflow-y-auto pb-32">
          {/* Artist Header */}
          <div 
            className="relative h-96 bg-cover bg-center"
            style={{
              backgroundImage: `url(${artist.coverImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950"></div>
            
            <div className="absolute bottom-0 left-0 right-0 px-8 pb-8">
              <div className="flex items-end space-x-6">
                <img
                  src={artist.imageUrl}
                  alt={artist.name}
                  className="w-48 h-48 rounded-full shadow-2xl border-4 border-slate-950"
                />
                <div className="flex-1 pb-4">
                  {artist.verified && (
                    <div className="flex items-center space-x-2 mb-2">
                      <i className="fas fa-check-circle text-blue-500"></i>
                      <span className="text-sm">Verified Artist</span>
                    </div>
                  )}
                  <h1 className="text-6xl font-bold mb-4">{artist.name}</h1>
                  <div className="flex items-center space-x-4 text-sm text-slate-300">
                    <span>{(artist.monthlyListeners || 0).toLocaleString()} monthly listeners</span>
                    <span>•</span>
                    <span>{(artist.followers || 0).toLocaleString()} followers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gradient-to-b from-slate-950 to-slate-900 px-8 py-6 flex items-center space-x-4">
            <button
              onClick={handlePlayAll}
              disabled={!artist.topTracks || artist.topTracks.length === 0}
              className="w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-play text-xl ml-1"></i>
            </button>

            <button
              onClick={handleFollow}
              className={`px-8 py-3 rounded-full border-2 font-medium transition-all ${
                isFollowing
                  ? 'border-slate-500 text-slate-300 hover:border-white hover:text-white'
                  : 'border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>

            <button className="text-slate-400 hover:text-white transition-colors">
              <i className="fas fa-ellipsis-h text-xl"></i>
            </button>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            {/* Popular Tracks */}
            {artist.topTracks && artist.topTracks.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Popular</h2>
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
            )}

            {/* About */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <div className="bg-slate-800 rounded-xl p-6">
                <div className="flex items-start space-x-6">
                  <img
                    src={artist.imageUrl}
                    alt={artist.name}
                    className="w-32 h-32 rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="text-slate-300 mb-4">{artist.bio}</p>
                    
                    {artist.genres && artist.genres.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                          Genres
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {artist.genres.map((genre, index) => (
                            <span
                              key={index}
                              className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-3xl font-bold">
                          {(artist.monthlyListeners || 0).toLocaleString()}
                        </div>
                        <div className="text-slate-400 text-sm">Monthly Listeners</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold">
                          {(artist.followers || 0).toLocaleString()}
                        </div>
                        <div className="text-slate-400 text-sm">Followers</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Discography */}
            {artist.albums && artist.albums.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Discography</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {artist.albums.map((album, index) => (
                    <div
                      key={index}
                      className="bg-slate-800 rounded-lg p-4 hover:bg-slate-700 transition-colors cursor-pointer group"
                    >
                      <div className="relative mb-4">
                        <img
                          src={album.coverImage}
                          alt={album.title}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <button className="absolute bottom-2 right-2 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-xl">
                          <i className="fas fa-play text-white text-sm ml-1"></i>
                        </button>
                      </div>
                      <h3 className="font-semibold mb-1 truncate">{album.title}</h3>
                      <p className="text-sm text-slate-400">{album.releaseYear}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Similar Artists */}
            {artist.similarArtists && artist.similarArtists.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Fans also like</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {artist.similarArtists.map((similarArtist) => (
                    <div
                      key={similarArtist._id}
                      onClick={() => navigate(`/artist/${similarArtist._id}`)}
                      className="bg-slate-800 rounded-lg p-4 hover:bg-slate-700 transition-colors cursor-pointer text-center"
                    >
                      <div className="relative mb-4">
                        <img
                          src={similarArtist.imageUrl}
                          alt={similarArtist.name}
                          className="w-full aspect-square object-cover rounded-full"
                        />
                      </div>
                      <h3 className="font-semibold mb-1 truncate">{similarArtist.name}</h3>
                      <p className="text-sm text-slate-400">Artist</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ArtistPage;