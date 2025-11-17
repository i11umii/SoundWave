import { createContext, useContext, useState, useEffect } from 'react';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  // Загружаем из localStorage
  const [currentTrack, setCurrentTrack] = useState(() => {
    const saved = localStorage.getItem('currentTrack');
    return saved ? JSON.parse(saved) : null;
  });

  const [playlist, setPlaylist] = useState(() => {
    const saved = localStorage.getItem('playlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = localStorage.getItem('currentIndex');
    return saved ? parseInt(saved) : 0;
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('volume');
    return saved ? parseFloat(saved) : 0.6;
  });

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('off'); // 'off', 'all', 'one'
  const [showQueue, setShowQueue] = useState(false);

  // Сохраняем в localStorage при изменении
  useEffect(() => {
    if (currentTrack) {
      localStorage.setItem('currentTrack', JSON.stringify(currentTrack));
    }
  }, [currentTrack]);

  useEffect(() => {
    localStorage.setItem('playlist', JSON.stringify(playlist));
  }, [playlist]);

  useEffect(() => {
    localStorage.setItem('currentIndex', currentIndex.toString());
  }, [currentIndex]);

  useEffect(() => {
    localStorage.setItem('volume', volume.toString());
  }, [volume]);

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const togglePlay = () => setIsPlaying(!isPlaying);

  const playNext = (force = false) => {
    if (repeat === 'one' && !force) {
      setCurrentTime(0);
      return;
    }

    if (currentIndex < playlist.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentTrack(playlist[nextIndex]);
      setIsPlaying(true);
    } else if (repeat === 'all') {
      setCurrentIndex(0);
      setCurrentTrack(playlist[0]);
      setIsPlaying(true);
    }
  };

  const playPrevious = (force = false) => {
    if (currentTime > 3 && !force) {
      setCurrentTime(0);
      return;
    }

    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentTrack(playlist[prevIndex]);
      setIsPlaying(true);
    }
  };

  const playTrackAtIndex = (index) => {
    setCurrentIndex(index);
    setCurrentTrack(playlist[index]);
    setIsPlaying(true);
  };

  const removeFromQueue = (index) => {
    const newPlaylist = playlist.filter((_, i) => i !== index);
    setPlaylist(newPlaylist);
    if (index < currentIndex) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const toggleShuffle = () => setShuffle(!shuffle);
  
  const toggleRepeat = () => {
    if (repeat === 'off') setRepeat('all');
    else if (repeat === 'all') setRepeat('one');
    else setRepeat('off');
  };

  const toggleQueue = () => setShowQueue(!showQueue);

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      setCurrentTrack,
      playlist,
      setPlaylist,
      currentIndex,
      isPlaying,
      volume,
      setVolume,
      currentTime,
      setCurrentTime,
      duration,
      setDuration,
      shuffle,
      repeat,
      showQueue,
      play,
      pause,
      togglePlay,
      playNext,
      playPrevious,
      playTrackAtIndex,
      removeFromQueue,
      toggleShuffle,
      toggleRepeat,
      toggleQueue
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);