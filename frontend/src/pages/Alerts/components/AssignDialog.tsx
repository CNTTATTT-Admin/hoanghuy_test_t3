import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import { apiGet, apiPut } from '../../../services/apiClient'

interface Analyst {
  email:     string
  full_name: string
}

interface AssignDialogProps {
  open:             boolean
  alertId:          string | null
  currentAssignee?: string
  onClose:          () => void
  onAssigned:       (assignee: string) => void
}

export function AssignDialog({ open, alertId, currentAssignee, onClose, onAssigned }: AssignDialogProps) {
  const [selected,  setSelected]  = useState(currentAssignee ?? '')
  const [analysts,  setAnalysts]  = useState<Analyst[]>([])
  const [loading,   setLoading]   = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setSelected(currentAssignee ?? '')
    setLoading(true)
    setError(null)
    apiGet<{ analysts: Analyst[] }>('/api/v1/alerts/analysts')
      .then((data) => setAnalysts(data.analysts ?? []))
      .catch(() => setError('Không thể tải danh sách analyst'))
      .finally(() => setLoading(false))
  }, [open, currentAssignee])

  const handleAssign = async () => {
    if (!alertId || !selected) return
    setSaving(true)
    try {
      await apiPut(`/api/v1/alerts/${alertId}/assign`, { assignee: selected })
      onAssigned(selected)
      onClose()
    } catch {
      setError('Phân công thất bại, thử lại sau')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { bgcolor: '#111827', border: '1px solid #1e2330' } }}
    >
      <DialogTitle sx={{ color: '#e2e8f0', fontSize: '15px', fontWeight: 700 }}>
        Phân công xử lý
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={28} sx={{ color: '#818cf8' }} />
          </Box>
        ) : (
          <>
            {error && (
              <Typography sx={{ color: '#ef4444', fontSize: '12px', mb: 1.5 }}>{error}</Typography>
            )}
            <FormControl fullWidth size="small" sx={{ mt: 1 }}>
              <InputLabel sx={{ color: '#6b7280', fontSize: '12px' }}>Chọn analyst</InputLabel>
              <Select
                value={selected}
                label="Chọn analyst"
                onChange={(e) => setSelected(e.target.value)}
                sx={{
                  bgcolor: '#0d1117',
                  color: '#e2e8f0',
                  fontSize: '13px',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1e2330' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#374151' },
                  '& .MuiSvgIcon-root': { color: '#6b7280' },
                }}
                MenuProps={{ PaperProps: { sx: { bgcolor: '#111827', border: '1px solid #1e2330' } } }}
              >
                {analysts.map((a) => (
                  <MenuItem
                    key={a.email}
                    value={a.email}
                    sx={{ fontSize: '13px', color: '#e2e8f0', '&:hover': { bgcolor: '#1a2035' } }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: '13px', color: '#e2e8f0' }}>{a.full_name}</Typography>
                      <Typography sx={{ fontSize: '11px', color: '#6b7280' }}>{a.email}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {currentAssignee && currentAssignee !== 'Chưa phân công' && (
              <Typography sx={{ fontSize: '11px', color: '#6b7280', mt: 1 }}>
                Đang phân công cho: <strong style={{ color: '#818cf8' }}>{currentAssignee}</strong>
              </Typography>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          size="small"
          sx={{ color: '#9ca3af', textTransform: 'none', fontSize: '12px' }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          size="small"
          disabled={!selected || saving}
          sx={{
            bgcolor: '#6366f1',
            textTransform: 'none',
            fontSize: '12px',
            '&:hover': { bgcolor: '#4f46e5' },
          }}
        >
          {saving ? 'Đang lưu...' : 'Phân công'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
