import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../contexts/PlayerContext';
import { trackAPI } from '../utils/api';
import { formatTime } from '../utils/helpers';

const TrackItem = ({ track, index, onPlay, showAlbum = true, showArtist = true, isLiked: initialLiked = false }) => {
  const navigate = useNavigate();
  const { currentTrack, isPlaying } = usePlayer();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [liking, setLiking] = useState(false);
  
  const isCurrentTrack = currentTrack?._id === track._id;

  const handleArtistClick = (e) => {
    e.stopPropagation();
    if (track.artist?._id) {
      navigate(`/artist/${track.artist._id}`);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (liking) return;
    
    setLiking(true);
    try {
      if (isLiked) {
        await trackAPI.unlike(track._id);
        setIsLiked(false);
      } else {
        await trackAPI.like(track._id);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error liking track:', error);
    } finally {
      setLiking(false);
    }
  };

  return (
    <div
      onClick={() => onPlay && onPlay(track, index)}
      className="grid grid-cols-12 gap-2 md:gap-4 px-2 md:px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer group"
    >
      {/* Number / Play Icon */}
      <div className="col-span-1 flex items-center justify-center">
        {isCurrentTrack && isPlaying ? (
          <i className="fas fa-volume-up text-blue-400 animate-pulse"></i>
        ) : (
          <>
            <span className="text-slate-400 group-hover:hidden text-sm">
              {index + 1}
            </span>
            <button className="hidden group-hover:block">
              <i className="fas fa-play text-blue-400"></i>
            </button>
          </>
        )}
      </div>

      {/* Track Info */}
      <div className="col-span-11 md:col-span-5 flex items-center space-x-3">
        <img
          src={track.imageUrl}
          alt={track.title}
          className="w-10 h-10 md:w-12 md:h-12 rounded"
        />
        <div className="min-w-0 flex-1">
          <h4 className={`font-medium text-sm md:text-base truncate ${
            isCurrentTrack ? 'text-blue-400' : 'text-white'
          }`}>
            {track.title}
          </h4>
          {showArtist && track.artist && (
            <button
              onClick={handleArtistClick}
              className="text-xs md:text-sm text-slate-400 truncate hover:text-white hover:underline transition-colors text-left block"
            >
              {track.artist.name}
            </button>
          )}
        </div>
      </div>

      {/* Album */}
      {showAlbum && (
        <div className="hidden md:flex md:col-span-3 items-center">
          <span className="text-sm text-slate-400 truncate">{track.album}</span>
        </div>
      )}

      {/* Genre */}
      <div className="hidden md:flex md:col-span-2 items-center">
        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">
          {track.genre}
        </span>
      </div>

      {/* Duration & Like */}
      <div className="hidden md:flex md:col-span-1 items-center justify-end gap-4">
        <span className="text-sm text-slate-400">
          {formatTime(track.duration)}
        </span>
        <button
          onClick={handleLike}
          disabled={liking}
          className={`opacity-0 group-hover:opacity-100 transition-all ${
            isLiked ? 'text-purple-400' : 'text-slate-400 hover:text-purple-400'
          }`}
        >
          <i className={`${isLiked ? 'fas' : 'far'} fa-heart`}></i>
        </button>
      </div>
    </div>
  );
};

export default TrackItem;