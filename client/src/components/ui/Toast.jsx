import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

const icons = {
  success: <CheckCircle size={18} />,
  error:   <XCircle    size={18} />,
  warning: <AlertTriangle size={18} />,
  info:    <Info       size={18} />,
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className={`toast-icon ${t.type}`}>{icons[t.type]}</span>
          <div className="toast-content">
            <div className="toast-title">{t.title}</div>
            {t.message && <div className="toast-message">{t.message}</div>}
          </div>
          <button className="toast-close btn-ghost" onClick={() => removeToast(t.id)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
