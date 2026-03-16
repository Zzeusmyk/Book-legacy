import { useState, useEffect } from 'react'
import { User, BookOpen, Lock, Trash2, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api, { getErrorMessage } from '../api/client'
import ConfirmDialog from '../components/ui/ConfirmDialog'

export default function ProfilePage() {
  const { author, updateAuthor, logout } = useAuth()
  const { toast } = useToast()

  // Profile form
  const [profile, setProfile] = useState({ author_name: '', book_title: '', bio: '' })
  const [profileLoading, setProfileLoading] = useState(false)

  // Password form
  const [pass, setPass] = useState({ current: '', next: '', confirm: '' })
  const [passErrors, setPassErrors] = useState({})
  const [passLoading, setPassLoading] = useState(false)
  const [showPass, setShowPass] = useState({ current: false, next: false, confirm: false })

  // Delete account
  const [deletePass, setDeletePass] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Stats
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (author) {
      setProfile({
        author_name: author.author_name || '',
        book_title: author.book_title || '',
        bio: author.bio || '',
      })
    }
    api.get('/api/stats')
      .then((r) => setStats(r.data))
      .catch(() => {})
  }, [author])

  const setP = (f) => (e) => setProfile((p) => ({ ...p, [f]: e.target.value }))

  const handleProfileSave = async (e) => {
    e.preventDefault()
    if (!profile.author_name.trim() || !profile.book_title.trim()) {
      toast.error('Required fields', 'Author name and book title cannot be empty.')
      return
    }
    setProfileLoading(true)
    try {
      const res = await api.put('/api/auth/profile', profile)
      updateAuthor(res.data)
      toast.success('Profile saved', 'Your information has been updated.')
    } catch (err) {
      toast.error('Save failed', getErrorMessage(err))
    } finally {
      setProfileLoading(false)
    }
  }

  const validatePassword = () => {
    const errs = {}
    if (!pass.current) errs.current = 'Required'
    if (!pass.next) errs.next = 'Required'
    else if (pass.next.length < 6) errs.next = 'Minimum 6 characters'
    if (pass.next !== pass.confirm) errs.confirm = 'Passwords do not match'
    setPassErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    if (!validatePassword()) return
    setPassLoading(true)
    try {
      await api.put('/api/auth/password', {
        current_password: pass.current,
        new_password: pass.next,
      })
      setPass({ current: '', next: '', confirm: '' })
      toast.success('Password changed', 'Your password has been updated.')
    } catch (err) {
      toast.error('Change failed', getErrorMessage(err))
    } finally {
      setPassLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    try {
      await api.delete('/api/auth/account', { data: { password: deletePass } })
      toast.success('Account deleted', 'Your account has been removed.')
      logout()
    } catch (err) {
      toast.error('Delete failed', getErrorMessage(err))
      setDeleteLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  const initials = author?.author_name
    ? author.author_name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your account settings</p>
        </div>
      </div>

      <div style={{ padding: 'var(--gap-lg) var(--gap-xl) var(--gap-xl)' }}>
        <div className="profile-page">

          {/* ── Author info ─────────────────────────────── */}
          <div className="profile-section">
            <div className="profile-avatar-row">
              <div
                className="profile-avatar"
                style={{ background: author?.avatar_color || 'var(--primary)' }}
              >
                {initials}
              </div>
              <div className="profile-avatar-info">
                <h3>{author?.author_name}</h3>
                <p>{author?.email}</p>
                {stats && (
                  <p style={{ marginTop: 4, fontSize: '0.8rem', color: 'var(--text-3)' }}>
                    {stats.total_chapters} chapters · {stats.videos_uploaded} videos · {stats.total_storage_formatted} used
                  </p>
                )}
              </div>
            </div>

            <div className="profile-section-header">
              <div>
                <div className="profile-section-title">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <User size={16} /> Personal Info
                  </span>
                </div>
                <div className="profile-section-subtitle">Update your name, book title and bio</div>
              </div>
            </div>

            <form onSubmit={handleProfileSave} className="profile-section-body">
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Author Name</label>
                  <input
                    className="form-input"
                    type="text"
                    value={profile.author_name}
                    onChange={setP('author_name')}
                    placeholder="Your full name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Book Title</label>
                  <input
                    className="form-input"
                    type="text"
                    value={profile.book_title}
                    onChange={setP('book_title')}
                    placeholder="Your book title"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Bio <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  className="form-input form-textarea"
                  value={profile.bio}
                  onChange={setP('bio')}
                  placeholder="A short bio about yourself as an author…"
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                  {profileLoading ? <><span className="spinner spinner-sm" /> Saving…</> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* ── Change password ──────────────────────────── */}
          <div className="profile-section">
            <div className="profile-section-header">
              <div>
                <div className="profile-section-title">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Lock size={16} /> Change Password
                  </span>
                </div>
                <div className="profile-section-subtitle">Minimum 6 characters</div>
              </div>
            </div>

            <form onSubmit={handlePasswordSave} className="profile-section-body">
              {['current', 'next', 'confirm'].map((field, i) => {
                const labels = { current: 'Current Password', next: 'New Password', confirm: 'Confirm New Password' }
                return (
                  <div className="form-group" key={field}>
                    <label className="form-label">{labels[field]}</label>
                    <div className="input-wrapper">
                      <input
                        className={`form-input${passErrors[field] ? ' error' : ''}`}
                        type={showPass[field] ? 'text' : 'password'}
                        value={pass[field]}
                        onChange={(e) => {
                          setPass((p) => ({ ...p, [field]: e.target.value }))
                          setPassErrors((p) => ({ ...p, [field]: '' }))
                        }}
                        placeholder="••••••••"
                        autoComplete={field === 'current' ? 'current-password' : 'new-password'}
                      />
                      <button
                        type="button"
                        className="input-suffix-btn"
                        onClick={() => setShowPass((p) => ({ ...p, [field]: !p[field] }))}
                      >
                        {showPass[field] ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {passErrors[field] && <span className="field-error">{passErrors[field]}</span>}
                  </div>
                )
              })}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={passLoading}>
                  {passLoading ? <><span className="spinner spinner-sm" /> Updating…</> : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* ── Danger zone ──────────────────────────────── */}
          <div className="profile-section danger-zone">
            <div className="profile-section-header">
              <div>
                <div className="profile-section-title" style={{ color: 'var(--error)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertCircle size={16} /> Danger Zone
                  </span>
                </div>
                <div className="profile-section-subtitle">
                  Permanently delete your account and all data
                </div>
              </div>
            </div>

            <div className="profile-section-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
                This will delete your account, all chapters, and all uploaded videos.
                This action <strong style={{ color: 'var(--error)' }}>cannot be undone</strong>.
              </p>
              <div>
                <label className="form-label" style={{ marginBottom: 6, display: 'block' }}>
                  Enter your password to confirm deletion
                </label>
                <input
                  className="form-input"
                  type="password"
                  value={deletePass}
                  onChange={(e) => setDeletePass(e.target.value)}
                  placeholder="Your current password"
                  style={{ maxWidth: 320 }}
                />
              </div>
              <div>
                <button
                  className="btn btn-danger"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={!deletePass}
                >
                  <Trash2 size={15} /> Delete My Account
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete your account?"
        message="All chapters and uploaded videos will be permanently deleted. This cannot be undone."
        confirmLabel="Yes, Delete Everything"
        loading={deleteLoading}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}
