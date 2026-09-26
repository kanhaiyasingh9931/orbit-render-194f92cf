import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import AttachmentManager from './AttachmentManager';
import './NoteEditor.css'; // Assuming you have some basic styles

/**
 * NoteEditor component
 *
 * Props:
 * - note: { id, title, content, attachments } // attachments are array of attachment metadata
 * - onSave: (updatedNote) => void
 * - onBack: () => void
 *
 * The component allows editing the note's title, content and managing file attachments.
 * Attachments are stored locally in component state until the note is saved.
 */
const NoteEditor = ({ note, onSave, onBack }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [attachments, setAttachments] = useState(note?.attachments || []);
  const [isSaving, setIsSaving] = useState(false);

  // Sync with incoming note changes (e.g., when selecting a different note)
  useEffect(() => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
    setAttachments(note?.attachments || []);
  }, [note]);

  /**
   * Handles addition of new files.
   * Generates a temporary attachment object for each file.
   */
  const handleAddAttachments = useCallback(
    (files) => {
      const newAttachments = Array.from(files).map((file) => ({
        id: uuidv4(),
        fileName: file.name,
        fileType: file.type,
        size: file.size,
        // Store the actual File object for later upload
        file,
        // Create a preview URL for images / videos (optional)
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        // Mark as new so the backend knows it needs to be uploaded
        isNew: true,
      }));
      setAttachments((prev) => [...prev, ...newAttachments]);
    },
    [setAttachments]
  );

  /**
   * Handles removal of an attachment.
   * If the attachment was already persisted (has a storagePath), we keep its id
   * so the backend can delete it. Otherwise we just drop it from the list.
   */
  const handleRemoveAttachment = useCallback(
    (attachmentId) => {
      setAttachments((prev) =>
        prev.filter((att) => {
          // Revoke any created object URLs to avoid memory leaks
          if (att.previewUrl) {
            URL.revokeObjectURL(att.previewUrl);
          }
          return att.id !== attachmentId;
        })
      );
    },
    [setAttachments]
  );

  const handleSave = async () => {
    if (!title.trim()) {
      // Simple validation: title is required
      alert('Please provide a title for the note.');
      return;
    }

    setIsSaving(true);
    try {
      const updatedNote = {
        ...note,
        title: title.trim(),
        content,
        attachments,
        updatedAt: new Date().toISOString(),
      };
      await onSave(updatedNote);
    } catch (err) {
      console.error('Error saving note:', err);
      alert('An error occurred while saving the note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    // Ctrl+S / Cmd+S shortcut for saving
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="note-editor" onKeyDown={handleKeyDown} tabIndex={-1}>
      <div className="note-editor-header">
        <input
          type="text"
          className="note-title-input"
          placeholder="Note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSaving}
        />
      </div>

      <textarea
        className="note-content-textarea"
        placeholder="Start writing your note here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isSaving}
      />

      <AttachmentManager
        attachments={attachments}
        onAdd={handleAddAttachments}
        onRemove={handleRemoveAttachment}
        disabled={isSaving}
      />

      <div className="note-editor-actions">
        <button type="button" className="btn btn-secondary" onClick={onBack} disabled={isSaving}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
};

NoteEditor.propTypes = {
  /** The note object being edited. */
  note: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    content: PropTypes.string,
    attachments: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        fileName: PropTypes.string.isRequired,
        fileType: PropTypes.string,
        size: PropTypes.number,
        storagePath: PropTypes.string, // optional, present if already uploaded
        previewUrl: PropTypes.string,
        isNew: PropTypes.bool,
      })
    ),
  }).isRequired,
  /** Callback invoked with the updated note when the user saves. */
  onSave: PropTypes.func.isRequired,
  /** Callback invoked when the user cancels editing (goes back to list). */
  onBack: PropTypes.func.isRequired,
};

export default NoteEditor;
