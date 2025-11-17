import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../contexts/PlayerContext';
import { userAPI } from '../utils/api';

const MusicPlayer = () => {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const {
    currentTrack,
    isPlaying,
    playlist,
    setCurrentTrack,
    play,
    pause,
    nextTrack,
    previousTrack
  } = usePlayer();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('off');
  const [trackAdded, setTrackAdded] = useState(false);

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Отправка Now Playing в Live Feed
  useEffect(() => {
    if (currentTrack && isPlaying && !trackAdded) {
      // Добавляем в Recently Played
      userAPI.addToRecentlyPlayed(currentTrack._id).catch(console.error);
      
      // Отправляем в Live Feed
      userAPI.setNowPlaying(currentTrack._id, '', '').catch(console.error);
      
      setTrackAdded(true);
      
      console.log('✅ Now playing sent to live feed:', currentTrack.title);
    }
    
    // Сбрасываем флаг когда трек меняется
    if (!currentTrack) {
      setTrackAdded(false);
    }
  }, [currentTrack, isPlaying, trackAdded]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => console.error('Play error:', err));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.load();
      setTrackAdded(false); // Сбрасываем флаг при смене трека
      
      if (isPlaying) {
        audioRef.current.play().catch(err => console.error('Play error:', err));
      }
    }
  }, [currentTrack]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setTrackAdded(false); // Сбрасываем для следующего трека
    
    if (repeat === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (repeat === 'all') {
      handleNextTrack();
    } else {
      const currentIndex = playlist.findIndex(t => t._id === currentTrack?._id);
      if (currentIndex < playlist.length - 1) {
        handleNextTrack();
      } else {
        pause();
      }
    }
  };

  const handleNextTrack = () => {
    if (playlist.length === 0) return;
    setTrackAdded(false);

    const currentIndex = playlist.findIndex(t => t._id === currentTrack?._id);
    
    if (shuffle) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * playlist.length);
      } while (randomIndex === currentIndex && playlist.length > 1);
      
      setCurrentTrack(playlist[randomIndex]);
    } else {
      const nextIndex = (currentIndex + 1) % playlist.length;
      setCurrentTrack(playlist[nextIndex]);
    }
  };

  const handlePreviousTrack = () => {
    if (playlist.length === 0) return;
    setTrackAdded(false);

    if (currentTime > 3) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      return;
    }

    const currentIndex = playlist.findIndex(t => t._id === currentTrack?._id);
    
    if (shuffle) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * playlist.length);
      } while (randomIndex === currentIndex && playlist.length > 1);
      
      setCurrentTrack(playlist[randomIndex]);
    } else {
      const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
      setCurrentTrack(playlist[prevIndex]);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleShuffle = () => {
    setShuffle(!shuffle);
  };

  const toggleRepeat = () => {
    const modes = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeat);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeat(modes[nextIndex]);
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleArtistClick = (e) => {
    e.stopPropagation();
    if (currentTrack?.artist?._id) {
      navigate(`/artist/${currentTrack.artist._id}`);
    }
  };

  if (!currentTrack) return null;

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-4 py-3 z-40">
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />

        <div className="max-w-screen-2xl mx-auto">
          <div className="mb-3">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer player-slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progressPercentage}%, #334155 ${progressPercentage}%, #334155 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img
                src={currentTrack.imageUrl}
                alt={currentTrack.title}
                className="w-14 h-14 rounded"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-medium truncate">{currentTrack.title}</h4>
                {currentTrack.artist && (
                  <button
                    onClick={handleArtistClick}
                    className="text-sm text-slate-400 hover:text-white hover:underline truncate block"
                  >
                    {currentTrack.artist.name}
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleShuffle}
                className={`transition-colors ${shuffle ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
                title="Shuffle"
              >
                <i className="fas fa-random"></i>
              </button>

              <button
                onClick={handlePreviousTrack}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <i className="fas fa-step-backward text-xl"></i>
              </button>

              <button
                onClick={togglePlay}
                className="w-10 h-10 bg-white text-slate-900 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
              >
                <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} ${!isPlaying && 'ml-1'}`}></i>
              </button>

              <button
                onClick={handleNextTrack}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <i className="fas fa-step-forward text-xl"></i>
              </button>

              <button
                onClick={toggleRepeat}
                className={`transition-colors ${repeat !== 'off' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
                title={`Repeat: ${repeat}`}
              >
                <i className={`fas ${repeat === 'one' ? 'fa-repeat-1' : 'fa-repeat'}`}></i>
              </button>
            </div>

            <div className="flex items-center gap-3 flex-1 justify-end">
              <button
                onClick={toggleMute}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <i className={`fas ${isMuted || volume === 0 ? 'fa-volume-mute' : volume < 0.5 ? 'fa-volume-down' : 'fa-volume-up'}`}></i>
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-24 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer volume-slider"
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .player-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        .player-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
        
        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
        }
        .volume-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </>
  );
};

export default MusicPlayer;