import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export default function ChapterForm({ chapter, onSubmit, onClose, loading }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    chapter_number: 1,
    status: 'draft',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (chapter) {
      setForm({
        title: chapter.title || '',
        description: chapter.description || '',
        chapter_number: chapter.chapter_number || 1,
        status: chapter.status || 'draft',
      })
    }
  }, [chapter])

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }))
    setErrors((p) => ({ ...p, [field]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    const n = parseInt(form.chapter_number)
    if (!n || n < 1) errs.chapter_number = 'Must be a positive number'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      chapter_number: parseInt(form.chapter_number),
      status: form.status,
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {chapter ? 'Edit Chapter' : 'Add New Chapter'}
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Row: chapter number + status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap-md)' }}>
              <div className="form-group">
                <label className="form-label">Chapter Number</label>
                <input
                  className={`form-input${errors.chapter_number ? ' error' : ''}`}
                  type="number"
                  min="1"
                  value={form.chapter_number}
                  onChange={set('chapter_number')}
                />
                {errors.chapter_number && (
                  <span className="field-error">{errors.chapter_number}</span>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-input form-select"
                  value={form.status}
                  onChange={set('status')}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Chapter Title</label>
              <input
                className={`form-input${errors.title ? ' error' : ''}`}
                type="text"
                value={form.title}
                onChange={set('title')}
                placeholder="e.g. The Beginning"
                autoFocus
              />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Description <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span></label>
              <textarea
                className="form-input form-textarea"
                value={form.description}
                onChange={set('description')}
                placeholder="Brief summary of this chapter…"
                rows={3}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <><span className="spinner spinner-sm" /> Saving…</>
              ) : chapter ? 'Update Chapter' : 'Create Chapter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
