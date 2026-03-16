import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, Video, CheckCircle, FileText, HardDrive,
  Plus, ArrowRight, Clock
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api, { getErrorMessage } from '../api/client'

function StatCard({ icon, value, label, color, bg }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg }}>
        {icon}
      </div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function DashboardPage() {
  const { author } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/stats')
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="dashboard-page">
      {/* Welcome banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h2>{greeting()}, {author?.author_name?.split(' ')[0] || 'Author'}!</h2>
          <p>
            {author?.book_title
              ? `Working on "${author.book_title}"`
              : 'Start adding chapters to your book'}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/chapters')}
        >
          <Plus size={16} />
          Add Chapter
        </button>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="page-loader" style={{ minHeight: 120 }}>
          <div className="spinner" />
        </div>
      ) : (
        <div className="stats-grid">
          <StatCard
            icon={<BookOpen size={22} color="var(--primary)" />}
            value={stats?.total_chapters ?? 0}
            label="Total Chapters"
            bg="var(--primary-muted)"
          />
          <StatCard
            icon={<Video size={22} color="var(--success)" />}
            value={stats?.videos_uploaded ?? 0}
            label="Videos Uploaded"
            bg="var(--success-muted)"
          />
          <StatCard
            icon={<CheckCircle size={22} color="var(--info)" />}
            value={stats?.published_chapters ?? 0}
            label="Published"
            bg="var(--info-muted)"
          />
          <StatCard
            icon={<FileText size={22} color="var(--text-2)" />}
            value={stats?.draft_chapters ?? 0}
            label="Drafts"
            bg="var(--bg-elevated)"
          />
          <StatCard
            icon={<HardDrive size={22} color="var(--warning)" />}
            value={stats?.total_storage_formatted ?? '0 B'}
            label="Storage Used"
            bg="var(--warning-muted)"
          />
        </div>
      )}

      {/* Progress bar */}
      {stats && stats.total_chapters > 0 && (
        <div className="card card-padded">
          <div className="flex items-center justify-between" style={{ marginBottom: 'var(--gap)' }}>
            <span className="text-sm font-semibold">Video Coverage</span>
            <span className="text-sm text-muted">
              {stats.videos_uploaded} of {stats.total_chapters} chapters have videos
            </span>
          </div>
          <div className="upload-progress-bar" style={{ height: 8 }}>
            <div
              className="upload-progress-fill"
              style={{
                width: `${Math.round((stats.videos_uploaded / stats.total_chapters) * 100)}%`
              }}
            />
          </div>
          <div className="flex items-center justify-between" style={{ marginTop: 6 }}>
            <span className="text-xs text-muted">
              {Math.round((stats.videos_uploaded / stats.total_chapters) * 100)}% complete
            </span>
            <span className="text-xs text-muted">
              {stats.total_chapters - stats.videos_uploaded} remaining
            </span>
          </div>
        </div>
      )}

      {/* Recent chapters */}
      {stats?.recent_chapters?.length > 0 && (
        <div>
          <div className="flex items-center justify-between" style={{ marginBottom: 'var(--gap-md)' }}>
            <span className="section-title">
              <Clock size={16} />
              Recent Activity
            </span>
            <button
              className="btn btn-ghost btn-sm flex items-center gap-sm"
              onClick={() => navigate('/chapters')}
            >
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div className="card">
            {stats.recent_chapters.map((ch, i) => (
              <div
                key={ch.id}
                className="recent-chapter-item"
                onClick={() => navigate('/chapters')}
                style={i > 0 ? { borderTop: '1px solid var(--border)' } : {}}
              >
                <div className="recent-chapter-num">
                  {ch.chapter_number}
                </div>
                <div className="recent-chapter-info">
                  <div className="recent-chapter-title">{ch.title}</div>
                  <div className="recent-chapter-meta">
                    {ch.video_filename ? 'Has video' : 'No video'} · Added {formatDate(ch.created_at)}
                  </div>
                </div>
                <span
                  className="chapter-status-badge"
                  style={{
                    background: ch.status === 'published' ? 'var(--success-muted)' : 'var(--bg-elevated)',
                    color: ch.status === 'published' ? 'var(--success)' : 'var(--text-3)',
                  }}
                >
                  {ch.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && stats?.total_chapters === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <BookOpen size={28} />
          </div>
          <div className="empty-title">No chapters yet</div>
          <p className="empty-subtitle">
            Add your first chapter to start building your book video library.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/chapters')}>
            <Plus size={16} /> Add First Chapter
          </button>
        </div>
      )}
    </div>
  )
}
