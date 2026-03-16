import { NavLink, useNavigate } from 'react-router-dom'
import {
  BookOpen, LayoutDashboard, List, User, LogOut, BookMarked,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Sidebar({ chapterCount = 0 }) {
  const { author, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  const initials = author?.author_name
    ? author.author_name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <BookOpen size={20} />
        </div>
        <div className="sidebar-logo-text">
          <h1>BookLegacy</h1>
          <span>Author Platform</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main</div>

        <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <LayoutDashboard className="nav-icon" size={18} />
          Dashboard
        </NavLink>

        <NavLink to="/chapters" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <List className="nav-icon" size={18} />
          Chapters
          {chapterCount > 0 && (
            <span className="nav-badge">{chapterCount}</span>
          )}
        </NavLink>

        <div className="sidebar-section-label" style={{ marginTop: 8 }}>Account</div>

        <NavLink to="/profile" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <User className="nav-icon" size={18} />
          Profile
        </NavLink>
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div
            className="user-avatar"
            style={{ background: author?.avatar_color || '#f97316' }}
          >
            {initials}
          </div>
          <div className="user-info">
            <div className="user-name">{author?.author_name || 'Author'}</div>
            <div className="user-email">{author?.email || ''}</div>
          </div>
          <button
            className="user-logout-btn btn-ghost btn-icon btn-sm"
            onClick={handleLogout}
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
