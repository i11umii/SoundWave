import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../contexts/PlayerContext';
import { trackAPI } from '../utils/api';
import { formatTime } from '../utils/helpers';
import AddToPlaylistModal from './AddToPlaylistModal';

function TrackItem(props) {
  const navigate = useNavigate();
  const player = usePlayer();

  const track = props.track;
  const index = props.index;
  const onPlay = props.onPlay;

  let showAlbum = props.showAlbum;
  if (showAlbum === undefined) {
    showAlbum = true;
  }

  let showArtist = props.showArtist;
  if (showArtist === undefined) {
    showArtist = true;
  }

  let showMenu = props.showMenu;
  if (showMenu === undefined) {
    showMenu = true;
  }

  const onRemoveFromPlaylist = props.onRemoveFromPlaylist;

  const currentTrack = player.currentTrack;
  const isPlaying = player.isPlaying;
  const isTrackLiked = player.isTrackLiked;
  const toggleLikeLocally = player.toggleLikeLocally;

  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  if (!track) {
    return null;
  }

  const isLiked = isTrackLiked(track._id);

  let isCurrentTrack = false;
  if (currentTrack && currentTrack._id && track._id) {
    if (currentTrack._id === track._id) {
      isCurrentTrack = true;
    }
  }

  async function handleLikeClick(e) {
    e.stopPropagation();
    console.log('TrackItem: like click', track._id);

    const newStatus = !isLiked;

    // сначала меняем состояние в UI
    toggleLikeLocally(track._id);

    // уведомляем другие страницы об изменении
    window.dispatchEvent(
      new CustomEvent('like-change', {
        detail: { track: track, isLiked: newStatus },
      })
    );

    try {
      if (newStatus) {
        await trackAPI.like(track._id);
      } else {
        await trackAPI.unlike(track._id);
      }
      console.log('TrackItem: like saved', track._id, newStatus);
    } catch (error) {
      console.log(error);
      console.log('TrackItem: like error, rollback', track._id);

      // если запрос не прошел — возвращаем обратно
      toggleLikeLocally(track._id);
    }
  }

  function handleRowClick() {
    console.log('TrackItem: row click', track._id);
    if (onPlay) {
      onPlay(track, index);
    }
  }

  function handleArtistClick(e) {
    e.stopPropagation();
    console.log('TrackItem: artist click');

    if (track.artist && track.artist._id) {
      navigate(`/artist/${track.artist._id}`);
    }
  }

  function handleToggleDropdown(e) {
    e.stopPropagation();
    console.log('TrackItem: toggle dropdown');
    setShowDropdown(!showDropdown);
  }

  function handleOpenAddToPlaylist(e) {
    e.stopPropagation();
    console.log('TrackItem: open add to playlist');
    setShowModal(true);
    setShowDropdown(false);
  }

  function handleCloseModal() {
    console.log('TrackItem: close modal');
    setShowModal(false);
  }

  function handleRemoveFromPlaylistClick(e) {
    e.stopPropagation();
    console.log('TrackItem: remove from playlist');

    if (onRemoveFromPlaylist) {
      onRemoveFromPlaylist();
    }
    setShowDropdown(false);
  }

  let indexBlock = null;
  if (isCurrentTrack && isPlaying) {
    indexBlock = <i className="fas fa-volume-up text-blue-400 animate-pulse"></i>;
  } else {
    indexBlock = (
      <>
        <span className="text-gray-400 group-hover:hidden text-sm">{index + 1}</span>
        <button className="hidden group-hover:block" type="button">
          <i className="fas fa-play text-blue-400 ml-0.5"></i>
        </button>
      </>
    );
  }

  let artistBlock = null;
  if (showArtist === true && track.artist) {
    artistBlock = (
      <button
        type="button"
        onClick={handleArtistClick}
        className="text-xs text-gray-400 truncate hover:text-white hover:underline transition-colors text-left block"
      >
        {track.artist.name}
      </button>
    );
  }

  let albumBlock = null;
  if (showAlbum === true) {
    const albumName = track.album || 'Unknown Album';
    albumBlock = (
      <div className="col-span-3 flex items-center">
        <span className="text-sm text-gray-400 truncate">{albumName}</span>
      </div>
    );
  }

  let menuButtonBlock = null;
  if (showMenu === true) {
    menuButtonBlock = (
      <button
        type="button"
        onClick={handleToggleDropdown}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white"
      >
        <i className="fas fa-ellipsis-h"></i>
      </button>
    );
  }

  let dropdownBlock = null;
  if (showDropdown === true) {
    let removeButtonBlock = null;
    if (onRemoveFromPlaylist) {
      removeButtonBlock = (
        <button
          type="button"
          onClick={handleRemoveFromPlaylistClick}
          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300"
        >
          <i className="fas fa-trash mr-2"></i> Remove from this Playlist
        </button>
      );
    }

    dropdownBlock = (
      <div className="absolute right-0 top-8 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 w-48 overflow-hidden">
        <button
          type="button"
          onClick={handleOpenAddToPlaylist}
          className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <i className="fas fa-plus mr-2"></i> Add to Playlist
        </button>
        {removeButtonBlock}
      </div>
    );
  }

  let modalBlock = null;
  if (showModal === true) {
    modalBlock = <AddToPlaylistModal trackId={track._id} onClose={handleCloseModal} />;
  }

  return (
    <>
      <div
        onClick={handleRowClick}
        className="grid grid-cols-12 gap-4 px-4 py-3 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer group relative"
      >
        <div className="col-span-1 flex items-center justify-center">{indexBlock}</div>

        <div className="col-span-5 flex items-center space-x-3 min-w-0">
          <img src={track.imageUrl} alt={track.title} className="w-12 h-12 rounded" />
          <div className="min-w-0 flex-1">
            <h4 className={`font-medium text-sm truncate ${isCurrentTrack ? 'text-blue-400' : 'text-white'}`}>
              {track.title}
            </h4>
            {artistBlock}
          </div>
        </div>

        {albumBlock}

        <div className="col-span-2 flex items-center">
          <span className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full">{track.genre || 'Unknown'}</span>
        </div>

        <div className="col-span-1 flex items-center justify-end gap-3 relative">
          <span className="text-sm text-gray-400 hidden group-hover:hidden">{formatTime(track.duration)}</span>

          <button
            type="button"
            onClick={handleLikeClick}
            className={`opacity-0 group-hover:opacity-100 transition-all ${isLiked ? 'text-pink-400 opacity-100' : 'text-gray-400 hover:text-pink-400'
              }`}
          >
            <i className={`${isLiked ? 'fas' : 'far'} fa-heart`}></i>
          </button>

          {menuButtonBlock}
          {dropdownBlock}
        </div>
      </div>

      {modalBlock}
    </>
  );
}

export default TrackItem;