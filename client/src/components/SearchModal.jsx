import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../contexts/PlayerContext';
import { userAPI } from '../utils/api';

function SearchModal(props) {
  const isOpen = props.isOpen;
  const onClose = props.onClose;

  const navigate = useNavigate();

  const player = usePlayer();
  const setCurrentTrack = player.setCurrentTrack;
  const setPlaylist = player.setPlaylist;
  const play = player.play;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ tracks: [], artists: [], playlists: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    console.log('SearchModal: opened');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (query.length === 0) {
      setResults({ tracks: [], artists: [], playlists: [] });
      return;
    }

    const timer = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [query, isOpen]);

  async function fetchSearchResults() {
    console.log('SearchModal: search start', query);
    setLoading(true);

    try {
      const response = await userAPI.search(query);
      if (response && response.data && response.data.data) {
        setResults(response.data.data);
      } else {
        setResults({ tracks: [], artists: [], playlists: [] });
      }
      console.log('SearchModal: search done');
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  function handleQueryChange(e) {
    const value = e.target.value;
    setQuery(value);
  }

  function handleClose() {
    console.log('SearchModal: close');
    if (onClose) {
      onClose();
    }
  }

  function handleTrackClick(track) {
    console.log('SearchModal: track click', track ? track._id : null);

    const tracks = results.tracks;
    setPlaylist(tracks);
    setCurrentTrack(track);
    play();

    handleClose();
  }

  function handleArtistClick(artistId) {
    console.log('SearchModal: artist click', artistId);
    navigate(`/artist/${artistId}`);
    handleClose();
  }

  function handlePlaylistClick(playlistId) {
    console.log('SearchModal: playlist click', playlistId);
    navigate(`/playlists/${playlistId}`);
    handleClose();
  }

  if (!isOpen) {
    return null;
  }

  const hasTracks = results.tracks && results.tracks.length > 0;
  const hasArtists = results.artists && results.artists.length > 0;
  const hasPlaylists = results.playlists && results.playlists.length > 0;

  let tracksBlock = null;
  if (hasTracks) {
    tracksBlock = (
      <div className="p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">TRACKS</h3>
        {results.tracks.map((track) => (
          <div
            key={track._id}
            onClick={() => handleTrackClick(track)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer"
          >
            <img src={track.imageUrl} alt={track.title} className="w-12 h-12 rounded" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{track.title}</p>
              <p className="text-sm text-slate-400 truncate">{track.artist?.name}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  let artistsBlock = null;
  if (hasArtists) {
    artistsBlock = (
      <div className="p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">ARTISTS</h3>
        {results.artists.map((artist) => (
          <div
            key={artist._id}
            onClick={() => handleArtistClick(artist._id)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer"
          >
            <img src={artist.imageUrl} alt={artist.name} className="w-12 h-12 rounded-full" />
            <div>
              <p className="font-medium">{artist.name}</p>
              <p className="text-sm text-slate-400">Artist</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  let playlistsBlock = null;
  if (hasPlaylists) {
    playlistsBlock = (
      <div className="p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">PLAYLISTS</h3>
        {results.playlists.map((playlist) => (
          <div
            key={playlist._id}
            onClick={() => handlePlaylistClick(playlist._id)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer"
          >
            <div
              className={`w-12 h-12 bg-gradient-to-br from-${playlist.color}-500 to-${playlist.color}-700 rounded flex items-center justify-center`}
            >
              <i className={`fas ${playlist.icon} text-white`}></i>
            </div>
            <div>
              <p className="font-medium">{playlist.name}</p>
              <p className="text-sm text-slate-400">By {playlist.user?.username}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  let noResultsBlock = null;
  if (query && !loading && !hasTracks && !hasArtists && !hasPlaylists) {
    noResultsBlock = (
      <div className="p-8 text-center text-slate-400">
        <i className="fas fa-search text-4xl mb-3 opacity-50"></i>
        <p>No results found for &quot;{query}&quot;</p>
      </div>
    );
  }

  let contentBlock = null;
  if (loading) {
    contentBlock = (
      <div className="p-8 text-center">
        <i className="fas fa-spinner fa-spin text-2xl text-slate-400"></i>
      </div>
    );
  } else {
    contentBlock = (
      <>
        {tracksBlock}
        {artistsBlock}
        {playlistsBlock}
        {noResultsBlock}
      </>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-20">
      <div className="bg-slate-800 rounded-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <i className="fas fa-search text-slate-400"></i>
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder="What do you want to listen to?"
              className="flex-1 bg-transparent text-white outline-none"
              autoFocus
            />
            <button type="button" onClick={handleClose} className="text-slate-400 hover:text-white">
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-80px)]">{contentBlock}</div>
      </div>
    </div>
  );
}

export default SearchModal;