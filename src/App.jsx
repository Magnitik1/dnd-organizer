import { useState, useEffect, createContext, useContext, useRef } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { 
  FaBook, 
  FaUserFriends, 
  FaFistRaised, 
  FaStickyNote, 
  FaMusic, 
  FaMagic, 
  FaShieldAlt,
  FaCog 
} from 'react-icons/fa';
import Select from 'react-select';
import YouTube from 'react-youtube';

// Pages
import Campaign from './pages/Campaign.jsx';
import NPC from './pages/NPC.jsx';
import Fight from './pages/Fight.jsx';
import Notepad from './pages/Notepad.jsx';
import Music from './pages/Music.jsx';
import Spells from './pages/Spells.jsx';
import Equipment from './pages/Equipment.jsx';
import NPCDetails from './pages/NPCDetails.jsx';
import SpellDetails from './pages/SpellDetails.jsx';
import MagicItemDetails from './pages/MagicItemDetails.jsx';

// Music Context
export const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const [playlist, setPlaylist] = useState([]); // массив {id, title, url}
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef(null); // ref на YouTube или audio элемент

  const playPlaylist = (newPlaylist, startIndex = 0, title = '') => {
    if (newPlaylist.length === 0) return;
    setPlaylist(newPlaylist);
    setPlaylistTitle(title);
    setCurrentIndex(startIndex);
    setIsPlaying(true);
    setCurrentTime(0);
  };

  const playNext = () => {
    const next = (currentIndex + 1) % playlist.length;
    setCurrentIndex(next);
    setIsPlaying(true);
    setCurrentTime(0);
  };

  const playPrev = () => {
    const prev = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentIndex(prev);
    setIsPlaying(true);
    setCurrentTime(0);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (playerRef.current) {
      if (isYouTube(playlist[currentIndex]?.url)) {
        if (!isPlaying) playerRef.current.playVideo();
        else playerRef.current.pauseVideo();
      } else {
        if (!isPlaying) playerRef.current.play();
        else playerRef.current.pause();
      }
    }
  };

  const seekTo = (time) => {
    if (playerRef.current) {
      if (isYouTube(playlist[currentIndex]?.url)) {
        playerRef.current.seekTo(time);
      } else {
        playerRef.current.currentTime = time;
      }
      setCurrentTime(time);
    }
  };

  useEffect(() => {
    let intervalId;
    const updateTime = () => {
      if (playerRef.current && isPlaying) {
        if (isYouTube(playlist[currentIndex]?.url)) {
          setCurrentTime(playerRef.current.getCurrentTime());
          setDuration(playerRef.current.getDuration());
        }
      }
    };

    if (isPlaying && playlist.length > 0 && isYouTube(playlist[currentIndex]?.url)) {
      updateTime();
      intervalId = setInterval(updateTime, 1000);
    }

    return () => clearInterval(intervalId);
  }, [isPlaying, currentIndex, playlist]);

  const currentTrack = playlist.length > 0 ? playlist[currentIndex] : null;

  return (
    <MusicContext.Provider
      value={{
        playlist,
        playlistTitle,
        currentTrack,
        currentIndex,
        isPlaying,
        currentTime,
        duration,
        playPlaylist,
        playNext,
        playPrev,
        togglePlayPause,
        seekTo,
        playerRef,
        setPlaylist
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

function App() {
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('light'); // 'dark' or 'light'
  const [showSettings, setShowSettings] = useState(false);

  const translations = {
    en: {
      campaign: 'Campaign',
      npc: 'NPC',
      fight: 'Combat',
      notepad: 'Notepad',
      music: 'Music',
      spells: 'Spells',
      equipment: 'Equipment',
      settings: 'Settings',
      language: 'Language',
      theme: 'Theme',
      darkFantasy: 'Dark Fantasy',
      lightParchment: 'Light Parchment',
    }
  };
  const t = translations[language];
  const tabs = [
    { name: t.campaign, path: '/campaign', icon: <FaBook />, component: Campaign },
    { name: t.npc, path: '/npc', icon: <FaUserFriends />, component: NPC },
    { name: t.fight, path: '/fight', icon: <FaFistRaised />, component: Fight },
    { name: t.notepad, path: '/notepad', icon: <FaStickyNote />, component: Notepad },
    { name: t.music, path: '/music', icon: <FaMusic />, component: Music },
    { name: t.spells, path: '/spells', icon: <FaMagic />, component: Spells },
    { name: t.equipment, path: '/equipment', icon: <FaShieldAlt />, component: Equipment },
  ];

  return (
    <MusicProvider>
      <BrowserRouter>
        <div className={`app-container ${theme === 'light' ? 'light-theme' : 'dark-theme'}`}>
          {/* Sidebar */}
          <nav className="sidebar-navigation">
            <div className="sidebar-tabs">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span className="tab-name">{tab.name}</span>
                </NavLink>
              ))}
            </div>
            {/* Global Music Player in Sidebar */}
            <GlobalPlayer />
            {/* Settings Toggle Button */}
            <button
              className="settings-toggle"
              onClick={() => setShowSettings(!showSettings)}
            >
              <FaCog />
              <span>{t.settings}</span>
            </button>
          </nav>
          {/* Settings Panel */}
          {/* Settings Panel */}
<div className={`settings-panel ${showSettings ? 'open' : ''}`}>
  <button
    className="close-button"
    onClick={() => setShowSettings(false)}
    aria-label="Close settings"
  >
    ✕
  </button>

  <h3>{t.settings}</h3>

  <div className="setting-group">
  <label>{t.theme}</label>
  
  <Select
    value={{
      value: theme,
      label: theme === 'dark' ? `🌙 ${t.darkFantasy}` : `☀️ ${t.lightParchment}`
    }}
    onChange={(selected) => setTheme(selected.value)}
    options={[
      { value: 'dark', label: `🌙 ${t.darkFantasy}` },
      { value: 'light', label: `☀️ ${t.lightParchment}` }
    ]}
    classNamePrefix="custom-react-select"
    className="theme-select"  // можно без класса, если не нужен flex
    styles={{
      container: (base) => ({
        ...base,
        marginTop: '1vw',
        fontSize: '1.8vmin',
      }),
    }}
    isSearchable={false}
  />
</div>

  {/* Здесь можно добавить другие настройки в будущем */}
</div>

{/* Overlay — клик вне панели закрывает её */}
{showSettings && (
  <div
    className="settings-overlay active"
    onClick={() => setShowSettings(false)}
  />
)}
          {/* Main Content */}
          <main className="tab-content">
            <Routes>
              {tabs.map((tab) => (
                <Route key={tab.path} path={tab.path} element={<tab.component />} />
              ))}
              <Route path="/" element={<Campaign />} />
              <Route path="/npc/:name" element={<NPCDetails />} />
              <Route path="/spell/:name" element={<SpellDetails />} />
              <Route path="/equipment/:name" element={<MagicItemDetails />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </MusicProvider>
  );
}

const GlobalPlayer = () => {
  const {
    currentTrack,
    playlistTitle,
    isPlaying,
    playPrev,
    playNext,
    togglePlayPause,
    playlist,
    currentIndex,
    playerRef,
    currentTime,
    duration,
    seekTo,
    setPlaylist
  } = useContext(MusicContext);

  if (!currentTrack) return null;

  const isYT = isYouTube(currentTrack.url);

  const onReadyYT = (event) => {
    playerRef.current = event.target;
    if (isPlaying) event.target.playVideo();
  };

  const onStateChangeYT = (event) => {
    if (event.data === 0) { // ended
      playNext();
    }
  };

  const onEndedAudio = () => {
    playNext();
  };

  const onTimeUpdateAudio = (e) => {
    setCurrentTime(e.target.currentTime);
  };

  const onLoadedMetadataAudio = (e) => {
    setDuration(e.target.duration);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="global-player">
      <div className="playlist-title">
        {playlistTitle || 'Playlist'} ({currentIndex + 1}/{playlist.length})
      </div>
      <div className="player-info">
        <span>{currentTrack.title}</span>
      </div>

      <div className="player-seek">
        <span>{formatTime(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={(e) => seekTo(parseFloat(e.target.value))}
          step="any"
        />
        <span>{formatTime(duration)}</span>
      </div>

      <div className="player-controls">
        {/* Previous */}
        <button 
          onClick={playPrev} 
          disabled={playlist.length <= 1} 
          className="control-button prev"
          title="Previous"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M6 6h2v12H6zm3.5 6 9 6V6l-9 6z"/>
          </svg>
        </button>

        {/* Play / Pause */}
        <button 
          onClick={togglePlayPause} 
          className="control-button play-pause"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            // Pause icon (two vertical bars)
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          ) : (
            // Play triangle
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>

        {/* Next */}
        <button 
          onClick={playNext} 
          disabled={playlist.length <= 1} 
          className="control-button next"
          title="Next"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </button>
      </div>

      {/* Hidden YouTube / Audio player */}
      <div style={{ position: 'absolute', left: '-9999px' }}>
        {isYT ? (
          <YouTube
            key={currentTrack.id}
            videoId={getYouTubeVideoId(currentTrack.url)}
            opts={{
              height: '0',
              width: '0',
              playerVars: { autoplay: isPlaying ? 1 : 0, loop: 0 },
            }}
            onReady={onReadyYT}
            onStateChange={onStateChangeYT}
          />
        ) : (
          <audio
            ref={playerRef}
            key={currentTrack.id}
            src={currentTrack.url}
            autoPlay={isPlaying}
            loop={false}
            onEnded={onEndedAudio}
            onTimeUpdate={onTimeUpdateAudio}
            onLoadedMetadata={onLoadedMetadataAudio}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
          />
        )}
      </div>

    </div>
  );
};

const isYouTube = (url) => {
  return !!getYouTubeVideoId(url);
};

const getYouTubeVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default App;