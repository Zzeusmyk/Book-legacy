import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((type, title, message, duration = 4000) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, type, title, message }])
    setTimeout(() => removeToast(id), duration)
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = {
    success: (title, message) => addToast('success', title, message),
    error:   (title, message) => addToast('error',   title, message, 6000),
    warning: (title, message) => addToast('warning', title, message),
    info:    (title, message) => addToast('info',    title, message),
  }

  return (
    <ToastContext.Provider value={{ toast, toasts, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
