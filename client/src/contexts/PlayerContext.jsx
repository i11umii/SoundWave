import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { userAPI } from '../utils/api';

const PlayerContext = createContext();

export function usePlayer() {
  return useContext(PlayerContext);
}

export function PlayerProvider(props) {
  const children = props.children;

  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const [likedTrackIds, setLikedTrackIds] = useState([]);
  const [followedArtistIds, setFollowedArtistIds] = useState([]);
  const lastHistoryTrackIdRef = useRef(null);


  async function refreshLikedTracks() {
    console.log('PlayerContext: refreshLikedTracks');

    const token = localStorage.getItem('token');
    if (!token) {
      setLikedTrackIds([]);
      return;
    }

    try {
      const res = await userAPI.getLikedTracks();

      let tracks = [];
      if (res && res.data && res.data.data) {
        tracks = res.data.data;
      }

      // берём только id треков
      const ids = tracks.map((t) => t._id);

      setLikedTrackIds(ids);
      console.log('PlayerContext: likedTrackIds loaded', ids.length);
    } catch (error) {
      console.log(error);
    }
  }

  async function refreshFollowedArtists() {
    console.log('PlayerContext: refreshFollowedArtists');

    const token = localStorage.getItem('token');
    if (!token) {
      setFollowedArtistIds([]);
      return;
    }

    try {
      const res = await userAPI.getFollowedArtists();

      let artists = [];
      if (res && res.data && res.data.data) {
        artists = res.data.data;
      }

      // берём только id артистов
      const ids = artists.map((a) => a._id);

      setFollowedArtistIds(ids);
      console.log('PlayerContext: followedArtistIds loaded', ids.length);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    const trackId = currentTrack ? currentTrack._id : null;
    if (!trackId) {
      return;
    }

    // если это тот же трек, второй раз не пишем
    if (lastHistoryTrackIdRef.current === trackId) {
      return;
    }

    lastHistoryTrackIdRef.current = trackId;

    console.log('PlayerContext: add to recently played', trackId);

    const run = async () => {
      try {
        await userAPI.addRecentlyPlayed(trackId);
        console.log('PlayerContext: recently played updated');
      } catch (error) {
        console.log(error);
      }
    };

    run();
  }, [currentTrack ? currentTrack._id : null]);


  useEffect(() => {
    console.log('PlayerContext: mount');
    refreshLikedTracks();
    refreshFollowedArtists();
  }, []);

  function isTrackLiked(trackId) {
    if (!trackId) {
      return false;
    }

    const id = trackId.toString();

    for (let i = 0; i < likedTrackIds.length; i += 1) {
      if (likedTrackIds[i] === id) {
        return true;
      }
    }

    return false;
  }

  function toggleLikeLocally(trackId) {
    if (!trackId) {
      return;
    }

    const id = trackId.toString();

    setLikedTrackIds(function (prev) {
      const next = [];
      let found = false;

      for (let i = 0; i < prev.length; i += 1) {
        if (prev[i] === id) {
          found = true;
        } else {
          next.push(prev[i]);
        }
      }

      if (!found) {
        next.push(id);
      }

      return next;
    });
  }

  function isArtistFollowed(artistId) {
    if (!artistId) {
      return false;
    }

    const id = artistId.toString();

    for (let i = 0; i < followedArtistIds.length; i += 1) {
      if (followedArtistIds[i] === id) {
        return true;
      }
    }

    return false;
  }

  function toggleFollowLocally(artistId) {
    if (!artistId) {
      return;
    }

    const id = artistId.toString();

    setFollowedArtistIds(function (prev) {
      const next = [];
      let found = false;

      for (let i = 0; i < prev.length; i += 1) {
        if (prev[i] === id) {
          found = true;
        } else {
          next.push(prev[i]);
        }
      }

      if (!found) {
        next.push(id);
      }

      return next;
    });
  }

  function play(track) {
    console.log('PlayerContext: play', track ? track._id : null);

    // включаем воспроизведение (даже если трек уже выбран где-то выше)
    setIsPlaying(true);

    if (!track) {
      return;
    }

    setCurrentTrack(track);

    setPlaylist(function (prevPlaylist) {
      const safePlaylist = Array.isArray(prevPlaylist) ? prevPlaylist : [];

      let alreadyInPlaylist = false;
      for (let i = 0; i < safePlaylist.length; i += 1) {
        const t = safePlaylist[i];
        if (t && t._id && track._id && t._id === track._id) {
          alreadyInPlaylist = true;
        }
      }

      if (alreadyInPlaylist) {
        return safePlaylist;
      }

      const next = [];
      next.push(track);
      for (let i = 0; i < safePlaylist.length; i += 1) {
        next.push(safePlaylist[i]);
      }

      return next;
    });
  }

  function pause() {
    console.log('PlayerContext: pause');
    setIsPlaying(false);
  }

  const value = {
    currentTrack: currentTrack,
    playlist: playlist,
    isPlaying: isPlaying,
    setPlaylist: setPlaylist,
    setCurrentTrack: setCurrentTrack,
    play: play,
    pause: pause,

    likedTrackIds: likedTrackIds,
    refreshLikedTracks: refreshLikedTracks,
    isTrackLiked: isTrackLiked,
    toggleLikeLocally: toggleLikeLocally,

    followedArtistIds: followedArtistIds,
    refreshFollowedArtists: refreshFollowedArtists,
    isArtistFollowed: isArtistFollowed,
    toggleFollowLocally: toggleFollowLocally,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
