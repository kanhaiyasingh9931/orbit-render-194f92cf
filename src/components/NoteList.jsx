import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FaPlus, FaSearch } from 'react-icons/fa';
import NoteItem from './NoteItem';
import './NoteList.css';

/**
 * NoteList
 *
 * Displays a searchable list of notes with actions to add a new note
 * and delete existing ones. The component is deliberately UI‑only;
 * all data mutations are delegated to the parent via callbacks.
 *
 * Props
 * -----
 * notes: Array<{
 *   id: string | number,
 *   title: string,
 *   content: string,
 *   createdAt: string,
 *   updatedAt: string,
 * }>
 * onSelectNote: (noteId) => void
 * onAddNote: () => void
 * onDeleteNote: (noteId) => void
 *
 * The component maintains its own search query state and filters the
 * notes list accordingly. It is memoized to avoid unnecessary renders.
 */
const NoteList = ({
  notes,
  onSelectNote,
  onAddNote,
  onDeleteNote,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(q) ||
        note.content.toLowerCase().includes(q)
    );
  }, [notes, searchQuery]);

  const handleSelect = useCallback(
    (id) => () => {
      onSelectNote(id);
    },
    [onSelectNote]
  );

  const handleDelete = useCallback(
    (id) => (e) => {
      e.stopPropagation(); // Prevent triggering select
      // Simple confirmation; can be replaced with a modal in the future
      // eslint-disable-next-line no-restricted-globals
      if (confirm('Are you sure you want to delete this note?')) {
        onDeleteNote(id);
      }
    },
    [onDeleteNote]
  );

  return (
    <div className="note-list-container">
      <header className="note-list-header">
        <h2 className="note-list-title">Orbit notes 3</h2>
        <button
          type="button"
          className="note-list-add-btn"
          onClick={onAddNote}
          aria-label="Add new note"
        >
          <FaPlus />
        </button>
      </header>

      <div className="note-list-search">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={handleSearchChange}
          aria-label="Search notes"
        />
      </div>

      {filteredNotes.length === 0 ? (
        <p className="note-list-empty">
          {searchQuery ? 'No notes match your search.' : 'No notes available. Click + to add one.'}
        </p>
      ) : (
        <ul className="note-list">
          {filteredNotes.map((note) => (
            <li key={note.id} onClick={handleSelect(note.id)} className="note-list-item">
              <NoteItem
                note={note}
                onEdit={handleSelect(note.id)}
                onDelete={handleDelete(note.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

NoteList.propTypes = {
  notes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      updatedAt: PropTypes.string.isRequired,
    })
  ).isRequired,
  onSelectNote: PropTypes.func.isRequired,
  onAddNote: PropTypes.func.isRequired,
  onDeleteNote: PropTypes.func.isRequired,
};

export default React.memo(NoteList);