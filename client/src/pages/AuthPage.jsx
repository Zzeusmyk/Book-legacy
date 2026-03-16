import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Eye, EyeOff, AlertCircle, Video, Upload, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/client'

export default function AuthPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirm_password: '',
    author_name: '',
    book_title: '',
  })

  const [fieldErrors, setFieldErrors] = useState({})

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }))
    setFieldErrors((p) => ({ ...p, [field]: '' }))
    setError('')
  }

  const validate = () => {
    const errs = {}
    if (!form.email) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address'

    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters'

    if (mode === 'register') {
      if (!form.author_name.trim()) errs.author_name = 'Author name is required'
      if (!form.book_title.trim())  errs.book_title  = 'Book title is required'
      if (form.confirm_password !== form.password) errs.confirm_password = 'Passwords do not match'
    }

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setError('')
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        await register({
          email: form.email,
          password: form.password,
          author_name: form.author_name,
          book_title: form.book_title,
        })
      }
      navigate('/dashboard')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (m) => {
    setMode(m)
    setError('')
    setFieldErrors({})
    setForm({ email: '', password: '', confirm_password: '', author_name: '', book_title: '' })
  }

  return (
    <div className="auth-page">
      {/* Left — form */}
      <div className="auth-left">
        <div className="auth-left-bg" />
        <div className="auth-card">
          {/* Brand */}
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <BookOpen size={22} />
            </div>
            <span className="auth-brand-name">BookLegacy</span>
          </div>

          {/* Heading */}
          <h2 className="auth-heading">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="auth-subheading">
            {mode === 'login'
              ? 'Sign in to continue to your author dashboard'
              : 'Start building your book video library today'}
          </p>

          {/* Tabs */}
          <div className="tab-bar" style={{ marginBottom: 'var(--gap-lg)' }}>
            <button
              className={`tab-btn${mode === 'login' ? ' active' : ''}`}
              onClick={() => switchMode('login')}
              type="button"
            >
              Sign In
            </button>
            <button
              className={`tab-btn${mode === 'register' ? ' active' : ''}`}
              onClick={() => switchMode('register')}
              type="button"
            >
              Register
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="auth-error" style={{ marginBottom: 'var(--gap-md)' }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {mode === 'register' && (
              <div className="auth-form-row">
                <div className="form-group">
                  <label className="form-label">Author Name</label>
                  <input
                    className={`form-input${fieldErrors.author_name ? ' error' : ''}`}
                    type="text"
                    value={form.author_name}
                    onChange={set('author_name')}
                    placeholder="Your full name"
                    autoComplete="name"
                  />
                  {fieldErrors.author_name && (
                    <span className="field-error">{fieldErrors.author_name}</span>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Book Title</label>
                  <input
                    className={`form-input${fieldErrors.book_title ? ' error' : ''}`}
                    type="text"
                    value={form.book_title}
                    onChange={set('book_title')}
                    placeholder="Your book title"
                  />
                  {fieldErrors.book_title && (
                    <span className="field-error">{fieldErrors.book_title}</span>
                  )}
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className={`form-input${fieldErrors.email ? ' error' : ''}`}
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {fieldErrors.email && (
                <span className="field-error">{fieldErrors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <input
                  className={`form-input${fieldErrors.password ? ' error' : ''}`}
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Minimum 6 characters"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="input-suffix-btn"
                  onClick={() => setShowPass((p) => !p)}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && (
                <span className="field-error">{fieldErrors.password}</span>
              )}
            </div>

            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-wrapper">
                  <input
                    className={`form-input${fieldErrors.confirm_password ? ' error' : ''}`}
                    type={showConfirmPass ? 'text' : 'password'}
                    value={form.confirm_password}
                    onChange={set('confirm_password')}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="input-suffix-btn"
                    onClick={() => setShowConfirmPass((p) => !p)}
                  >
                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.confirm_password && (
                  <span className="field-error">{fieldErrors.confirm_password}</span>
                )}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
              style={{ marginTop: 4 }}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <p className="auth-switch">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              className="auth-switch-btn"
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              type="button"
            >
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>

      {/* Right — hero */}
      <div className="auth-right">
        <div className="auth-right-bg" />
        <div className="auth-hero">
          <div className="auth-hero-icon">
            <BookOpen size={40} />
          </div>
          <h2 className="auth-hero-title">Your book, brought to life</h2>
          <p className="auth-hero-subtitle">
            Upload chapter videos, track your progress, and build a complete
            multimedia library for your readers.
          </p>
          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon" style={{ background: 'var(--primary-muted)' }}>
                <Upload size={16} color="var(--primary)" />
              </div>
              <span className="auth-feature-text">Drag & drop video uploads up to 2GB</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon" style={{ background: 'var(--success-muted)' }}>
                <Video size={16} color="var(--success)" />
              </div>
              <span className="auth-feature-text">Built-in video player per chapter</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon" style={{ background: 'var(--info-muted)' }}>
                <Shield size={16} color="var(--info)" />
              </div>
              <span className="auth-feature-text">Secure, private author accounts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
