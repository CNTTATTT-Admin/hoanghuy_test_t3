import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import { apiGet, apiPost } from '../../../services/apiClient'

interface Comment {
  author:     string
  text:       string
  created_at: string
}

interface CommentDialogProps {
  open:    boolean
  alertId: string | null
  onClose: () => void
}

export function CommentDialog({ open, alertId, onClose }: CommentDialogProps) {
  const [text,     setText]     = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [loading,  setLoading]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const fetchComments = () => {
    if (!alertId) return
    setLoading(true)
    apiGet<{ comments: Comment[] }>(`/api/v1/alerts/${alertId}/comments`)
      .then((data) => setComments(data.comments ?? []))
      .catch(() => setError('Không thể tải danh sách ghi chú'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (open && alertId) {
      setError(null)
      setText('')
      fetchComments()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, alertId])

  const handleSubmit = async () => {
    if (!alertId || !text.trim()) return
    setSaving(true)
    setError(null)
    try {
      await apiPost(`/api/v1/alerts/${alertId}/comments`, { text: text.trim() })
      setText('')
      fetchComments()
    } catch {
      setError('Gửi ghi chú thất bại, thử lại sau')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { bgcolor: '#111827', border: '1px solid #1e2330' } }}
    >
      <DialogTitle sx={{ color: '#e2e8f0', fontSize: '15px', fontWeight: 700 }}>
        Ghi chú điều tra
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Danh sách comments */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} sx={{ color: '#818cf8' }} />
          </Box>
        ) : comments.length > 0 ? (
          <Box sx={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {comments.map((c, i) => (
              <Box
                key={i}
                sx={{ pl: 2, borderLeft: '2px solid #1e2330', '&:hover': { borderLeftColor: '#818cf8' } }}
              >
                <Typography sx={{ fontSize: '11px', color: '#818cf8', fontWeight: 600 }}>
                  {c.author} · {new Date(c.created_at).toLocaleString('vi-VN')}
                </Typography>
                <Typography sx={{ fontSize: '13px', color: '#e2e8f0', mt: 0.25, whiteSpace: 'pre-wrap' }}>
                  {c.text}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography sx={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic', py: 1 }}>
            Chưa có ghi chú nào
          </Typography>
        )}

        <Divider sx={{ borderColor: '#1e2330' }} />

        {/* Input ghi chú mới */}
        {error && (
          <Typography sx={{ color: '#ef4444', fontSize: '12px' }}>{error}</Typography>
        )}
        <TextField
          multiline
          rows={3}
          fullWidth
          size="small"
          placeholder="Nhập ghi chú điều tra..."
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 1000))}
          helperText={`${text.length}/1000`}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#0d1117',
              color: '#e2e8f0',
              fontSize: '13px',
              '& fieldset': { borderColor: '#1e2330' },
              '&:hover fieldset': { borderColor: '#374151' },
              '&.Mui-focused fieldset': { borderColor: '#6366f1' },
            },
            '& .MuiFormHelperText-root': { color: '#6b7280', fontSize: '11px' },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          size="small"
          sx={{ color: '#9ca3af', textTransform: 'none', fontSize: '12px' }}
        >
          Đóng
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="small"
          disabled={!text.trim() || saving}
          sx={{
            bgcolor: '#6366f1',
            textTransform: 'none',
            fontSize: '12px',
            '&:hover': { bgcolor: '#4f46e5' },
          }}
        >
          {saving ? 'Đang gửi...' : 'Gửi ghi chú'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
