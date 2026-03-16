import { useState } from 'react'
import { Pencil, Trash2, Video, Globe, FileText, MoreVertical, X } from 'lucide-react'
import VideoUploader from './VideoUploader'
import ConfirmDialog from '../ui/ConfirmDialog'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ChapterCard({ chapter, onEdit, onDelete, onUpdated, listView }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete(chapter.id)
    setDeleting(false)
    setConfirmDelete(false)
  }

  if (listView) {
    return (
      <div className="chapter-card list-item">
        <div className="chapter-number-badge" style={{ marginRight: 'var(--gap)' }}>
          Ch. {chapter.chapter_number}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="chapter-title" style={{ fontSize: '0.9rem' }}>{chapter.title}</div>
          {chapter.description && (
            <div className="chapter-description" style={{ WebkitLineClamp: 1, fontSize: '0.8rem' }}>
              {chapter.description}
            </div>
          )}
        </div>
        <div className="chapter-actions">
          <span
            className="chapter-status-badge"
            style={{
              background: chapter.status === 'published' ? 'var(--success-muted)' : 'var(--bg-elevated)',
              color: chapter.status === 'published' ? 'var(--success)' : 'var(--text-3)',
            }}
          >
            {chapter.status}
          </span>
          {chapter.video_filename ? (
            <span className="has-video-dot" title="Has video" />
          ) : (
            <span className="no-video-dot" title="No video" />
          )}
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onEdit(chapter)} title="Edit">
            <Pencil size={14} />
          </button>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            style={{ color: 'var(--error)' }}
            onClick={() => setConfirmDelete(true)}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>

        <ConfirmDialog
          isOpen={confirmDelete}
          title="Delete chapter?"
          message={`"${chapter.title}" and its video will be permanently removed.`}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      </div>
    )
  }

  return (
    <div className="chapter-card">
      {/* Video */}
      <div className="chapter-video-area">
        <VideoUploader chapter={chapter} onUpdated={onUpdated} />
      </div>

      {/* Header */}
      <div className="chapter-card-header">
        <div className="chapter-number-badge">
          <Video size={11} />
          Ch. {chapter.chapter_number}
        </div>
        <div className="chapter-actions">
          <span
            className="chapter-status-badge"
            style={{
              background: chapter.status === 'published' ? 'var(--success-muted)' : 'var(--bg-elevated)',
              color: chapter.status === 'published' ? 'var(--success)' : 'var(--text-3)',
            }}
          >
            {chapter.status === 'published' ? <Globe size={10} /> : <FileText size={10} />}
            {chapter.status}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="chapter-card-body">
        <div className="chapter-title">{chapter.title}</div>
        {chapter.description && (
          <p className="chapter-description">{chapter.description}</p>
        )}
      </div>

      {/* Footer */}
      <div className="chapter-card-footer">
        <div className="chapter-meta">
          <span>{formatDate(chapter.created_at)}</span>
        </div>
        <div className="chapter-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onEdit(chapter)}
            title="Edit chapter"
          >
            <Pencil size={13} /> Edit
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => setConfirmDelete(true)}
            title="Delete chapter"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Delete chapter?"
        message={`"${chapter.title}" and its video will be permanently removed. This cannot be undone.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}
