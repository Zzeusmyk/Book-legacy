import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import api from '../../api/client'

export default function Layout({ children }) {
  const [chapterCount, setChapterCount] = useState(0)

  useEffect(() => {
    api.get('/api/stats')
      .then((res) => setChapterCount(res.data.total_chapters || 0))
      .catch(() => {})
  }, [])

  return (
    <div className="app-shell">
      <Sidebar chapterCount={chapterCount} />
      <div className="app-content">
        <div className="page-scroll">
          {children}
        </div>
      </div>
    </div>
  )
}
