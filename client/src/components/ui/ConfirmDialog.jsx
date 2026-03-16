import { AlertTriangle, Trash2, X } from 'lucide-react'

export default function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  confirmVariant = 'btn-danger',
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body" style={{ gap: 0, padding: 'var(--gap-xl)' }}>
          <div
            className="confirm-icon-wrap"
            style={{
              background: confirmVariant === 'btn-danger' ? 'var(--error-muted)' : 'var(--warning-muted)',
            }}
          >
            {confirmVariant === 'btn-danger'
              ? <Trash2 size={22} color="var(--error)" />
              : <AlertTriangle size={22} color="var(--warning)" />
            }
          </div>
          <div className="confirm-title">{title}</div>
          {message && <p className="confirm-message">{message}</p>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className={`btn ${confirmVariant}`} onClick={onConfirm} disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-sm">
                <span className="spinner spinner-sm" />
                Deleting...
              </span>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
