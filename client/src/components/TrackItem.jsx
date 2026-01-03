import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../contexts/PlayerContext';
import { trackAPI } from '../utils/api';
import { formatTime } from '../utils/helpers';

const TrackItem = ({
  track,
  index,
  onPlay,
  showAlbum = true,
  showArtist = true,
  isLiked: initialLiked = false
}) => {
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
      className="grid grid-cols-12 gap-4 px-4 py-3 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer group"
    >
      {/* Number / Play Icon */}
      <div className="col-span-1 flex items-center justify-center">
        {isCurrentTrack && isPlaying ? (
          <i className="fas fa-volume-up text-blue-400 animate-pulse"></i>
        ) : (
          <>
              <span className="text-gray-400 group-hover:hidden text-sm">
              {index + 1}
            </span>
            <button className="hidden group-hover:block">
                <i className="fas fa-play text-blue-400 ml-0.5"></i>
            </button>
          </>
        )}
      </div>

      {/* Track Info */}
      <div className="col-span-5 flex items-center space-x-3 min-w-0">
        <img
          src={track.imageUrl}
          alt={track.title}
          className="w-12 h-12 rounded"
        />
        <div className="min-w-0 flex-1">
          <h4 className={`font-medium text-sm truncate ${
            isCurrentTrack ? 'text-blue-400' : 'text-white'
          }`}>
            {track.title}
          </h4>
          {showArtist && track.artist && (
            <button
              onClick={handleArtistClick}
              className="text-xs text-gray-400 truncate hover:text-white hover:underline transition-colors text-left block"
            >
              {track.artist.name}
            </button>
          )}
        </div>
      </div>

      {/* Album */}
      {showAlbum && (
        <div className="col-span-3 flex items-center">
          <span className="text-sm text-gray-400 truncate">{track.album || 'Unknown Album'}</span>
        </div>
      )}

      {/* Genre */}
      <div className="col-span-2 flex items-center">
        <span className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full">
          {track.genre || 'Unknown'}
        </span>
      </div>

      {/* Duration & Like */}
      <div className="col-span-1 flex items-center justify-end gap-4">
        <span className="text-sm text-gray-400">
          {formatTime(track.duration)}
        </span>
        <button
          onClick={handleLike}
          disabled={liking}
          className={`opacity-0 group-hover:opacity-100 transition-all ${
            isLiked ? 'text-pink-400' : 'text-gray-400 hover:text-pink-400'
          }`}
        >
          <i className={`${isLiked ? 'fas' : 'far'} fa-heart`}></i>
        </button>
      </div>
    </div>
  );
};

export default TrackItem;