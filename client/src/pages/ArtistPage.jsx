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
      const data = response.data.data;
      setArtist(data);

      if (user?.followedArtists) {
        const following = user.followedArtists.some(
          (a) => a._id === id || a === id,
        );
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
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-400" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="flex h-screen bg-gray-900 text-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNav />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <i className="fas fa-exclamation-circle text-6xl text-gray-700 mb-4" />
              <p className="text-gray-400 mb-4">Artist not found</p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-sm font-semibold hover:from-blue-600 hover:to-purple-600 transition-all"
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
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />

        <main className="flex-1 overflow-y-auto pb-32">
          {/* Artist header with gradient background */}
          <div className="relative h-80 bg-gradient-to-b from-gray-950 to-gray-900 border-b border-gray-800">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url(${artist.coverImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(40px)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-gray-900/80 to-gray-900" />

            <div className="relative h-full px-8 py-10 flex items-end">
              <div className="flex items-end gap-6">
                <div className="w-40 h-40 rounded-full bg-gray-800 overflow-hidden border-4 border-gray-900 shadow-2xl neon-glow">
                  <img
                    src={artist.imageUrl}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  {artist.verified && (
                    <div className="flex items-center gap-2 mb-2 text-sm text-blue-300">
                      <i className="fas fa-check-circle" />
                      <span>Verified Artist</span>
                    </div>
                  )}
                  <h1 className="text-5xl font-bold mb-2 text-white">
                    {artist.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-300">
                    <span>
                      {(artist.monthlyListeners || 0).toLocaleString()} monthly listeners
                    </span>
                    <span>•</span>
                    <span>
                      {(artist.followers || 0).toLocaleString()} followers
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="px-8 py-6 bg-gray-900/90 border-b border-gray-800 flex items-center gap-4">
            <button
              onClick={handlePlayAll}
              disabled={!artist.topTracks || artist.topTracks.length === 0}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-play text-xl ml-1" />
            </button>
            <button
              onClick={handleFollow}
              className={`px-6 py-2 rounded-full border text-sm font-medium transition-all ${
                isFollowing
                ? 'border-gray-500 text-gray-200 hover:border-white'
                : 'border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
            <button className="text-gray-400 hover:text-gray-100 transition-colors">
              <i className="fas fa-ellipsis-h text-xl" />
            </button>
          </div>

          {/* Content */}
          <div className="px-8 py-8 space-y-10">
            {/* Popular Tracks */}
            {artist.topTracks && artist.topTracks.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4">Popular</h2>
                <div className="bg-gray-900/80 border border-gray-800 rounded-2xl overflow-hidden">
                  <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs text-gray-400 uppercase tracking-wider border-b border-gray-800 mb-1">
                    <div className="col-span-1">#</div>
                    <div className="col-span-5">Title</div>
                    <div className="col-span-3">Album</div>
                    <div className="col-span-2">Genre</div>
                    <div className="col-span-1 text-right">
                      <i className="far fa-clock" />
                    </div>
                  </div>

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

            {/* About */}
            <section>
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
                <p className="text-gray-300 mb-4">{artist.bio}</p>

                {artist.genres && artist.genres.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                      Genres
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {artist.genres.map((genre, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full bg-gray-800 text-gray-200 text-xs"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-2xl font-bold text-blue-400">
                      {(artist.monthlyListeners || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Monthly listeners</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-400">
                      {(artist.followers || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Followers</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Discography */}
            {artist.albums && artist.albums.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4">Discography</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {artist.albums.map((album, idx) => (
                    <div
                      key={idx}
                      className="card-hover bg-gray-900/80 border border-gray-800 rounded-xl p-4 cursor-pointer group"
                    >
                      <div className="relative mb-3">
                        <img
                          src={album.coverImage}
                          alt={album.title}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <button className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-xl">
                          <i className="fas fa-play text-xs ml-0.5" />
                        </button>
                      </div>
                      <h3 className="text-sm font-semibold mb-1 truncate">
                        {album.title}
                      </h3>
                      <p className="text-xs text-gray-400">{album.releaseYear}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Similar Artists */}
            {artist.similarArtists && artist.similarArtists.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4">Fans also like</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {artist.similarArtists.map((a) => (
                    <div
                      key={a._id}
                      onClick={() => navigate(`/artists/${a._id}`)}
                      className="card-hover bg-gray-900/80 border border-gray-800 rounded-xl p-4 text-center cursor-pointer"
                    >
                      <div className="mb-3">
                        <img
                          src={a.imageUrl}
                          alt={a.name}
                          className="w-full aspect-square object-cover rounded-full"
                        />
                      </div>
                      <h3 className="text-sm font-semibold mb-1 truncate">
                        {a.name}
                      </h3>
                      <p className="text-xs text-gray-400">Artist</p>
                    </div>
                  ))}
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