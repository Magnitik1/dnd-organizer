import { useState, useEffect } from 'react';

export default function Notepad() {
  const [notes, setNotes] = useState([]);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    const savedNotes = localStorage.getItem('dnd-notepad');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  const handleSaveNotes = (updatedNotes) => {
    setNotes(updatedNotes);
    localStorage.setItem('dnd-notepad', JSON.stringify(updatedNotes));
  };

  const addNote = () => {
    if (!newTitle.trim()) return;
    const newNote = { id: Date.now(), title: newTitle, content: '' };
    handleSaveNotes([...notes, newNote]);
    setNewTitle('');
  };

  const updateNote = (id, content) => {
    const updatedNotes = notes.map(note =>
      note.id === id ? { ...note, content } : note
    );
    handleSaveNotes(updatedNotes);
  };

  const deleteNote = (id) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    handleSaveNotes(updatedNotes);
  };

  return (
    <div className="npc-detail" style={{ overflowY: 'hidden', width: '100%', height: '100%' }}> {/* Reuse npc-detail for consistent padding, border, etc. */}
      <h1>Notepad</h1> {/* Styled via CSS: centered, accent color */}
      <div style={{ marginBottom: '2vw', display: 'flex', gap: '1vw' }}>
        <input
          type="text"
          placeholder="New note title..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          style={{
            flex: 1,
            padding: '1vw',
            backgroundColor: 'var(--bg-sidebar)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '1.6vmin',
          }}
        />
        <button
          onClick={addNote}
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
          Add Note
        </button>
      </div>
      <div style={{ 
        overflowY: 'auto', 
        maxHeight: 'calc(100vh - 20vh)', // Adaptive: full available height minus header/add form (adjust 20vh as needed)
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '2vw',
        width: '100%', // Fill full width of npc-detail
        paddingBottom: '5vw' // Extra padding for scrollbar space
      }}>
        {notes.map(note => (  
          <div key={note.id} style={{ 
            flex: '1 1 20vw', // Adaptive: ~3 columns on wide screens, wraps to fewer on narrow
            minWidth: '45%', // Minimum width for small screens
            border: '1px solid var(--border)', 
            borderRadius: '8px', 
            padding: '1vw', 
            backgroundColor: 'var(--bg-sidebar)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'hidden',
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '1vw' 
            }}>
              <h2 style={{ fontSize: '2vmin', color: 'var(--accent)', margin: 0 }}>{note.title}</h2>
              <button
                onClick={() => deleteNote(note.id)}
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
            <textarea
              value={note.content}
              onChange={(e) => updateNote(note.id, e.target.value)}
              placeholder="Enter your notes here..."
              style={{
                flex: 1, // Fill available space in card
                width: '100%',
                minHeight: '20vh', // Minimum height, adaptive to content
                padding: '1vw',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '1.6vmin',
                resize: 'vertical', // Allow vertical resize for adaptability
                overflowY: 'auto', // Custom scrollbar
              }}
            />
          </div>
        ))}
        {notes.length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', width: '100%' }}>No notes yet. Add one above!</p>
        )}
      </div>
    </div>
  );
}