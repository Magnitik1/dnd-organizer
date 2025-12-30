import { useState, useEffect, useContext } from 'react';
import { MusicContext } from '../App'; // Импорт из App, где MusicContext

export default function Music() {
  const { playPlaylist } = useContext(MusicContext);
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackUrl, setNewTrackUrl] = useState('');

  useEffect(() => {
    const savedPlaylists = localStorage.getItem('dnd-playlists');
    if (savedPlaylists) {
      setPlaylists(JSON.parse(savedPlaylists));
    }
  }, []);

  const handleSavePlaylists = (updatedPlaylists) => {
    setPlaylists(updatedPlaylists);
    localStorage.setItem('dnd-playlists', JSON.stringify(updatedPlaylists));
  };

  const addPlaylist = () => {
    if (!newPlaylistTitle.trim()) return;
    const newPlaylist = { id: Date.now(), title: newPlaylistTitle, tracks: [] };
    handleSavePlaylists([...playlists, newPlaylist]);
    setNewPlaylistTitle('');
  };

  const deletePlaylist = (id) => {
    const updatedPlaylists = playlists.filter(pl => pl.id !== id);
    handleSavePlaylists(updatedPlaylists);
    if (selectedPlaylistId === id) setSelectedPlaylistId(null);
  };

  const addTrack = (playlistId) => {
    if (!newTrackTitle.trim() || !newTrackUrl.trim()) return;
    const updatedPlaylists = playlists.map(pl => {
      if (pl.id === playlistId) {
        const newTrack = { id: Date.now(), title: newTrackTitle, url: newTrackUrl };
        return { ...pl, tracks: [...pl.tracks, newTrack] };
      }
      return pl;
    });
    handleSavePlaylists(updatedPlaylists);
    setNewTrackTitle('');
    setNewTrackUrl('');
  };

  const deleteTrack = (playlistId, trackId) => {
    const updatedPlaylists = playlists.map(pl => {
      if (pl.id === playlistId) {
        return { ...pl, tracks: pl.tracks.filter(t => t.id !== trackId) };
      }
      return pl;
    });
    handleSavePlaylists(updatedPlaylists);
  };

  const playTrack = (tracks, index, title) => {
    playPlaylist(tracks, index, title);
  };

  const selectedPlaylist = playlists.find(pl => pl.id === selectedPlaylistId);

  return (
    <div className="npc-detail"> {/* Reuse for consistent styling */}
      <h1>Music Playlists</h1>
      <div style={{ marginBottom: '2vw', display: 'flex', gap: '1vw' }}>
        <input
          type="text"
          placeholder="New playlist title..."
          value={newPlaylistTitle}
          onChange={(e) => setNewPlaylistTitle(e.target.value)}
          style={{
            flex: 1,
            padding: '1vw',
            backgroundColor: 'var(--bg-sidebar)',
            color: 'var(--text-contrast)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '1.6vmin',
          }}
        />
        <button
          onClick={addPlaylist}
          style={{
            padding: '1vw 2vw',
            backgroundColor: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1.6vmin',
          }}
        >
          Add Playlist
        </button>
      </div>
      <div style={{
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 20vh)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2vw',
        width: '100%'
      }}>
        {playlists.map(pl => (
          <div key={pl.id} style={{
            flex: '1 1 30%',
            minWidth: '35vw',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '1vw',
            backgroundColor: 'var(--bg-sidebar)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1vw'
            }}>
              <h2
                style={{ fontSize: '2vmin', color: 'var(--accent)', margin: 0, cursor: 'pointer' }}
                onClick={() => {
                  setSelectedPlaylistId(pl.id === selectedPlaylistId ? null : pl.id);
                  if (pl.id !== selectedPlaylistId) playPlaylist(pl.tracks, 0, pl.title); // Авто-воспроизведение всего плейлиста при выборе
                }}
              >
                {pl.title} ({pl.tracks.length} tracks)
              </h2>
              <button
                onClick={() => deletePlaylist(pl.id)}
                style={{
                  padding: '0.5vw 1vw',
                  backgroundColor: 'rgba(100, 1, 1, 1)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1.4vmin',
                }}
              >
                Delete
              </button>
            </div>
            {selectedPlaylistId === pl.id && (
              <>
                <div style={{ display: 'flex', gap: '1vw', marginBottom: '1vw' }}>
                  <input
                    type="text"
                    placeholder="Track title..."
                    value={newTrackTitle}
                    onChange={(e) => setNewTrackTitle(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.5vw',
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-contrast)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      fontSize: '1.4vmin',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="YouTube or audio URL..."
                    value={newTrackUrl}
                    onChange={(e) => setNewTrackUrl(e.target.value)}
                    style={{
                      flex: 2,
                      padding: '0.5vw',
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      fontSize: '1.4vmin',
                    }}
                  />
                  <button
                    onClick={() => addTrack(pl.id)}
                    style={{
                      padding: '0.5vw 1vw',
                      backgroundColor: 'var(--accent)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '1.4vmin',
                    }}
                  >
                    Add Track
                  </button>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, overflowY: 'auto' }}>
                  {pl.tracks.map((track, index) => (
                    <li key={track.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5vw',
                      padding: '0.5vw',
                      backgroundColor: 'var(--bg-main)',
                      borderRadius: '4px'
                    }}>
                      <span
                        style={{ cursor: 'pointer', color: 'var(--text)', fontSize: '1.4vmin' }}
                        onClick={() => playTrack(pl.tracks, index, pl.title)}
                      >
                        {track.title}
                      </span>
                      <button
                        onClick={() => deleteTrack(pl.id, track.id)}
                        style={{
                          padding: '0.3vw 0.6vw',
                          backgroundColor: 'rgba(100, 1, 1, 1)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '1.2vmin',
                        }}
                      >
                        Del
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ))}
        {playlists.length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', width: '100%' }}>No playlists yet. Add one above!</p>
        )}
      </div>
    </div>
  );
}