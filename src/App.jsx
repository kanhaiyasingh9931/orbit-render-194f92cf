import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import './App.css';

const STORAGE_KEY = 'orbit_notes_data';

// Helper to load notes from localStorage
const loadNotes = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Basic validation
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load notes from storage:', e);
  }
  return [];
};

// Helper to save notes to localStorage
const saveNotes = (notes) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes to storage:', e);
  }
};

const App = () => {
  // Global State
  const [notes, setNotes] = useState(loadNotes);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Persist notes to localStorage whenever they change
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Determine if we are in editor view or list view
  const isEditing = activeNoteId !== null;

  // Find the active note object
  const activeNote = notes.find(note => note.id === activeNoteId) || null;

  // --- CRUD Actions ---

  const handleAddNote = useCallback(() => {
    const newNote = {
      id: uuidv4(),
      title: 'New Note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [] // Array of attachment objects
    };
    setNotes(prevNotes => [newNote, ...prevNotes]);
    setActiveNoteId(newNote.id);
  }, []);

  const handleDeleteNote = useCallback((id) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  }, [activeNoteId]);

  const handleUpdateNote = useCallback((updatedNote) => {
    setNotes(prevNotes => {
      return prevNotes.map(note => {
        if (note.id === updatedNote.id) {
          return {
            ...updatedNote,
            updatedAt: new Date().toISOString()
          };
        }
        return note;
      });
    });
  }, []);

  const handleSelectNote = useCallback((id) => {
    setActiveNoteId(id);
  }, []);

  const handleBackToList = useCallback(() => {
    setActiveNoteId(null);
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  // Render Logic
  if (isEditing && activeNote) {
    return (
      <div className="app-container">
        <NoteEditor
          note={activeNote}
          onSave={handleUpdateNote}
          onBack={handleBackToList}
          onDelete={handleDeleteNote}
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      <NoteList
        notes={notes}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onAddNote={handleAddNote}
        onSelectNote={handleSelectNote}
        onDeleteNote={handleDeleteNote}
      />
    </div>
  );
};

export default App;