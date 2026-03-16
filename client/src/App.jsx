import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import ToastContainer from './components/ui/Toast'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import ChaptersPage from './pages/ChaptersPage'
import ProfilePage from './pages/ProfilePage'

function PrivateRoute({ children }) {
  const { author, loading } = useAuth()
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', flexDirection: 'column', gap: 16
      }}>
        <div className="spinner spinner-lg" />
        <span style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>Loading…</span>
      </div>
    )
  }
  return author ? children : <Navigate to="/auth" replace />
}

function PublicRoute({ children }) {
  const { author, loading } = useAuth()
  if (loading) return null
  return author ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/auth" element={
          <PublicRoute><AuthPage /></PublicRoute>
        } />

        <Route path="/dashboard" element={
          <PrivateRoute>
            <Layout><DashboardPage /></Layout>
          </PrivateRoute>
        } />

        <Route path="/chapters" element={
          <PrivateRoute>
            <Layout><ChaptersPage /></Layout>
          </PrivateRoute>
        } />

        <Route path="/profile" element={
          <PrivateRoute>
            <Layout><ProfilePage /></Layout>
          </PrivateRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <ToastContainer />
    </>
  )
}
