import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Search, LayoutGrid, List, SlidersHorizontal, BookOpen
} from 'lucide-react'
import api, { getErrorMessage } from '../api/client'
import { useToast } from '../context/ToastContext'
import ChapterCard from '../components/chapters/ChapterCard'
import ChapterForm from '../components/chapters/ChapterForm'

export default function ChaptersPage() {
  const { toast } = useToast()
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingChapter, setEditingChapter] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [view, setView] = useState('grid') // 'grid' | 'list'
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sort, setSort] = useState('chapter_number')

  const loadChapters = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/chapters', {
        params: { search, status: statusFilter, sort, order: 'asc' }
      })
      setChapters(res.data)
    } catch (err) {
      toast.error('Failed to load', getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, sort])

  useEffect(() => {
    const t = setTimeout(() => loadChapters(), search ? 300 : 0)
    return () => clearTimeout(t)
  }, [loadChapters])

  const openAdd = () => {
    setEditingChapter(null)
    setShowForm(true)
  }

  const openEdit = (chapter) => {
    setEditingChapter(chapter)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingChapter(null)
  }

  const handleFormSubmit = async (data) => {
    setFormLoading(true)
    try {
      if (editingChapter) {
        const res = await api.put(`/api/chapters/${editingChapter.id}`, data)
        setChapters((prev) => prev.map((c) => (c.id === editingChapter.id ? res.data : c)))
        toast.success('Chapter updated', `"${res.data.title}" has been saved.`)
      } else {
        const res = await api.post('/api/chapters', data)
        setChapters((prev) => [...prev, res.data].sort((a, b) => a.chapter_number - b.chapter_number))
        toast.success('Chapter created', `"${res.data.title}" has been added.`)
      }
      closeForm()
    } catch (err) {
      toast.error('Failed to save', getErrorMessage(err))
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/chapters/${id}`)
      setChapters((prev) => prev.filter((c) => c.id !== id))
      toast.success('Chapter deleted', 'The chapter has been removed.')
    } catch (err) {
      toast.error('Delete failed', getErrorMessage(err))
    }
  }

  const handleVideoUpdated = (updated) => {
    setChapters((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
  }

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Chapters</h1>
          <p className="page-subtitle">
            {chapters.length} chapter{chapters.length !== 1 ? 's' : ''} ·{' '}
            {chapters.filter((c) => c.video_filename).length} with video
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Chapter
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ padding: '0 var(--gap-xl) var(--gap-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>
        <div className="chapters-toolbar">
          {/* Search */}
          <div className="search-input-wrapper">
            <Search size={15} className="search-icon" />
            <input
              className="form-input search-input"
              placeholder="Search chapters…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status filter */}
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>

          {/* Sort */}
          <select
            className="filter-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="chapter_number">By chapter #</option>
            <option value="title">By title</option>
            <option value="created_at">By date</option>
          </select>

          {/* View toggle */}
          <div className="view-toggle">
            <button
              className={`view-btn${view === 'grid' ? ' active' : ''}`}
              onClick={() => setView('grid')}
              title="Grid view"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              className={`view-btn${view === 'list' ? ' active' : ''}`}
              onClick={() => setView('list')}
              title="List view"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 var(--gap-xl) var(--gap-xl)' }}>
        {loading ? (
          <div className="page-loader">
            <div className="spinner" />
            <span>Loading chapters…</span>
          </div>
        ) : chapters.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <BookOpen size={28} />
            </div>
            <div className="empty-title">
              {search || statusFilter !== 'all' ? 'No chapters match your filters' : 'No chapters yet'}
            </div>
            <p className="empty-subtitle">
              {search || statusFilter !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Click "Add Chapter" to create your first chapter and start uploading videos.'}
            </p>
            {!search && statusFilter === 'all' && (
              <button className="btn btn-primary" onClick={openAdd}>
                <Plus size={16} /> Add First Chapter
              </button>
            )}
          </div>
        ) : view === 'grid' ? (
          <div className="chapter-grid">
            {chapters.map((ch) => (
              <ChapterCard
                key={ch.id}
                chapter={ch}
                onEdit={openEdit}
                onDelete={handleDelete}
                onUpdated={handleVideoUpdated}
                listView={false}
              />
            ))}
          </div>
        ) : (
          <div className="chapter-list-view card">
            {chapters.map((ch, i) => (
              <div key={ch.id} style={i > 0 ? { borderTop: '1px solid var(--border)' } : {}}>
                <ChapterCard
                  chapter={ch}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onUpdated={handleVideoUpdated}
                  listView
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <ChapterForm
          chapter={editingChapter}
          onSubmit={handleFormSubmit}
          onClose={closeForm}
          loading={formLoading}
        />
      )}
    </div>
  )
}
