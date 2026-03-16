import { useRef, useState } from 'react'
import { Upload, Trash2, X, Film } from 'lucide-react'
import { API_BASE } from '../../api/client'
import { useToast } from '../../context/ToastContext'
import ConfirmDialog from '../ui/ConfirmDialog'

function formatBytes(b) {
  if (!b) return ''
  const k = 1024
  const s = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(b) / Math.log(k))
  return `${(b / Math.pow(k, i)).toFixed(1)} ${s[i]}`
}

export default function VideoUploader({ chapter, onUpdated }) {
  const { toast } = useToast()
  const fileRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const xhrRef = useRef(null)

  const startUpload = (file) => {
    if (!file) return
    if (!file.type.startsWith('video/')) {
      toast.error('Invalid file', 'Please select a video file (mp4, webm, mov, etc.)')
      return
    }

    setUploading(true)
    setProgress(0)

    const formData = new FormData()
    formData.append('video', file)

    const xhr = new XMLHttpRequest()
    xhrRef.current = xhr

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
    }

    xhr.onload = () => {
      setUploading(false)
      setProgress(0)
      if (xhr.status === 200) {
        const updated = JSON.parse(xhr.responseText)
        onUpdated(updated)
        toast.success('Video uploaded', 'Your chapter video has been saved.')
      } else {
        const err = JSON.parse(xhr.responseText)
        toast.error('Upload failed', err?.error || 'Please try again.')
      }
    }

    xhr.onerror = () => {
      setUploading(false)
      setProgress(0)
      toast.error('Upload failed', 'Network error. Please check your connection.')
    }

    xhr.open('POST', `${API_BASE}/api/chapters/${chapter.id}/video`)
    xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`)
    xhr.send(formData)
  }

  const cancelUpload = () => {
    xhrRef.current?.abort()
    setUploading(false)
    setProgress(0)
  }

  const handleFileChange = (e) => startUpload(e.target.files?.[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    startUpload(e.dataTransfer.files?.[0])
  }

  const deleteVideo = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`${API_BASE}/api/chapters/${chapter.id}/video`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onUpdated(data)
      toast.success('Video removed', 'The video has been deleted.')
    } catch (err) {
      toast.error('Delete failed', err.message)
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  // === Has video ===
  if (chapter.video_url) {
    return (
      <div className="video-uploader">
        <div className="video-player-wrapper">
          <video
            src={`${API_BASE}${chapter.video_url}`}
            controls
            preload="metadata"
          />
        </div>
        <div className="video-info-row">
          <span className="flex items-center gap-xs">
            <Film size={13} />
            {chapter.video_original_name || chapter.video_filename}
            {chapter.video_size ? ` · ${formatBytes(chapter.video_size)}` : ''}
          </span>
          <div className="flex items-center gap-sm">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              <Upload size={13} /> Replace
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={13} /> Remove
            </button>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <ConfirmDialog
          isOpen={confirmDelete}
          title="Remove video?"
          message="This will permanently delete the video for this chapter. You can upload a new one later."
          confirmLabel="Remove Video"
          loading={deleting}
          onConfirm={deleteVideo}
          onCancel={() => setConfirmDelete(false)}
        />
      </div>
    )
  }

  // === Uploading ===
  if (uploading) {
    return (
      <div style={{ padding: 'var(--gap-md)' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--gap-sm)' }}>
          <span className="text-sm text-muted">Uploading video…</span>
          <button className="btn btn-ghost btn-sm" onClick={cancelUpload}>
            <X size={14} /> Cancel
          </button>
        </div>
        <div className="upload-progress-bar">
          <div className="upload-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="upload-status">
          <span>{progress}%</span>
          <span>Please wait…</span>
        </div>
      </div>
    )
  }

  // === No video / drop zone ===
  return (
    <div className="video-uploader">
      <div
        className={`drop-zone${dragging ? ' drag-over' : ''}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <Upload size={28} className="drop-zone-icon" />
        <div>
          <div className="drop-zone-text">
            <strong>Click to upload</strong> or drag & drop
          </div>
          <div className="drop-zone-subtext">MP4, WebM, MOV, AVI, MKV · up to 2GB</div>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  )
}
