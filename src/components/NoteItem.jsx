import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { FaEdit, FaTrash } from 'react-icons/fa';
import './NoteItem.css';

/**
 * NoteItem – displays a single note in the list view.
 *
 * Props
 * -----
 * note: {
 *   id: string,
 *   title: string,
 *   content: string,
 *   createdAt: string | number | Date,
 *   updatedAt: string | number | Date,
 *   attachments?: Array<any>
 * }
 * selected: boolean – whether this note is currently active/selected.
 * onEdit: (id: string) => void – called when the edit button is clicked.
 * onDelete: (id: string) => void – called when the delete button is clicked.
 * onSelect: (id: string) => void – called when the row itself is clicked.
 */
const NoteItem = ({
  note,
  selected = false,
  onEdit,
  onDelete,
  onSelect,
}) => {
  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(note.id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    // Simple confirmation – can be replaced by a modal in the parent.
    if (window.confirm('Delete this note? This action cannot be undone.')) {
      onDelete(note.id);
    }
  };

  const handleSelect = () => {
    onSelect(note.id);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Show first 120 characters of content as a snippet.
  const snippet = note.content
    ? `${note.content.replace(/\s+/g, ' ').trim().slice(0, 120)}${
        note.content.length > 120 ? '…' : ''
      }`
    : '';

  const attachmentCount = note.attachments?.length ?? 0;

  return (
    <div
      className={`note-item ${selected ? 'selected' : ''}`}
      onClick={handleSelect}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter') handleSelect();
      }}
    >
      <div className="note-item-main">
        <h3 className="note-item-title">{note.title || 'Untitled'}</h3>
        <p className="note-item-snippet">{snippet}</p>
        <div className="note-item-meta">
          <span className="note-item-date">
            {formatDate(note.updatedAt || note.createdAt)}
          </span>
          {attachmentCount > 0 && (
            <span className="note-item-attachments">
              📎 {attachmentCount}
            </span>
          )}
        </div>
      </div>
      <div className="note-item-actions">
        <button
          type="button"
          className="note-action-btn edit-btn"
          onClick={handleEdit}
          aria-label="Edit note"
        >
          <FaEdit />
        </button>
        <button
          type="button"
          className="note-action-btn delete-btn"
          onClick={handleDelete}
          aria-label="Delete note"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

NoteItem.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    content: PropTypes.string,
    createdAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.instanceOf(Date),
    ]),
    updatedAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.instanceOf(Date),
    ]),
    attachments: PropTypes.array,
  }).isRequired,
  selected: PropTypes.bool,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default memo(NoteItem);