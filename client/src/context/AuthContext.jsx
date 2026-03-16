import { createContext, useContext, useState, useEffect } from 'react'
import api, { getErrorMessage } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [author, setAuthor]   = useState(null)
  const [loading, setLoading] = useState(true)

  // Verify stored token on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    api.get('/api/auth/me')
      .then((res) => setAuthor(res.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    setAuthor(res.data.author)
    return res.data.author
  }

  const register = async (data) => {
    const res = await api.post('/api/auth/register', data)
    localStorage.setItem('token', res.data.token)
    setAuthor(res.data.author)
    return res.data.author
  }

  const logout = () => {
    localStorage.removeItem('token')
    setAuthor(null)
  }

  const updateAuthor = (data) => setAuthor((prev) => ({ ...prev, ...data }))

  return (
    <AuthContext.Provider value={{ author, loading, login, register, logout, updateAuthor }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
