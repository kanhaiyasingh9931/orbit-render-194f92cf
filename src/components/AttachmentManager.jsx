import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Helper: format bytes into a human‑readable string.
 */
const formatSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

/**
 * Helper: return a simple emoji/icon based on MIME type.
 */
const getIconForType = (type) => {
  if (type.startsWith('image/')) return '🖼️';
  if (type.startsWith('video/')) return '🎞️';
  if (type.startsWith('audio/')) return '🎵';
  if (type === 'application/pdf') return '📄';
  return '📎';
};

/**
 * AttachmentManager
 *
 * Props
 * -----
 * attachments : Array<{ id, fileName, fileType, size, url }>
 *   Current list of attachments to display.
 *
 * onAdd : (newAttachments: Array) => void
 *   Callback invoked when the user selects new files. The callback receives
 *   an array of attachment objects (including a generated `id` and a temporary
 *   `url` created via URL.createObjectURL).
 *
 * onRemove : (id: string) => void
 *   Callback invoked when the user clicks the remove button for an attachment.
 *
 * maxFileSize : number (optional)
 *   Maximum allowed file size in bytes. Defaults to 10 MiB.
 *
 * allowedTypes : string (optional)
 *   Comma‑separated list of MIME types that are accepted (passed to the
 *   `<input type="file">` element). If omitted, all types are accepted.
 */
const AttachmentManager = ({
  attachments,
  onAdd,
  onRemove,
  maxFileSize = 10 * 1024 * 1024, // 10 MiB
  allowedTypes,
}) => {
  const [error, setError] = useState('');

  // Revoke object URLs when component unmounts to avoid memory leaks.
  useEffect(() => {
    return () => {
      attachments.forEach((att) => {
        if (att.url) {
          URL.revokeObjectURL(att.url);
        }
      });
    };
  }, [attachments]);

  const handleFileSelect = useCallback(
    (e) => {
      setError('');
      const files = Array.from(e.target.files);
      if (!files.length) return;

      const oversized = files.find((f) => f.size > maxFileSize);
      if (oversized) {
        setError(
          `File “${oversized.name}” exceeds the maximum size of ${formatSize(
            maxFileSize,
          )}.`,
        );
        e.target.value = '';
        return;
      }

      const newAttachments = files.map((file) => ({
        id: uuidv4(),
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        size: file.size,
        // Store the original File object for later upload handling.
        file,
        // Create a temporary URL for preview purposes.
        url: URL.createObjectURL(file),
      }));

      onAdd(newAttachments);
      e.target.value = ''; // Reset the input so the same file can be selected again if needed.
    },
    [maxFileSize, onAdd],
  );

  const handleRemove = (id, url) => {
    // Revoke the preview URL immediately.
    if (url) {
      URL.revokeObjectURL(url);
    }
    onRemove(id);
  };

  return (
    <div className="attachment-manager">
      <div className="attachment-input-wrapper">
        <label className="attachment-label">
          <input
            type="file"
            multiple
            accept={allowedTypes}
            onChange={handleFileSelect}
            className="attachment-input"
          />
          <span className="attachment-button">Add Files</span>
        </label>
        {error && <div className="attachment-error">{error}</div>}
      </div>

      {attachments.length > 0 && (
        <ul className="attachment-list">
          {attachments.map((att) => (
            <li key={att.id} className="attachment-item">
              <div className="attachment-preview">
                {att.fileType?.startsWith('image/') && att.url ? (
                  <img
                    src={att.url}
                    alt={att.fileName}
                    className="attachment-thumb"
                  />
                ) : (
                  <span className="attachment-icon">
                    {getIconForType(att.fileType)}
                  </span>
                )}
              </div>
              <div className="attachment-details">
                <span className="attachment-name">{att.fileName}</span>
                <span className="attachment-size">{formatSize(att.size)}</span>
              </div>
              <button
                type="button"
                className="attachment-remove-btn"
                onClick={() => handleRemove(att.id, att.url)}
                aria-label={`Remove ${att.fileName}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Simple styling – in a real project this would be moved to a CSS/SCSS file */}
      <style jsx>{`
        .attachment-manager {
          margin-top: 1rem;
        }
        .attachment-input-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .attachment-label {
          cursor: pointer;
          display: inline-flex;
          align-items: center;
        }
        .attachment-input {
          display: none;
        }
        .attachment-button {
          background: #0069d9;
          color: #fff;
          padding: 0.4rem 0.8rem;
          border-radius: 4px;
          font-size: 0.9rem;
        }
        .attachment-button:hover {
          background: #0053b3;
        }
        .attachment-error {
          color: #d9534f;
          font-size: 0.85rem;
        }
        .attachment-list {
          list-style: none;
          padding: 0;
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .attachment-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #f8f9fa;
          padding: 0.5rem;
          border-radius: 4px;
        }
        .attachment-preview {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }
        .attachment-thumb {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .attachment-icon {
          font-size: 1.5rem;
        }
        .attachment-details {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }
        .attachment-name {
          font-weight: 500;
        }
        .attachment-size {
          font-size: 0.85rem;
          color: #6c757d;
        }
        .attachment-remove-btn {
          background: transparent;
          border: none;
          color: #dc3545;
          font-size: 1.2rem;
          cursor: pointer;
        }
        .attachment-remove-btn:hover {
          color: #c82333;
        }
      `}</style>
    </div>
  );
};

AttachmentManager.propTypes = {
  attachments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      fileName: PropTypes.string.isRequired,
      fileType: PropTypes.string.isRequired,
      size: PropTypes.number.isRequired,
      url: PropTypes.string,
      // `file` is optional – present only for newly added items that haven’t been uploaded yet.
      file: PropTypes.instanceOf(File),
    }),
  ).isRequired,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  maxFileSize: PropTypes.number,
  allowedTypes: PropTypes.string,
};

export default AttachmentManager;