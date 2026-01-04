import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../contexts/PlayerContext';
import { trackAPI } from '../utils/api';
import { formatTime } from '../utils/helpers';
import AddToPlaylistModal from './AddToPlaylistModal';

const TrackItem = ({
  track,
  index,
  onPlay,
  showAlbum = true,
  showArtist = true,
  showMenu = true,
  onRemoveFromPlaylist = null
  // Убрали onLikeToggle - он больше не нужен, используем события
}) => {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, isTrackLiked, toggleLikeLocally } = usePlayer();
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // 1. ПРОВЕРЯЕМ СТАТУС ЧЕРЕЗ ГЛОБАЛЬНЫЙ СПИСОК
  const isLiked = isTrackLiked(track._id);
  
  const isCurrentTrack = currentTrack?._id === track._id;

  const handleLike = async (e) => {
    e.stopPropagation();
    
    const newStatus = !isLiked;

    // 2. Обновляем глобальный контекст
    toggleLikeLocally(track._id);

    // 3. Отправляем событие для синхронизации (для LikedSongsPage)
    window.dispatchEvent(new CustomEvent('like-change', {
      detail: { track: track, isLiked: newStatus }
    }));

    try {
      if (newStatus) {
        await trackAPI.like(track._id);
      } else {
        await trackAPI.unlike(track._id);
      }
    } catch (error) {
      console.error('Error liking track:', error);
      toggleLikeLocally(track._id); // Откат
    }
  };

  const handleArtistClick = (e) => { e.stopPropagation(); if (track.artist?._id) navigate(`/artist/${track.artist._id}`); };
  const toggleDropdown = (e) => { e.stopPropagation(); setShowDropdown(!showDropdown); };

  return (
    <>
      <div
        onClick={() => onPlay && onPlay(track, index)}
        className="grid grid-cols-12 gap-4 px-4 py-3 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer group relative"
      >
        <div className="col-span-1 flex items-center justify-center">
          {isCurrentTrack && isPlaying ? (
            <i className="fas fa-volume-up text-blue-400 animate-pulse"></i>
          ) : (
            <>
                <span className="text-gray-400 group-hover:hidden text-sm">{index + 1}</span>
                <button className="hidden group-hover:block">
                <i className="fas fa-play text-blue-400 ml-0.5"></i>
              </button>
            </>
          )}
        </div>

        <div className="col-span-5 flex items-center space-x-3 min-w-0">
          <img src={track.imageUrl} alt={track.title} className="w-12 h-12 rounded" />
          <div className="min-w-0 flex-1">
            <h4 className={`font-medium text-sm truncate ${isCurrentTrack ? 'text-blue-400' : 'text-white'}`}>
              {track.title}
            </h4>
            {showArtist && track.artist && (
              <button onClick={handleArtistClick} className="text-xs text-gray-400 truncate hover:text-white hover:underline transition-colors text-left block">
                {track.artist.name}
              </button>
            )}
          </div>
        </div>

        {showAlbum && (
          <div className="col-span-3 flex items-center">
            <span className="text-sm text-gray-400 truncate">{track.album || 'Unknown Album'}</span>
          </div>
        )}

        <div className="col-span-2 flex items-center">
          <span className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full">{track.genre || 'Unknown'}</span>
        </div>

        <div className="col-span-1 flex items-center justify-end gap-3 relative">
          <span className="text-sm text-gray-400 hidden group-hover:hidden">{formatTime(track.duration)}</span>

          <button onClick={handleLike} className={`opacity-0 group-hover:opacity-100 transition-all ${isLiked ? 'text-pink-400 opacity-100' : 'text-gray-400 hover:text-pink-400'}`}>
            <i className={`${isLiked ? 'fas' : 'far'} fa-heart`}></i>
          </button>

          {showMenu && (
            <button onClick={toggleDropdown} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white">
              <i className="fas fa-ellipsis-h"></i>
            </button>
          )}

          {showDropdown && (
            <div className="absolute right-0 top-8 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 w-48 overflow-hidden">
              <button
                onClick={(e) => { e.stopPropagation(); setShowModal(true); setShowDropdown(false); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <i className="fas fa-plus mr-2"></i> Add to Playlist
              </button>

              {onRemoveFromPlaylist && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onRemoveFromPlaylist(); setShowDropdown(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300"
                >
                  <i className="fas fa-trash mr-2"></i> Remove from this Playlist
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && <AddToPlaylistModal trackId={track._id} onClose={() => setShowModal(false)} />}
    </>
  );
};

export default TrackItem;