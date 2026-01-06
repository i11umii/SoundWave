import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { artistAPI } from '../utils/api';
import { usePlayer } from '../contexts/PlayerContext';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import TrackItem from '../components/TrackItem';
import { formatNumber } from '../utils/helpers'

const ArtistPage = () => {
  const params = useParams();
  const id = params.id;
  const navigate = useNavigate();

  const player = usePlayer();

  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('ArtistPage: mount / id changed', id);
    fetchArtist();
  }, [id]);

  const fetchArtist = async () => {
    console.log('ArtistPage: fetchArtist start', id);

    setLoading(true);

    try {
      const res = await artistAPI.getById(id);

      let data = null;
      if (res && res.data && res.data.data) {
        data = res.data.data;
      }

      setArtist(data);
      console.log('ArtistPage: artist loaded', data ? data._id : null);
    } catch (error) {
      console.log(error);
      setArtist(null);
    } finally {
      setLoading(false);
      console.log('ArtistPage: fetchArtist end');
    }
  };

  const handleToggleFollow = async () => {
    console.log('ArtistPage: handleToggleFollow');

    if (!artist) {
      return;
    }

    const artistId = artist._id;

    // текущий статус берём из PlayerContext (он переживает refresh, потому что подтягивается с сервера)
    const wasFollowing = player.isArtistFollowed(artistId);

    // оптимистично меняем локально
    player.toggleFollowLocally(artistId);

    // (опционально) чтобы цифра followers менялась сразу в UI
    setArtist((prev) => {
      if (!prev) {
        return prev;
      }

      const currentFollowers = typeof prev.followers === 'number' ? prev.followers : 0;

      let nextFollowers = currentFollowers;
      if (wasFollowing) {
        nextFollowers = currentFollowers - 1;
      } else {
        nextFollowers = currentFollowers + 1;
      }

      if (nextFollowers < 0) {
        nextFollowers = 0;
      }

      const next = {
        ...prev,
        followers: nextFollowers,
      };

      return next;
    });

    try {
      if (wasFollowing) {
        await artistAPI.unfollow(artistId);
      } else {
        await artistAPI.follow(artistId);
      }

      // на всякий — пересинхронизировать с сервером
      await player.refreshFollowedArtists();
    } catch (error) {
      console.log(error);

      // откат локального статуса
      player.toggleFollowLocally(artistId);

      // откат цифры followers
      setArtist((prev) => {
        if (!prev) {
          return prev;
        }

        const currentFollowers = typeof prev.followers === 'number' ? prev.followers : 0;

        let nextFollowers = currentFollowers;
        if (wasFollowing) {
          // мы пытались unfollow, значит надо вернуть +1
          nextFollowers = currentFollowers + 1;
        } else {
          // мы пытались follow, значит надо вернуть -1
          nextFollowers = currentFollowers - 1;
        }

        if (nextFollowers < 0) {
          nextFollowers = 0;
        }

        const next = {
          ...prev,
          followers: nextFollowers,
        };

        return next;
      });
    }
  };  

  const handlePlayTopTrack = (track) => {
    console.log('ArtistPage: handlePlayTopTrack', track ? track._id : null);

    if (!artist || !artist.tracks || artist.tracks.length === 0) {
      return;
    }

    player.setPlaylist(artist.tracks);
    player.setCurrentTrack(track);
    player.play();
  };

  const handlePlayAll = () => {
    console.log('ArtistPage: handlePlayAll');

    if (!artist || !artist.tracks || artist.tracks.length === 0) {
      return;
    }

    player.setPlaylist(artist.tracks);
    player.setCurrentTrack(artist.tracks[0]);
    player.play();
  };

  const handleSimilarArtistClick = (artistId) => {
    console.log('ArtistPage: open similar artist', artistId);

    navigate(`/artist/${artistId}`);

    const main = document.querySelector('main');
    if (main) {
      main.scrollTo({ top: 0, behavior: 'smooth' });
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
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        Artist not found
      </div>
    );
  }

  let verifiedBlock = null;
  if (artist.verified) {
    verifiedBlock = (
      <div className="flex items-center gap-2 mb-2">
        <i className="fas fa-check-circle text-blue-500" />
        <span className="text-sm text-blue-400">Verified Artist</span>
      </div>
    );
  }

  let albumsBlock = null;
  if (artist.albums && artist.albums.length > 0) {
    albumsBlock = (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {artist.albums.map((album) => (
          <Link
            key={album._id}
            to={`/album/${album._id}`}
            className="card-hover bg-gray-800/40 rounded-xl p-4 border border-gray-700/50"
          >
            <img src={album.coverUrl} alt={album.title} className="w-full aspect-square object-cover rounded-lg mb-3" />
            <h4 className="font-semibold text-white truncate">{album.title}</h4>
            <p className="text-xs text-gray-400">{album.year}</p>
          </Link>
        ))}
      </div>
    );
  } else {
    albumsBlock = (
      <div className="text-center py-10 text-gray-400 bg-gray-800/30 rounded-xl">
        <p>No albums yet</p>
      </div>
    );
  }

  let topTracksBlock = null;
  if (artist.tracks && artist.tracks.length > 0) {
    const top = artist.tracks.slice(0, 10);

    topTracksBlock = (
      <div className="space-y-1">
        {top.map((track, index) => (
          <TrackItem
            key={track._id}
            track={track}
            index={index}
            onPlay={() => handlePlayTopTrack(track)}
            showAlbum={true}
            showArtist={false}
            showMenu={true}
          />
        ))}
      </div>
    );
  } else {
    topTracksBlock = (
      <div className="text-center py-10 text-gray-400 bg-gray-800/30 rounded-xl">
        <p>No tracks yet</p>
      </div>
    );
  }

  let similarBlock = null;
  if (artist.similarArtists && artist.similarArtists.length > 0) {
    similarBlock = (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {artist.similarArtists.map((a) => (
          <button
            key={a._id}
            onClick={() => handleSimilarArtistClick(a._id)}
            className="flex items-center gap-3 bg-gray-800/40 border border-gray-700/50 rounded-xl px-4 py-3 hover:bg-gray-800/70 transition-all shrink-0"
          >
            <img src={a.imageUrl} alt={a.name} className="w-12 h-12 rounded-full object-cover" />
            <div className="text-left">
              <div className="font-semibold text-white">{a.name}</div>
              <div className="text-xs text-gray-400">Artist</div>
            </div>
          </button>
        ))}
      </div>
    );
  }

  const isFollowing = player.isArtistFollowed(artist._id);
  let followText = 'Follow';
  if (isFollowing) {
    followText = 'Following';
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />

        <main className="flex-1 overflow-y-auto pb-32">
          <div className="px-8 py-10 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-900 border-b border-gray-800">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-8">
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden shadow-2xl">
                <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                {verifiedBlock}
                <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">{artist.name}</h1>
                <div className="flex flex-wrap items-center gap-6 mb-6 text-sm text-gray-300">
                  <div>
                    <span className="text-white font-bold">{formatNumber(artist.monthlyListeners)}</span> monthly listeners
                  </div>
                  <div>
                    <span className="text-white font-bold">{formatNumber(artist.followers)}</span> followers
                  </div>
                </div>


                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePlayAll}
                    className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center hover:scale-105 transition-all shadow-lg"
                  >
                    <i className="fas fa-play text-xl ml-1" />
                  </button>

                  <button
                    onClick={handleToggleFollow}
                    className={`px-6 py-3 rounded-full border text-sm font-semibold transition-all ${isFollowing ? 'border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white' : 'bg-white text-black border-transparent hover:scale-105'}`}
                  >
                    {followText}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            <section className="mb-12">
              <h3 className="text-2xl font-bold text-white mb-4">Popular</h3>
              {topTracksBlock}
            </section>

            <section className="mb-12">
              <h3 className="text-2xl font-bold text-white mb-4">Albums</h3>
              {albumsBlock}
            </section>

            <section>
              <h3 className="text-2xl font-bold text-white mb-4">Fans also like</h3>
              {similarBlock}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ArtistPage;
